import React from 'react';
import { NodeStatus } from '../types';

interface OutputDisplayProps {
  content: any;
  status: NodeStatus;
  errorMessage?: string;
  progressMessage?: string;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, status, errorMessage, progressMessage }) => {
  if (status === NodeStatus.PROCESSING) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 space-y-2 text-center bg-gray-700/50 rounded-lg">
        <div className="w-8 h-8 border-4 border-t-indigo-400 border-gray-600 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-300">{progressMessage || 'Processing...'}</p>
      </div>
    );
  }

  if (status === NodeStatus.ERROR) {
    return (
      <div className="p-4 text-red-400 bg-red-900/50 rounded-lg">
        <h4 className="font-bold">Error</h4>
        <p className="text-sm break-words">{errorMessage}</p>
      </div>
    );
  }

  if (status === NodeStatus.COMPLETED && content) {
    if (typeof content === 'string') {
        if (content.startsWith('data:image')) {
            return <img src={content} alt="Generated output" className="object-contain w-full rounded-lg" />;
        }
        if (content.startsWith('blob:')) { // Video
             return <video src={content} controls className="w-full rounded-lg" />;
        }
        // Otherwise, it's just text
        return <p className="text-sm text-gray-300 whitespace-pre-wrap">{content}</p>;
    }
    
    // Fallback for complex objects, e.g., from a misconfigured Image Editor output
    if (content.image && typeof content.image === 'string' && content.image.startsWith('data:image')) {
        return <img src={content.image} alt="Generated output" className="object-contain w-full rounded-lg" />;
    }
     if (content.base64Image) { // Legacy fallback
        return <img src={`data:image/png;base64,${content.base64Image}`} alt="Edited output" className="object-contain w-full rounded-lg" />;
    }
  }

  return <div className="text-sm text-gray-500">Output will appear here.</div>;
};