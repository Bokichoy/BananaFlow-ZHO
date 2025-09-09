
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Node, Edge, Point } from './types';
import { NodeType, NodeStatus } from './types';
import Sidebar from './components/Sidebar';
import NodeComponent from './components/Node';
import EdgeComponent from './components/Edge';
import { PlayIcon } from './components/icons';
import * as geminiService from './services/geminiService';

const createNode = (type: NodeType, position: Point): Node => {
  const id = crypto.randomUUID();
  const baseNode = { id, type, position, data: { status: NodeStatus.IDLE, content: null, inputs: [], outputs: [], scale: 1 } };

  switch (type) {
    case NodeType.TEXT_INPUT:
      return { ...baseNode, data: { ...baseNode.data, label: 'Text Input', outputs: [{ id: `${id}-output`, label: 'Text', type: 'text' }] } };
    case NodeType.IMAGE_INPUT:
      return { ...baseNode, data: { ...baseNode.data, label: 'Image Input', outputs: [{ id: `${id}-output`, label: 'Image', type: 'image' }] } };
    case NodeType.TEXT_GENERATOR:
      return { ...baseNode, data: { ...baseNode.data, label: 'Text Generator', inputs: [{ id: `${id}-input`, label: 'Prompt', type: 'text' }], outputs: [{ id: `${id}-output`, label: 'Text', type: 'text' }] } };
    case NodeType.IMAGE_EDITOR:
      return { ...baseNode, data: { ...baseNode.data, label: 'Image Editor', inputs: [{ id: `${id}-input-image`, label: 'Image', type: 'image' }, { id: `${id}-input-text`, label: 'Prompt', type: 'text' }], outputs: [{ id: `${id}-output-image`, label: 'Image', type: 'image' }, { id: `${id}-output-text`, label: 'Text', type: 'text' }] } };
    case NodeType.VIDEO_GENERATOR:
      return { ...baseNode, data: { ...baseNode.data, label: 'Video Generator', inputs: [{ id: `${id}-input-image`, label: 'Image (Opt.)', type: 'image' }, { id: `${id}-input-text`, label: 'Prompt', type: 'text' }], outputs: [{ id: `${id}-output`, label: 'Video', type: 'video' }] } };
    case NodeType.OUTPUT_DISPLAY:
      return { ...baseNode, data: { ...baseNode.data, label: 'Output', inputs: [{ id: `${id}-input`, label: 'Input', type: 'any' }] } };
    default:
      throw new Error("Unknown node type");
  }
};

