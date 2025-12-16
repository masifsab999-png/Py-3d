import React from 'react';
import { SceneObject } from '../types';
import { Box, Layers, Move3d, Maximize2, Rotate3d, Palette } from 'lucide-react';

interface InspectorProps {
  objects: SceneObject[];
}

const PropertyRow = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
    <div className="flex items-center gap-2 text-slate-400">
      <Icon size={12} />
      <span className="text-xs">{label}</span>
    </div>
    <span className="text-xs font-mono text-slate-200">{value}</span>
  </div>
);

export const Inspector: React.FC<InspectorProps> = ({ objects }) => {
  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Layers size={14} />
          Scene Inspector
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {objects.length === 0 ? (
          <div className="text-center text-slate-600 mt-10">
            <Box className="mx-auto mb-2 opacity-20" size={40} />
            <p className="text-xs">No objects in scene.</p>
          </div>
        ) : (
          objects.map((obj) => (
            <div key={obj.id} className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
              <div className="bg-slate-800 px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400">{obj.name}</span>
                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{obj.type}</span>
              </div>
              
              <div className="p-3 space-y-1">
                <PropertyRow 
                    label="Position" 
                    icon={Move3d}
                    value={`[${obj.position.map(n => n.toFixed(1)).join(', ')}]`} 
                />
                <PropertyRow 
                    label="Rotation" 
                    icon={Rotate3d}
                    value={`[${obj.rotation.map(n => n.toFixed(2)).join(', ')}]`} 
                />
                <PropertyRow 
                    label="Scale" 
                    icon={Maximize2}
                    value={`[${obj.scale.map(n => n.toFixed(1)).join(', ')}]`} 
                />
                 <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-slate-400">
                    <Palette size={12} />
                    <span className="text-xs">Color</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">{obj.color}</span>
                        <div className="w-3 h-3 rounded-full border border-slate-700" style={{ backgroundColor: obj.color }}></div>
                    </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};