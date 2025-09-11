import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { Node as NodeTypeInterface, Theme } from '../types';
import { NodeType, NodeStatus } from '../types';
import { TextIcon, ImageIcon, MagicIcon, VideoIcon, OutputIcon, StarIcon, MuteIcon } from './icons';
import { FileUploader } from './FileUploader';
import { OutputDisplay } from './OutputDisplay';

interface NodeProps {
  node: NodeTypeInterface;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>, nodeId: string) => void;
  onHandleMouseDown: (e: React.MouseEvent<HTMLDivElement>, nodeId: string, handleId: string, handleType: 'input' | 'output') => void;
  onResizeMouseDown: (e: React.MouseEvent<HTMLDivElement>, nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeTypeInterface['data']>) => void;
  onEditPrompt: (nodeId: string) => void;
  edgeColors: Theme['edgeColors'];
}

interface HandleProps {
  id: string;
  label: string;
  isInput: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  type: 'text' | 'image' | 'video' | 'any';
  style?: React.CSSProperties;
  edgeColors: Theme['edgeColors'];
}

const Handle: React.FC<HandleProps> = ({ id, label, isInput, onMouseDown, type, style, edgeColors }) => {
    const color = edgeColors?.[type] || '#a3a3a3';

    return (
        <div
            className={`absolute -translate-y-1/2 ${isInput ? '-left-3' : '-right-3'} group/handle`}
            style={style}
        >
            <div
                id={id}
                data-handle-type={isInput ? 'input' : 'output'}
                onMouseDown={onMouseDown}
                className="w-6 h-6 rounded-full bg-neutral-800/80 border-2 border-black/50 group-hover/node:bg-indigo-500 cursor-pointer transition-all duration-300 scale-0 group-hover/node:scale-100 flex items-center justify-center"
            >
                <div style={{ backgroundColor: color }} className={`w-2 h-2 rounded-full`} />
            </div>
            <span className={`absolute top-1/2 -translate-y-1/2 ${isInput ? 'left-full ml-4' : 'right-full mr-4'} text-xs text-white bg-black/50 px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover/handle:opacity-100 transition-opacity pointer-events-none`}>
                {label}
            </span>
        </div>
    );
};


const NodeComponent: React.FC<NodeProps> = ({ node, isSelected, onMouseDown, onHandleMouseDown, onResizeMouseDown, updateNodeData, onEditPrompt, edgeColors }) => {
  const { data } = node;
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const config = useMemo(() => {
    switch (node.type) {
      case NodeType.TEXT_INPUT: return { icon: <TextIcon className="w-4 h-4" />, title: data.label };
      case NodeType.IMAGE_INPUT: return { icon: <ImageIcon className="w-4 h-4" />, title: data.label };
      case NodeType.TEXT_GENERATOR: return { icon: <MagicIcon className="w-4 h-4" />, title: data.label };
      case NodeType.IMAGE_EDITOR: return { icon: <MagicIcon className="w-4 h-4" />, title: data.label };
      case NodeType.PROMPT_PRESET: return { icon: null, title: data.label };
      case NodeType.VIDEO_GENERATOR: return { icon: <VideoIcon className="w-4 h-4" />, title: data.label };
      case NodeType.OUTPUT_DISPLAY: return { icon: <OutputIcon className="w-4 h-4" />, title: data.label };
      default: return { icon: null, title: 'Unknown' };
    }
  }, [node.type, data.label]);

  useEffect(() => {
    let objectUrl: string | undefined;
    if (data.content instanceof File) {
      objectUrl = URL.createObjectURL(data.content);
      setImageUrl(objectUrl);
    } else if (typeof data.content === 'string' && data.content.startsWith('data:image')) {
      setImageUrl(data.content);
    } else if (data.content?.image) {
      setImageUrl(data.content.image);
    } else {
      setImageUrl(null);
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [data.content]);

  useEffect(() => {
    if (imageUrl && (node.type === NodeType.IMAGE_INPUT || node.type === NodeType.OUTPUT_DISPLAY)) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.height / img.width;
        const newWidth = data.width || 350;
        const newHeight = newWidth * aspectRatio;
        if (Math.abs((data.height || 0) - newHeight) > 1) {
          updateNodeData(node.id, { height: newHeight });
        }
      };
      img.src = imageUrl;
    }
  }, [imageUrl, data.width, data.height, node.id, updateNodeData, node.type]);
  
  const statusClasses = useMemo(() => {
    switch (data.status) {
      case NodeStatus.PROCESSING: return 'border-indigo-500/80 ring-2 ring-indigo-500/50 animate-pulse';
      case NodeStatus.ERROR: return 'border-red-500/80';
      case NodeStatus.COMPLETED:
      default: // IDLE
        return isSelected ? 'ring-2 ring-blue-500/60 border-transparent' : 'border-transparent';
    }
  }, [data.status, isSelected]);

  const renderNodeContent = useCallback(() => {
    switch (node.type) {
      case NodeType.TEXT_INPUT:
        return (
          <textarea
            className="w-full h-full p-4 text-sm bg-transparent focus:outline-none resize-none placeholder-white/40"
            style={{ color: 'var(--node-text-color, #ffffff)' }}
            value={data.content || ''}
            onChange={(e) => updateNodeData(node.id, { content: e.target.value })}
            placeholder="Enter text..."
          />
        );
      case NodeType.IMAGE_INPUT:
        return data.content ? (
            <div className="relative w-full h-full group/image-input">
                <img src={imageUrl!} alt="Input" className="object-contain w-full h-full" />
                <button
                    onClick={() => updateNodeData(node.id, { content: null })}
                    className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover/image-input:opacity-100 transition-opacity z-10"
                    aria-label="Remove image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        ) : <div className="p-2 w-full h-full"><FileUploader onFileUpload={(file) => updateNodeData(node.id, { content: file })} /></div>;
      case NodeType.TEXT_GENERATOR:
      case NodeType.IMAGE_EDITOR:
      case NodeType.VIDEO_GENERATOR:
        return <div className="flex items-center justify-center h-full text-xs p-4 text-center" style={{ color: 'var(--node-text-color, #ffffff)', opacity: 0.7 }}>Ready for input</div>;
      case NodeType.PROMPT_PRESET:
        return (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => onEditPrompt(node.id)}
              className="text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--node-text-color, #ffffff)' }}
            >
              修改提示词
            </button>
          </div>
        );
      case NodeType.OUTPUT_DISPLAY:
        return <OutputDisplay content={data.content} status={data.status} errorMessage={data.errorMessage} progressMessage={data.content?.progress} />;
      default:
        return null;
    }
  }, [node.type, data, node.id, updateNodeData, imageUrl, onEditPrompt]);
  
  const width = data.width || 320;
  const height = data.height || (node.type === NodeType.IMAGE_INPUT || node.type === NodeType.OUTPUT_DISPLAY ? 350 : 150);
  const isPresetNode = node.type === NodeType.PROMPT_PRESET;

  return (
    <>
      <div
        className={`absolute flex flex-col ${isPresetNode ? 'items-center' : ''}`}
        style={{
          left: node.position.x,
          top: node.position.y,
          width: `${width}px`,
          zIndex: node.zIndex,
        }}
      >
        <div 
          className="flex items-center gap-2 mb-2 px-1 cursor-move"
          style={{ color: 'var(--node-text-color, #ffffff)' }}
          onMouseDown={(e) => onMouseDown(e, node.id)}
        >
          {config.icon}
          <h3 className="text-xs font-bold truncate">{config.title}</h3>
          {data.isMuted && <MuteIcon className="w-4 h-4 opacity-70" title="This node is muted" />}
        </div>

        <div
          data-node-id={node.id}
          className={`relative group/node backdrop-blur-xl shadow-2xl transition-all duration-200 ease-in-out border ${statusClasses} ${data.isMuted ? 'opacity-50' : ''} ${isPresetNode ? 'rounded-full' : 'rounded-2xl'}`}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: 'var(--node-background-color)',
          }}
          onMouseDown={(e) => onMouseDown(e, node.id)}
        >
          <div className={`relative w-full h-full overflow-hidden ${isPresetNode ? 'rounded-full' : 'rounded-2xl'}`}>
            {renderNodeContent()}
          </div>
          
          {data.inputs.map((input, index) => {
              const total = data.inputs.length;
              const topPercent = total > 1 ? (index / (total - 1)) * 80 + 10 : 50;
              return (
                <Handle
                    key={input.id}
                    id={input.id}
                    label={input.label}
                    isInput={true}
                    onMouseDown={(e) => onHandleMouseDown(e, node.id, input.id, 'input')}
                    type={input.type}
                    style={{ top: `${topPercent}%` }}
                    edgeColors={edgeColors}
                />
              );
          })}
          {data.outputs.map((output, index) => {
              const total = data.outputs.length;
              const topPercent = total > 1 ? (index / (total - 1)) * 80 + 10 : 50;
              return (
                <Handle
                    key={output.id}
                    id={output.id}
                    label={output.label}
                    isInput={false}
                    onMouseDown={(e) => onHandleMouseDown(e, node.id, output.id, 'output')}
                    type={output.type}
                    style={{ top: `${topPercent}%` }}
                    edgeColors={edgeColors}
                />
              );
          })}
          
          {!isPresetNode && (
            <div
              className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize opacity-0 group-hover/node:opacity-100 transition-opacity"
              onMouseDown={(e) => onResizeMouseDown(e, node.id)}
            >
              <svg className="w-full h-full text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 19L19 5" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(NodeComponent);