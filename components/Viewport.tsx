import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { SceneObject, ShapeType } from '../types';
import { Download, CheckCircle2 } from 'lucide-react';

// --- Individual Mesh Components ---

const AnimatedMesh: React.FC<{ data: SceneObject }> = ({ data }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && data.animation) {
      if (data.animation.rotateX) meshRef.current.rotation.x += data.animation.rotateX;
      if (data.animation.rotateY) meshRef.current.rotation.y += data.animation.rotateY;
      if (data.animation.rotateZ) meshRef.current.rotation.z += data.animation.rotateZ;
    }
  });

  const Geometry = () => {
    switch (data.type) {
      case ShapeType.CUBE: return <boxGeometry args={data.args as any} />;
      case ShapeType.SPHERE: return <sphereGeometry args={data.args as any} />;
      case ShapeType.PLANE: return <planeGeometry args={data.args as any} />;
      case ShapeType.TORUS: return <torusGeometry args={data.args as any} />;
      default: return <boxGeometry />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
      castShadow
      receiveShadow
      name={data.name}
    >
      <Geometry />
      <meshStandardMaterial color={data.color} transparent={data.opacity < 1} opacity={data.opacity || 1} />
    </mesh>
  );
};

// --- Scene Manager ---

const SceneContent: React.FC<{ objects: SceneObject[] }> = ({ objects }) => {
  return (
    <group>
        {objects.map((obj, idx) => (
          <AnimatedMesh key={`${obj.id}-${idx}`} data={obj} />
        ))}
    </group>
  );
};

// --- Export Helper ---

const ExportHandler: React.FC<{ 
  trigger: number; 
  onStart: () => void;
  onComplete: () => void;
}> = ({ trigger, onStart, onComplete }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    if (trigger === 0) return;

    // Trigger start notification immediately
    onStart();

    // Small timeout to allow UI to update before heavy parsing starts
    const timeoutId = setTimeout(() => {
        const exporter = new GLTFExporter();
        const options = {
          binary: true
        };
    
        exporter.parse(
          scene,
          (result) => {
            if (result instanceof ArrayBuffer) {
              saveArrayBuffer(result, 'scene.glb');
            } else {
              const output = JSON.stringify(result, null, 2);
              saveString(output, 'scene.gltf');
            }
            onComplete();
          },
          (error) => {
            console.error('An error happened during export:', error);
            onComplete();
          },
          options
        );
    }, 100);

    return () => clearTimeout(timeoutId);

  }, [trigger, scene, onStart, onComplete]);

  return null;
};

function saveString(text: string, filename: string) {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function saveArrayBuffer(buffer: ArrayBuffer, filename: string) {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// --- Notification Toast Component ---
const NotificationToast: React.FC<{ show: boolean, message: string }> = ({ show, message }) => {
    if (!show) return null;
    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl border border-slate-600 flex items-center gap-3">
                {message.includes("Complete") ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                ) : (
                    <Download className="text-blue-400 animate-pulse" size={20} />
                )}
                <span className="font-medium text-sm">{message}</span>
            </div>
        </div>
    );
};

// --- Main Viewport Component ---

interface ViewportProps {
  objects: SceneObject[];
}

export const Viewport: React.FC<ViewportProps> = ({ objects }) => {
  const [exportTrigger, setExportTrigger] = useState(0);
  const [notification, setNotification] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });

  const handleExport = () => {
    setExportTrigger(t => t + 1);
  };

  const onExportStart = () => {
      setNotification({ show: true, msg: "Generating GLB file..." });
  };

  const onExportComplete = () => {
      setNotification({ show: true, msg: "Download Complete!" });
      setExportTrigger(0);
      // Hide notification after 3 seconds
      setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
  };

  return (
    <div className="relative w-full h-full bg-slate-900">
      <NotificationToast show={notification.show} message={notification.msg} />
      
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        <color attach="background" args={['#1e293b']} />
        <Stage environment="city" intensity={0.5} adjustCamera={false}>
            <SceneContent objects={objects} />
        </Stage>
        <Grid infiniteGrid fadeDistance={50} sectionColor="#475569" cellColor="#334155" />
        <OrbitControls makeDefault />
        <ExportHandler 
            trigger={exportTrigger} 
            onStart={onExportStart}
            onComplete={onExportComplete} 
        />
      </Canvas>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow-lg border border-slate-600 transition-all font-medium text-sm hover:scale-105 active:scale-95"
        >
          <Download size={16} />
          Export .GLB
        </button>
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none opacity-50">
        <p className="text-xs text-slate-400">Left Click: Rotate • Right Click: Pan • Scroll: Zoom</p>
      </div>
    </div>
  );
};