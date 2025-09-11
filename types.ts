
export enum NodeType {
  TEXT_INPUT = 'TEXT_INPUT',
  IMAGE_INPUT = 'IMAGE_INPUT',
  TEXT_GENERATOR = 'TEXT_GENERATOR',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  VIDEO_GENERATOR = 'VIDEO_GENERATOR',
  OUTPUT_DISPLAY = 'OUTPUT_DISPLAY',
  PROMPT_PRESET = 'PROMPT_PRESET',
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
  width?: number;
  height?: number;
  prompt?: string;
  isMuted?: boolean;
}

export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
  zIndex?: number;
}

export interface Edge {
  id:string;
  sourceNodeId: string;
  sourceHandleId: string;
  targetNodeId: string;
  targetHandleId: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface HistoryItem {
  id: string;
  type: 'image';
  dataUrl: string;
  prompt: string;
}

export interface Group {
  id: string;
  label: string;
  color: string;
  nodeIds: string[];
}

export interface Theme {
  canvasBackground: string;
  nodeBackground: string; // Hex color
  nodeOpacity: number; // 0.0 to 1.0
  nodeTextColor: string;
  uploaderTextColor: string;
  canvasBackgroundImage: string | null;
  edgeWidth: number;
  edgeColors: {
    text: string;
    image: string;
    video: string;
    any: string;
  };
  buttonColor: string;
}

export interface Shortcuts {
  run: string;
  save: string;
  load: string;
  copy: string;
  paste: string;
  delete: string;
  group: string;
  ungroup: string;
  mute: string;
}