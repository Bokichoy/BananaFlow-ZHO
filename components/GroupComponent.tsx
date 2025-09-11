
import React, { useState, useEffect } from 'react';
import type { Group, Node } from '../types';

interface GroupComponentProps {
  group: Group;
  nodes: Record<string, Node>;
  updateGroup: (groupId: string, data: Partial<Group>) => void;
  onDelete: (groupId: string) => void;
  onMouseDown: (e: React.MouseEvent, groupId: string) => void;
}

const GroupComponent: React.FC<GroupComponentProps> = ({ group, nodes, updateGroup, onDelete, onMouseDown }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(group.label);

  useEffect(() => {
    setLabel(group.label);
  }, [group.label]);

  const groupNodes = group.nodeIds.map(id => nodes[id]).filter(Boolean);

  if (groupNodes.length === 0) {
    return null;
  }

  const padding = 20;
  const nodeTitleOffset = 32; // An estimation of node title height + margin
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  groupNodes.forEach(node => {
    const nodeWidth = node.data.width || 250;
    const nodeHeight = node.data.height || 150;

    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y - nodeTitleOffset);
    maxX = Math.max(maxX, node.position.x + nodeWidth);
    maxY = Math.max(maxY, node.position.y + nodeHeight);
  });

  const groupTitleHeight = 40;
  const position = { x: minX - padding, y: minY - padding };
  const size = { width: maxX - minX + padding * 2, height: maxY - minY + padding * 2 };
  
  const handleLabelBlur = () => {
    setIsEditing(false);
    updateGroup(group.id, { label });
  };
  
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    // Only trigger move if the click is on the background, not on interactive elements.
    if ((e.target as HTMLElement).closest('button, input, h3')) {
      return;
    }
    onMouseDown(e, group.id);
  };


  return (
    <div
      className="absolute rounded-2xl border border-white/10 backdrop-blur-md group pointer-events-auto cursor-move"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        backgroundColor: group.color.replace('0.2', '0.15')
      }}
      onMouseDown={handleContainerMouseDown}
    >
      <button
        onClick={() => onDelete(group.id)}
        className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Delete group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {isEditing ? (
         <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleLabelBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleLabelBlur()}
          className="bg-transparent text-white font-bold text-lg px-4 py-2 w-full outline-none pointer-events-auto cursor-text"
          autoFocus
        />
      ) : (
        <h3 
            className="text-white font-bold text-lg px-4 py-2 cursor-text pointer-events-auto"
            onDoubleClick={() => setIsEditing(true)}
        >
            {group.label}
        </h3>
      )}
    </div>
  );
};

export default GroupComponent;
