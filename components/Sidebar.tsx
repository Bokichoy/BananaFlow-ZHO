import React from 'react';
import { NodeType } from '../types';
import { TextIcon, ImageIcon, MagicIcon, VideoIcon, OutputIcon } from './icons';

interface SidebarProps {
  onAddNode: (type: NodeType) => void;
}

const SidebarButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full px-3 py-2 text-left text-gray-300 transition-colors bg-gray-800 rounded-md hover:bg-indigo-600 hover:text-white"
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  return (
    <div className="z-10 flex-shrink-0 h-full p-4 bg-gray-900 border-r border-gray-700 w-60">
      <h2 className="text-xl font-bold mb-6 text-white">Nodes</h2>
      <div className="space-y-3">
        <SidebarButton
          icon={<TextIcon className="w-5 h-5" />}
          label="Text Input"
          onClick={() => onAddNode(NodeType.TEXT_INPUT)}
        />
        <SidebarButton
          icon={<ImageIcon className="w-5 h-5" />}
          label="Image Input"
          onClick={() => onAddNode(NodeType.IMAGE_INPUT)}
        />
        <SidebarButton
          icon={<MagicIcon className="w-5 h-5" />}
          label="Text Generator"
          onClick={() => onAddNode(NodeType.TEXT_GENERATOR)}
        />
        <SidebarButton
          icon={<MagicIcon className="w-5 h-5" />}
          label="Image Editor"
          onClick={() => onAddNode(NodeType.IMAGE_EDITOR)}
        />
        <SidebarButton
          icon={<VideoIcon className="w-5 h-5" />}
          label="Video Generator"
          onClick={() => onAddNode(NodeType.VIDEO_GENERATOR)}
        />
        <SidebarButton
          icon={<OutputIcon className="w-5 h-5" />}
          label="Output"
          onClick={() => onAddNode(NodeType.OUTPUT_DISPLAY)}
        />
      </div>
    </div>
  );
};

export default Sidebar;