import { SceneObject } from "../types";

let pyodideInstance: any = null;

const PYTHON_PRELUDE = `
import json
import js

class SceneBuilder:
    def __init__(self):
        self.objects = []

    def _add_object(self, type_name, name, position, rotation, scale, color, args, animation=None):
        obj = {
            "id": name + "_" + str(len(self.objects)),
            "type": type_name,
            "name": name,
            "position": position,
            "rotation": rotation,
            "scale": scale,
            "color": color,
            "args": args,
            "animation": animation
        }
        self.objects.append(obj)
        return obj

    def add_cube(self, name="Cube", position=[0,0,0], rotation=[0,0,0], scale=[1,1,1], color="#3b82f6", size=1, animation=None):
        return self._add_object("CUBE", name, position, rotation, scale, color, [size, size, size], animation)

    def add_sphere(self, name="Sphere", position=[0,0,0], rotation=[0,0,0], scale=[1,1,1], color="#ef4444", radius=1, animation=None):
        return self._add_object("SPHERE", name, position, rotation, scale, color, [radius, 32, 32], animation)
    
    def add_plane(self, name="Plane", position=[0,0,0], rotation=[-1.57,0,0], scale=[1,1,1], color="#10b981", width=10, height=10):
        return self._add_object("PLANE", name, position, rotation, scale, color, [width, height], None)

    def add_torus(self, name="Torus", position=[0,0,0], rotation=[0,0,0], scale=[1,1,1], color="#f59e0b", radius=1, tube=0.4, animation=None):
        return self._add_object("TORUS", name, position, rotation, scale, color, [radius, tube, 16, 100], animation)

    def to_json(self):
        return json.dumps(self.objects)

# Initialize global scene
scene = SceneBuilder()
`;

export const initializePyodide = async (): Promise<void> => {
  if (pyodideInstance) return;

  if (!window.loadPyodide) {
    throw new Error("Pyodide script not loaded yet.");
  }

  pyodideInstance = await window.loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
  });
};

export const runPythonCode = async (userCode: string): Promise<SceneObject[]> => {
  if (!pyodideInstance) await initializePyodide();

  try {
    // We wrap user code to ensure 'scene' is reset every run
    const fullScript = `
${PYTHON_PRELUDE}
# --- User Code Start ---
${userCode}
# --- User Code End ---
scene.to_json()
    `;

    const resultJson = await pyodideInstance.runPythonAsync(fullScript);
    const sceneData: SceneObject[] = JSON.parse(resultJson);
    return sceneData;
  } catch (error) {
    console.error("Python Execution Error:", error);
    throw error;
  }
};