const App: React.FC = () => {
  const [nodes, setNodes] = useState<Record<string, Node>>({});
  const [edges, setEdges] = useState<Record<string, Edge>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewTransform, setViewTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [connectingEdgeEnd, setConnectingEdgeEnd] = useState<Point | null>(null);

  const draggingNode = useRef<{ id: string; offset: Point } | null>(null);
  const connectingEdge = useRef<{ sourceNodeId: string; sourceHandleId: string; } | null>(null);
  const panState = useRef<{ startX: number, startY: number } | null>(null);
  const resizingNode = useRef<{ id: string, startX: number, startScale: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addNode = useCallback((type: NodeType) => {
    const newNode = createNode(type, { 
        x: (300 - viewTransform.x) / viewTransform.scale, 
        y: (150 - viewTransform.y) / viewTransform.scale
    });
    setNodes(prev => ({ ...prev, [newNode.id]: newNode }));
  }, [viewTransform]);

  const updateNodeData = useCallback((nodeId: string, data: Partial<Node['data']>) => {
    setNodes(prev => {
        if (!prev[nodeId]) return prev;
        return {
            ...prev,
            [nodeId]: { ...prev[nodeId], data: { ...prev[nodeId].data, ...data } },
        }
    });
  }, []);
  
  const getHandlePosition = useCallback((nodeId: string, handleId: string): Point => {
    const handleElem = document.getElementById(handleId);
    if (!handleElem) return { x: 0, y: 0 };
    
    // getBoundingClientRect provides position relative to the viewport.
    const handleRect = handleElem.getBoundingClientRect();
    const canvasRect = canvasRef.current!.getBoundingClientRect();

    // Calculate position relative to the canvas container.
    const screenX = handleRect.left + handleRect.width / 2 - canvasRect.left;
    const screenY = handleRect.top + handleRect.height / 2 - canvasRect.top;
    
    // Convert screen coordinates to world coordinates by inverting the view transform.
    const worldX = (screenX - viewTransform.x) / viewTransform.scale;
    const worldY = (screenY - viewTransform.y) / viewTransform.scale;

    return { x: worldX, y: worldY };
  }, [viewTransform]);

  const handleMouseDownNode = useCallback((e: React.MouseEvent<HTMLDivElement>, nodeId: string) => {
    if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
    e.stopPropagation();
    const node = nodes[nodeId];
    // Convert world position to screen position to calculate offset
    const screenX = node.position.x * viewTransform.scale + viewTransform.x;
    const screenY = node.position.y * viewTransform.scale + viewTransform.y;
    draggingNode.current = {
      id: nodeId,
      offset: { x: e.clientX - screenX, y: e.clientY - screenY },
    };
  }, [nodes, viewTransform]);

  const handleMouseDownHandle = useCallback((e: React.MouseEvent<HTMLDivElement>, nodeId: string, handleId: string, handleType: 'input' | 'output') => {
    e.stopPropagation();
    if (handleType === 'output') {
      connectingEdge.current = { sourceNodeId: nodeId, sourceHandleId: handleId };
      setConnectingEdgeEnd(getHandlePosition(nodeId, handleId));
    }
  }, [getHandlePosition]);

   const handleResizeMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, nodeId: string) => {
    e.stopPropagation();
    resizingNode.current = {
        id: nodeId,
        startX: e.clientX,
        startScale: nodes[nodeId].data.scale || 1,
    };
   },[nodes]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (resizingNode.current) {
            const { id, startX, startScale } = resizingNode.current;
            const dx = e.clientX - startX;
            const newScale = Math.max(0.5, Math.min(2.5, startScale + dx / 150));
            updateNodeData(id, { scale: newScale });
        } else if (panState.current) {
            const dx = e.clientX - panState.current.startX;
            const dy = e.clientY - panState.current.startY;
            setViewTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            panState.current = { startX: e.clientX, startY: e.clientY };
        } else if (draggingNode.current) {
            const { id, offset } = draggingNode.current;
            const newPos = { 
                x: (e.clientX - offset.x - viewTransform.x) / viewTransform.scale, 
                y: (e.clientY - offset.y - viewTransform.y) / viewTransform.scale 
            };
            setNodes(prev => ({ ...prev, [id]: { ...prev[id], position: newPos } }));
        } else if (connectingEdge.current) {
            const canvasRect = canvasRef.current?.getBoundingClientRect();
            if(canvasRect) {
                const worldX = (e.clientX - canvasRect.left - viewTransform.x) / viewTransform.scale;
                const worldY = (e.clientY - canvasRect.top - viewTransform.y) / viewTransform.scale;
                setConnectingEdgeEnd({ x: worldX, y: worldY });
            }
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (connectingEdge.current) {
            const target = e.target as HTMLElement;
            const targetHandle = target.closest('[data-handle-type="input"]');

            if (targetHandle) {
                const targetHandleId = targetHandle.id;
                const targetNodeElement = targetHandle.closest('[data-node-id]');
                const targetNodeId = targetNodeElement?.getAttribute('data-node-id');
                const { sourceNodeId, sourceHandleId } = connectingEdge.current;
                
                if (targetNodeId && sourceNodeId !== targetNodeId) {
                    const newEdge: Edge = {
                        id: crypto.randomUUID(),
                        sourceNodeId,
                        sourceHandleId,
                        targetNodeId,
                        targetHandleId,
                    };
                    setEdges(prev => ({ ...prev, [newEdge.id]: newEdge }));
                }
            }
        }
        if (panState.current && canvasRef.current) canvasRef.current.style.cursor = 'default';

        draggingNode.current = null;
        connectingEdge.current = null;
        panState.current = null;
        resizingNode.current = null;
        setConnectingEdgeEnd(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [viewTransform, updateNodeData]);

  const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.1;
      const { deltaY } = e;
      const { left, top } = canvasRef.current!.getBoundingClientRect();
      
      const mouseX = e.clientX - left;
      const mouseY = e.clientY - top;

      const newScale = deltaY < 0 ? viewTransform.scale * zoomFactor : viewTransform.scale / zoomFactor;
      const clampedScale = Math.max(0.2, Math.min(2.5, newScale));

      const worldX = (mouseX - viewTransform.x) / viewTransform.scale;
      const worldY = (mouseY - viewTransform.y) / viewTransform.scale;

      const newX = mouseX - worldX * clampedScale;
      const newY = mouseY - worldY * clampedScale;

      setViewTransform({ scale: clampedScale, x: newX, y: newY });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
          panState.current = { startX: e.clientX, startY: e.clientY };
          canvasRef.current!.style.cursor = 'grabbing';
      }
  };


  const runWorkflow = useCallback(async () => {
    setIsProcessing(true);
    
    setNodes(prev => {
        const newNodes = {...prev};
        Object.keys(newNodes).forEach(id => {
            newNodes[id].data.status = NodeStatus.IDLE;
            newNodes[id].data.errorMessage = undefined;
            if(newNodes[id].type !== NodeType.TEXT_INPUT && newNodes[id].type !== NodeType.IMAGE_INPUT) {
                newNodes[id].data.content = null;
            }
        });
        return newNodes;
    });

    const nodeIds = Object.keys(nodes);
    const adj: Record<string, string[]> = nodeIds.reduce((acc, id) => ({ ...acc, [id]: [] }), {});
    const inDegree: Record<string, number> = nodeIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});

    Object.values(edges).forEach(edge => {
      adj[edge.sourceNodeId].push(edge.targetNodeId);
      inDegree[edge.targetNodeId]++;
    });

    const queue = nodeIds.filter(id => inDegree[id] === 0);
    const executionOrder: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      executionOrder.push(u);
      adj[u]?.forEach(v => {
        inDegree[v]--;
        if (inDegree[v] === 0) queue.push(v);
      });
    }

    const nodeOutputs: Record<string, any> = {};

    for (const nodeId of executionOrder) {
      const node = nodes[nodeId];
      updateNodeData(nodeId, { status: NodeStatus.PROCESSING, content: { progress: 'Starting...' } });

      try {
        const inputEdges = Object.values(edges).filter(e => e.targetNodeId === nodeId);
        const inputs: Record<string, any> = {};
        for (const edge of inputEdges) {
          inputs[edge.targetHandleId] = nodeOutputs[edge.sourceHandleId];
        }

        let output: any;

        switch (node.type) {
            case NodeType.TEXT_INPUT:
            case NodeType.IMAGE_INPUT:
              output = node.data.content;
              break;
            case NodeType.TEXT_GENERATOR:
              const prompt = inputs[`${nodeId}-input`];
              output = await geminiService.generateText(prompt);
              break;
            case NodeType.IMAGE_EDITOR: {
              const imageInput = inputs[`${nodeId}-input-image`];
              const textInput = inputs[`${nodeId}-input-text`];
              
              let imageFile: {data: string, mimeType: string} | null = null;
              
              if (imageInput instanceof File) {
                  const part = await geminiService.utils.fileToGenerativePart(imageInput);
                  imageFile = { data: part.inlineData.data, mimeType: part.inlineData.mimeType };
              } else if (typeof imageInput === 'string' && imageInput.startsWith('data:image')) {
                  const [meta, base64] = imageInput.split(',');
                  const mimeType = meta.split(':')[1].split(';')[0];
                  imageFile = { data: base64, mimeType };
              }

              if (imageFile && textInput) {
                  const result = await geminiService.editImage(imageFile.data, imageFile.mimeType, textInput);
                  if (result && result.newBase64Image) {
                      output = { image: `data:${imageFile.mimeType};base64,${result.newBase64Image}`, text: result.text };
                  } else {
                      throw new Error(result.text || "Image editing failed to produce an image.");
                  }
              } else {
                  throw new Error("Missing image or prompt for Image Editor.");
              }
              break;
            }
            case NodeType.VIDEO_GENERATOR: {
              const imageInput = inputs[`${nodeId}-input-image`];
              const textInput = inputs[`${nodeId}-input-text`];
              let base64: string | null = null;
              let mimeType: string | null = null;

              if (imageInput instanceof File) {
                 const part = await geminiService.utils.fileToGenerativePart(imageInput);
                 base64 = part.inlineData.data;
                 mimeType = part.inlineData.mimeType;
              } else if (typeof imageInput === 'string' && imageInput.startsWith('data:image')) {
                  const [meta, b64] = imageInput.split(',');
                  mimeType = meta.split(':')[1].split(';')[0];
                  base64 = b64;
              }
              output = await geminiService.generateVideo(base64, mimeType, textInput, (progress) => {
                  updateNodeData(nodeId, { content: { progress } });
              });
              break;
            }
            case NodeType.OUTPUT_DISPLAY:
              output = inputs[`${nodeId}-input`];
              break;
        }

        updateNodeData(nodeId, { status: NodeStatus.COMPLETED, content: output });
        
        node.data.outputs.forEach(o => {
          if (node.type === NodeType.IMAGE_EDITOR && output && typeof output === 'object' && 'image' in output) {
            nodeOutputs[o.id] = o.type === 'image' ? output.image : output.text;
          } else {
            nodeOutputs[o.id] = output;
          }
        });

      } catch (error) {
        console.error("Workflow error at node", nodeId, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        updateNodeData(nodeId, { status: NodeStatus.ERROR, errorMessage });
        setIsProcessing(false);
        return;
      }
    }

    setIsProcessing(false);
  }, [nodes, edges, updateNodeData]);
  
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-gray-900">
      <Sidebar onAddNode={addNode} />
      <div
        ref={canvasRef}
        className="relative flex-grow h-full overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
      >
        <div className="absolute top-4 right-4 z-20">
            <button
                onClick={runWorkflow}
                disabled={isProcessing}
                className="flex items-center px-6 py-3 font-bold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-105"
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 mr-3 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        Processing...
                    </>
                ) : (
                    <>
                        <PlayIcon className="w-6 h-6 mr-2" />
                        Run Workflow
                    </>
                )}
            </button>
        </div>
        
        <div
            className="absolute top-0 left-0 w-full h-full"
            style={{ 
                transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`,
                transformOrigin: '0 0'
            }}
        >
            <svg className="absolute top-0 left-0 overflow-visible pointer-events-none" style={{ width: '100%', height: '100%' }}>
              {Object.values(edges).map(edge => {
                const startPos = getHandlePosition(edge.sourceNodeId, edge.sourceHandleId);
                const endPos = getHandlePosition(edge.targetNodeId, edge.targetHandleId);
                return <EdgeComponent key={edge.id} start={startPos} end={endPos} />;
              })}

              {connectingEdge.current && connectingEdgeEnd && (
                  <EdgeComponent 
                      start={getHandlePosition(connectingEdge.current.sourceNodeId, connectingEdge.current.sourceHandleId)} 
                      end={connectingEdgeEnd} 
                  />
              )}
            </svg>

            {Object.values(nodes).map(node => (
               <div key={node.id} data-node-id={node.id}>
                 <NodeComponent
                    node={node}
                    onMouseDown={handleMouseDownNode}
                    onHandleMouseDown={handleMouseDownHandle}
                    onResizeMouseDown={handleResizeMouseDown}
                    updateNodeData={updateNodeData}
                 />
               </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default App;