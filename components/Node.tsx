
import React, { useMemo } from 'react';
// FIX: Import NodeStatus as a value for use in switch statement, not just as a type.
import type { Node, NodeInput, NodeOutput } from '../types';
import { NodeType, NodeStatus } from '../types';
import { TextIcon, ImageIcon, MagicIcon, VideoIcon, OutputIcon } from './icons';
import { FileUploader } from './FileUploader';
import { OutputDisplay } from './OutputDisplay';

interface NodeProps {
  node: Node;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>, nodeId: string) => void;
  onHandleMouseDown: (e: React.MouseEvent<HTMLDivElement>, nodeId: string, handleId: string, handleType: 'input' | 'output') => void;
  onResizeMouseDown: (e: React.MouseEvent<HTMLDivElement>, nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<Node['data']>) => void;
}

const NodeHeader: React.FC<{ type: NodeType }> = ({ type }) => {
  const config = useMemo(() => {
    switch (type) {
      case NodeType.TEXT_INPUT:
        return { icon: <TextIcon className="w-5 h-5" />, title: 'Text Input', color: 'bg-sky-600' };
      case NodeType.IMAGE_INPUT:
        return { icon: <ImageIcon className="w-5 h-5" />, title: 'Image Input', color: 'bg-green-600' };
      case NodeType.TEXT_GENERATOR:
        return { icon: <MagicIcon className="w-5 h-5" />, title: 'Text Generator', color: 'bg-indigo-600' };
      case NodeType.IMAGE_EDITOR:
        return { icon: <MagicIcon className="w-5 h-5" />, title: 'Image Editor', color: 'bg-purple-600' };
      case NodeType.VIDEO_GENERATOR:
        return { icon: <VideoIcon className="w-5 h-5" />, title: 'Video Generator', color: 'bg-rose-600' };
      case NodeType.OUTPUT_DISPLAY:
        return { icon: <OutputIcon className="w-5 h-5" />, title: 'Output', color: 'bg-amber-600' };
      default:
        return { icon: null, title: 'Unknown', color: 'bg-gray-600' };
    }
  }, [type]);

  return (
    <div className={`flex items-center px-4 py-2 text-white rounded-t-lg ${config.color}`}>
      {config.icon}
      <h3 className="ml-2 font-bold">{config.title}</h3>
    </div>
  );
};

const Handle: React.FC<{
  id: string;
  label: string;
  isInput: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}> = ({ id, label, isInput, onMouseDown }) => (
  <div className={`relative flex items-center my-2 ${isInput ? 'justify-start' : 'justify-end'}`}>
    {!isInput && <span className="mr-6 text-sm text-gray-300">{label}</span>}
    <div
      id={id}
      data-handle-type={isInput ? 'input' : 'output'}
      onMouseDown={onMouseDown}
      className="absolute top-1/2 w-4 h-4 rounded-full bg-gray-500 hover:bg-indigo-400 cursor-pointer"
      style={{
        transform: 'translateY(-50%)',
        ...(isInput ? { left: '-8px' } : { right: '-8px' }),
      }}
    />
    {isInput && <span className="ml-6 text-sm text-gray-300">{label}</span>}
  </div>
);


const NodeComponent: React.FC<NodeProps> = ({ node, onMouseDown, onHandleMouseDown, onResizeMouseDown, updateNodeData }) => {
    const statusColor = useMemo(() => {
        switch (node.data.status) {
            case NodeStatus.PROCESSING: return 'border-indigo-500 animate-pulse';
            case NodeStatus.COMPLETED: return 'border-green-500';
            case NodeStatus.ERROR: return 'border-red-500';
            default: return 'border-gray-700';
        }
    }, [node.data.status]);

  const renderNodeContent = () => {
    switch (node.type) {
      case NodeType.TEXT_INPUT:
        return (
          <textarea
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            value={node.data.content || ''}
            onChange={(e) => updateNodeData(node.id, { content: e.target.value })}
            placeholder="Enter text here..."
          />
        );
      case NodeType.IMAGE_INPUT:
        return <FileUploader onFileUpload={(file) => updateNodeData(node.id, { content: file })} />;
      case NodeType.TEXT_GENERATOR:
      case NodeType.IMAGE_EDITOR:
      case NodeType.VIDEO_GENERATOR:
          return <div className="p-2 text-sm text-gray-400">Ready to receive inputs.</div>;
      case NodeType.OUTPUT_DISPLAY:
        return <OutputDisplay content={node.data.content} status={node.data.status} errorMessage={node.data.errorMessage} progressMessage={node.data.content?.progress} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`absolute bg-gray-800 rounded-lg shadow-xl border-2 ${statusColor}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        minWidth: 250,
        transform: `scale(${node.data.scale || 1})`,
        transformOrigin: 'top left',
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
    >
      <NodeHeader type={node.type} />
      <div className="relative p-4 border-t border-gray-700">
        {node.data.inputs.map((input) => (
          <Handle key={input.id} id={input.id} label={input.label} isInput={true} onMouseDown={(e) => onHandleMouseDown(e, node.id, input.id, 'input')} />
        ))}
        {node.data.outputs.map((output) => (
          <Handle key={output.id} id={output.id} label={output.label} isInput={false} onMouseDown={(e) => onHandleMouseDown(e, node.id, output.id, 'output')} />
        ))}
        
        <div className="pt-2 mt-2 border-t border-gray-700/50">
            {renderNodeContent()}
        </div>
        
        <div
          className="absolute bottom-0 right-0 w-3 h-3 bg-gray-600 border-2 border-gray-800 rounded-full cursor-se-resize hover:bg-indigo-500"
          style={{ transform: 'translate(25%, 25%)' }}
          onMouseDown={(e) => onResizeMouseDown(e, node.id)}
        />
      </div>
    </div>
  );
};

export default React.memo(NodeComponent);