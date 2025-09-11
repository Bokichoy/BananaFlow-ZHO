import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Node, Theme } from '../types';
import { NodeType } from '../types';
import { FileUploader } from './FileUploader';
import { OutputDisplay } from './OutputDisplay';
import { ImageIcon, TextIcon, OutputIcon } from './icons';

interface AppModeViewProps {
  nodes: Record<string, Node>;
  updateNodeData: (nodeId: string, data: Partial<Node['data']>) => void;
  theme: Theme;
}

// A new wrapper component to handle dynamic resizing for image-based nodes.
const ResizingNodeContainer: React.FC<{ node: Node, children: React.ReactNode, nodeRgba: string }> = ({ node, children, nodeRgba }) => {
    const { data } = node;
    const [dynamicHeight, setDynamicHeight] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isImageNode = node.type === NodeType.IMAGE_INPUT || node.type === NodeType.OUTPUT_DISPLAY;

    const imageUrl = useMemo(() => {
        let url: string | null = null;
        if (node.type === NodeType.IMAGE_INPUT) {
            if (data.content instanceof File) url = URL.createObjectURL(data.content);
            else if (typeof data.content === 'string') url = data.content;
        } else if (node.type === NodeType.OUTPUT_DISPLAY) {
            if (typeof data.content === 'string' && data.content.startsWith('data:image')) url = data.content;
            else if (data.content?.image) url = data.content.image;
        }
        return url;
    }, [data.content, node.type]);

    useEffect(() => {
        if (!isImageNode || !imageUrl || !containerRef.current) {
            setDynamicHeight(null); // Reset if no image
            return;
        }

        const currentRef = containerRef.current;

        const resizeObserver = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry.contentRect.width > 0) {
                const img = new Image();
                img.onload = () => {
                    if (img.width > 0) {
                      const aspectRatio = img.height / img.width;
                      setDynamicHeight(entry.contentRect.width * aspectRatio);
                    }
                };
                img.src = imageUrl;
            }
        });

        resizeObserver.observe(currentRef);

        return () => {
            resizeObserver.disconnect();
            if (imageUrl && data.content instanceof File) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl, isImageNode, data.content]);
    
    const defaultHeight = node.type === NodeType.IMAGE_INPUT ? 150 : 350;
    const heightStyle = isImageNode && dynamicHeight ? { height: `${dynamicHeight}px` } : { height: `${data.height || defaultHeight}px` };

    return (
        <div
            ref={containerRef}
            className="backdrop-blur-xl shadow-2xl rounded-2xl transition-all duration-300"
            style={{
                width: '100%',
                ...heightStyle,
                backgroundColor: nodeRgba,
            }}
        >
            <div className="relative w-full h-full overflow-hidden rounded-2xl">
                {children}
            </div>
        </div>
    );
};


const AppModeView: React.FC<AppModeViewProps> = ({ nodes, updateNodeData, theme }) => {
  const inputNodes = Object.values(nodes)
    .filter(node => node.type === NodeType.IMAGE_INPUT || node.type === NodeType.TEXT_INPUT)
    .sort((a, b) => a.position.y - b.position.y);

  const outputNodes = Object.values(nodes)
    .filter(node => node.type === NodeType.OUTPUT_DISPLAY)
    .sort((a, b) => a.position.y - b.position.y);

  const nodeRgba = React.useMemo(() => {
    const hexToRgb = (hex: string) => {
        if (!hex) return null;
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
    }
    const rgb = hexToRgb(theme.nodeBackground);
    if (rgb) {
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${theme.nodeOpacity})`;
    }
    return `rgba(23, 23, 23, 0.7)`;
  }, [theme.nodeBackground, theme.nodeOpacity]);


  const renderNodeContent = (node: Node) => {
    const { data } = node;
    switch (node.type) {
      case NodeType.TEXT_INPUT:
        return (
          <textarea
            className="w-full h-full p-4 text-sm bg-transparent focus:outline-none resize-none placeholder-white/40"
            style={{ color: theme.nodeTextColor }}
            value={data.content || ''}
            onChange={(e) => updateNodeData(node.id, { content: e.target.value })}
            placeholder="Enter text..."
          />
        );
      case NodeType.IMAGE_INPUT:
        const imageUrl = data.content instanceof File 
            ? URL.createObjectURL(data.content) 
            : (typeof data.content === 'string' ? data.content : null);
        
        return imageUrl ? (
          <div className="relative w-full h-full group/image-input">
            <img 
              src={imageUrl} 
              alt="Input" 
              className="object-contain w-full h-full" 
            />
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
        ) : (
          <div className="p-2 w-full h-full">
            <FileUploader onFileUpload={(file) => updateNodeData(node.id, { content: file })} />
          </div>
        );
      case NodeType.OUTPUT_DISPLAY:
        return (
          <OutputDisplay
            content={data.content}
            status={data.status}
            errorMessage={data.errorMessage}
            progressMessage={data.content?.progress}
          />
        );
      default:
        return null;
    }
  };

  const getNodeIcon = (nodeType: NodeType) => {
      switch (nodeType) {
          case NodeType.TEXT_INPUT: return <TextIcon className="w-4 h-4" />;
          case NodeType.IMAGE_INPUT: return <ImageIcon className="w-4 h-4" />;
          case NodeType.OUTPUT_DISPLAY: return <OutputIcon className="w-4 h-4" />;
          default: return null;
      }
  }

  return (
    <div className="w-full h-full p-8 flex flex-row gap-8">
      {/* Inputs Column */}
      <div className="flex-1 flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold text-white/80">Inputs</h2>
        <div className="w-full flex flex-row flex-wrap gap-6 justify-center px-4">
          {inputNodes.map((node) => (
            <div key={node.id} className="flex flex-col flex-1 min-w-[300px] max-w-md">
                 <div className="flex items-center gap-2 mb-2 px-1" style={{ color: theme.nodeTextColor }}>
                    {getNodeIcon(node.type)}
                    <h3 className="text-xs font-bold truncate">{node.data.label}</h3>
                </div>
                <ResizingNodeContainer node={node} nodeRgba={nodeRgba}>
                    {renderNodeContent(node)}
                </ResizingNodeContainer>
            </div>
          ))}
        </div>
      </div>

      <div className="w-px bg-white/10 h-full" />

      {/* Outputs Column */}
      <div className="flex-1 flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold text-white/80">Outputs</h2>
        <div className="w-full flex flex-row flex-wrap gap-6 justify-center px-4">
          {outputNodes.map((node) => (
            <div key={node.id} className="flex flex-col flex-1 min-w-[300px] max-w-md">
                <div className="flex items-center gap-2 mb-2 px-1" style={{ color: theme.nodeTextColor }}>
                    {getNodeIcon(node.type)}
                    <h3 className="text-xs font-bold truncate">{node.data.label}</h3>
                </div>
                <ResizingNodeContainer node={node} nodeRgba={nodeRgba}>
                    {renderNodeContent(node)}
                </ResizingNodeContainer>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppModeView;