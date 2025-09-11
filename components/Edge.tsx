
import React from 'react';
import type { Point } from '../types';

interface EdgeProps {
  id: string;
  start: Point;
  end: Point;
  isSelected: boolean;
  onClick: (edgeId: string, e: React.MouseEvent) => void;
  color: string;
  width: number;
}

const getCurvePath = (start: Point, end: Point): string => {
  const dx = end.x - start.x;
  const controlPoint1 = { x: start.x + dx / 2, y: start.y };
  const controlPoint2 = { x: end.x - dx / 2, y: end.y };
  return `M${start.x},${start.y} C${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${end.x},${end.y}`;
};

const EdgeComponent: React.FC<EdgeProps> = ({ id, start, end, isSelected, onClick, color, width }) => {
  if (!start || !end) return null;

  const path = getCurvePath(start, end);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(id, e);
  };

  return (
    <g onClick={handleClick} className="cursor-pointer group/edge">
      <path
        d={path}
        stroke="transparent"
        strokeWidth="15"
        fill="none"
      />
      <path
        d={path}
        stroke={isSelected ? '#f43f5e' : color}
        strokeWidth={isSelected ? width + 1 : width}
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-200"
      />
    </g>
  );
};

export default React.memo(EdgeComponent);
