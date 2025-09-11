import React from 'react';
import { NodeStatus } from '../types';
import { DownloadIcon } from './icons';

interface OutputDisplayProps {
  content: any;
  status: NodeStatus;
  errorMessage?: string;
  progressMessage?: string;
}

const handleDownload = (content: string, filename = 'generated-image.png') => {
    if (content.startsWith('blob:')) {
      // For videos, we need to create a downloadable link from the blob URL
      const link = document.createElement('a');
      link.href = content;
      link.download = 'generated-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    const link = document.createElement('a');
    link.href = content;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, status, errorMessage, progressMessage }) => {
  if (status === NodeStatus.PROCESSING) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 space-y-2 text-center rounded-lg">
        <div className="w-8 h-8 border-4 border-t-indigo-400 border-gray-600 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-300 mt-2">{progressMessage || 'Processing...'}</p>
      </div>
    );
  }

  if (status === NodeStatus.ERROR) {
    return (
       <div className="flex flex-col items-center justify-center w-full h-full p-4 space-y-2 text-center text-red-400">
         <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
         <p className="text-sm break-words">{errorMessage}</p>
     </div>
    );
  }

  const renderMedia = (src: string, isVideo = false) => (
      <div className="relative group w-full h-full rounded-lg flex items-center justify-center">
          {isVideo ? (
              <video src={src} controls className="object-contain w-full h-full" />
          ) : (
              <img src={src} alt="Generated output" className="object-contain w-full h-full" />
          )}
          <button
              onClick={() => handleDownload(src)}
              className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={isVideo ? "Download video" : "Download image"}
          >
              <DownloadIcon className="w-5 h-5" />
          </button>
      </div>
  );

  if (status === NodeStatus.COMPLETED && content) {
    if (typeof content === 'string') {
        if (content.startsWith('data:image')) {
            return renderMedia(content);
        }
        if (content.startsWith('blob:')) { // Video
             return renderMedia(content, true);
        }
        return <div className="p-4 text-sm text-gray-300 whitespace-pre-wrap overflow-y-auto w-full h-full">{content}</div>;
    }
    
    if (content.image && typeof content.image === 'string' && content.image.startsWith('data:image')) {
        return renderMedia(content.image);
    }
     if (content.base64Image) { // Legacy fallback
        const dataUrl = `data:image/png;base64,${content.base64Image}`;
        return renderMedia(dataUrl);
    }
  }

  return <div className="text-sm text-gray-500 flex items-center justify-center w-full h-full">Output will appear here.</div>;
};
