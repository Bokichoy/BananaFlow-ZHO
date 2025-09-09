
export enum NodeType {
  TEXT_INPUT = 'TEXT_INPUT',
  IMAGE_INPUT = 'IMAGE_INPUT',
  TEXT_GENERATOR = 'TEXT_GENERATOR',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  VIDEO_GENERATOR = 'VIDEO_GENERATOR',
  OUTPUT_DISPLAY = 'OUTPUT_DISPLAY',
}

export enum NodeStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface NodeInput {
  id: string;
  label: string;
  type: 'text' | 'image' | 'video' | 'any';
}

export interface NodeOutput {
  id: string;
  label: string;
  type: 'text' | 'image' | 'video' | 'any';
}

export interface NodeData {
  label: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  content: any;
  status: NodeStatus;
  errorMessage?: string;
  scale?: number;
}

export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface Edge {
  id: string;
  sourceNodeId: string;
  sourceHandleId: string;
  targetNodeId: string;
  targetHandleId: string;
}

export interface Point {
  x: number;
  y: number;
}