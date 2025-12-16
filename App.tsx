import React, { useState, useEffect, useCallback } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { Viewport } from './components/Viewport';
import { Inspector } from './components/Inspector';
import { Console, LogEntry } from './components/Console';
import { initializePyodide, runPythonCode } from './services/pythonService';
import { SceneObject } from './types';
import { Loader2, Box } from 'lucide-react';

const DEFAULT_CODE = `# Welcome to Py3D Studio!

# 1. Floor
scene.add_plane(
    color="#1e293b", 
    width=20, 
    height=20
)

# 2. Animated Cube
scene.add_cube(
    name="Magic Cube",
    position=[0, 1, 0],
    color="#3b82f6",
    size=1.5,
    animation={"rotateY": 0.02, "rotateX": 0.01}
)

# 3. Floating Sphere
scene.add_sphere(
    name="Red Orb",
    position=[3, 1, 0],
    color="#ef4444",
    radius=0.8
)

# 4. Golden Torus
scene.add_torus(
    name="Golden Ring",
    position=[-3, 1, 0],
    color="#f59e0b",
    radius=0.8,
    tube=0.2,
    animation={"rotateZ": -0.05}
)
`;

const App: React.FC = () => {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([]);
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Add log helper
  const addLog = (type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { type, message, timestamp: time }]);
  };

  useEffect(() => {
    const init = async () => {
      try {
        addLog('info', 'Initializing Python Runtime...');
        await initializePyodide();
        setIsPyodideLoading(false);
        addLog('success', 'Python Runtime Ready.');
        // Initial run
        runEngine(DEFAULT_CODE);
      } catch (err) {
        console.error("Failed to load Pyodide", err);
        addLog('error', 'Failed to load Python environment.');
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Execution Engine
  const runEngine = async (sourceCode: string) => {
    if (isPyodideLoading) return;
    setIsRunning(true);
    
    try {
      const objects = await runPythonCode(sourceCode);
      setSceneObjects(objects);
      addLog('success', `Scene updated: ${objects.length} objects rendered.`);
    } catch (e: any) {
      addLog('error', e.message || "Runtime Error");
    } finally {
      setIsRunning(false);
    }
  };

  // Debounced Auto-Run
  useEffect(() => {
    if (isPyodideLoading) return;

    const timeoutId = setTimeout(() => {
        runEngine(code);
    }, 800); // 800ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isPyodideLoading]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      {/* Slim Header */}
      <header className="h-10 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <Box size={16} className="text-blue-500" />
          <h1 className="font-bold text-sm tracking-wide text-slate-200">Py3D <span className="text-blue-500">Studio</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                {isPyodideLoading ? (
                     <>
                        <Loader2 size={12} className="animate-spin text-yellow-500" />
                        <span className="text-[10px] uppercase font-bold text-yellow-500 tracking-wider">Loading Engine</span>
                     </>
                ) : isRunning ? (
                    <>
                        <Loader2 size={12} className="animate-spin text-blue-500" />
                        <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Compiling...</span>
                    </>
                ) : (
                    <>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Live</span>
                    </>
                )}
            </div>
        </div>
      </header>

      {/* 3-Column Layout */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT: Editor */}
        <div className="w-[400px] border-r border-slate-800 flex flex-col z-10 shadow-xl bg-slate-950">
          <CodeEditor 
            code={code} 
            onChange={setCode} 
            disabled={isPyodideLoading} 
          />
        </div>

        {/* MIDDLE: Viewport & Console */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900 relative">
          <div className="flex-1 relative">
             <Viewport objects={sceneObjects} />
          </div>
          <div className="shrink-0 h-48">
            <Console logs={logs} />
          </div>
        </div>

        {/* RIGHT: Properties Inspector */}
        <Inspector objects={sceneObjects} />

      </main>
    </div>
  );
};

export default App;