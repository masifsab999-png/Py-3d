export enum ShapeType {
  CUBE = 'CUBE',
  SPHERE = 'SPHERE',
  PLANE = 'PLANE',
  TORUS = 'TORUS'
}

export interface AnimationConfig {
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  speed?: number;
}

export interface SceneObject {
  id: string;
  type: ShapeType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  wireframe: boolean;
  opacity: number;
  // Shape specific args
  args?: number[]; 
  animation?: AnimationConfig;
}

export interface PyodideInterface {
  runPython: (code: string) => any;
  loadPackage: (pkg: string) => Promise<void>;
  globals: any;
}

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
    pyodide: PyodideInterface;
  }
}