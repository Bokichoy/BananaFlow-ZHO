
import React from 'react';
import type { Point } from '../types';

interface EdgeProps {
  start: Point;
  end: Point;
}

const getCurvePath = (start: Point, end: Point): string => {
  const dx = end.x - start.x;
  const controlPoint1 = { x: start.x + dx / 2, y: start.y };
  const controlPoint2 = { x: end.x - dx / 2, y: end.y };
  return `M${start.x},${start.y} C${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${end.x},${end.y}`;
};

const EdgeComponent: React.FC<EdgeProps> = ({ start, end }) => {
  if (!start || !end) return null;

  const path = getCurvePath(start, end);

  return (
    <path
      d={path}
      stroke="#6366f1"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
  );
};

export default React.memo(EdgeComponent);
