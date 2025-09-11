import React from 'react';
import { NodeType } from '../types';
import { TextIcon, ImageIcon, MagicIcon, VideoIcon, OutputIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { PRESET_CONFIGS } from '../presets';

interface SidebarProps {
  onAddNode: (type: NodeType, presetId?: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const SidebarButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full px-3 py-2 text-left text-gray-300 transition-colors bg-white/5 rounded-md hover:bg-indigo-600 hover:text-white"
  >
    {icon}
    <span className="ml-3 text-sm truncate" title={label}>{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ onAddNode, isCollapsed, onToggle }) => {
  return (
    <div className={`relative z-20 flex flex-col flex-shrink-0 h-full bg-black/30 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0' : 'w-60 p-4'}`}>
      
      <div 
        className={`flex flex-col h-full overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ transitionDelay: isCollapsed ? '0ms' : '150ms' }}
      >
        <h2 className="text-xl font-bold mb-6 text-white flex-shrink-0">Nodes</h2>
        
        <div className="flex flex-col space-y-4 overflow-y-hidden">
          <div>
            <h3 className="px-2 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">Core</h3>
            <div className="space-y-2">
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
                label="Image Generator/Editor"
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

          <div className="flex-grow min-h-0">
             <h3 className="px-2 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">Prompt Presets</h3>
             <div className="space-y-2 overflow-y-auto h-full pr-1 pb-4">
                {Object.entries(PRESET_CONFIGS).map(([id, config]) => (
                  <SidebarButton
                    key={id}
                    icon={<StarIcon className="w-5 h-5 text-purple-400" />}
                    label={config.label}
                    onClick={() => onAddNode(NodeType.PROMPT_PRESET, id)}
                  />
                ))}
             </div>
          </div>
        </div>
      </div>

      <button 
          onClick={onToggle}
          className="absolute top-1/2 -right-[1px] transform -translate-y-1/2 translate-x-full w-5 h-20 bg-neutral-800/90 hover:bg-indigo-600 border border-white/10 rounded-r-lg flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label={isCollapsed ? 'Expand Nodes sidebar' : 'Collapse Nodes sidebar'}
      >
          {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default Sidebar;