import React from 'react';
import { FileCode } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  disabled?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, disabled }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950">
       <div className="bg-slate-900 text-slate-400 px-4 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
            <FileCode size={14} className="text-blue-400"/>
            <span className="text-xs font-semibold tracking-wide text-slate-300">script.py</span>
        </div>
        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono">Python 3.11</span>
      </div>
      
      <div className="relative flex-1">
        <textarea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="absolute inset-0 w-full h-full bg-[#0d1117] text-slate-300 p-4 resize-none focus:outline-none focus:ring-0 border-none font-mono text-[13px] leading-6 tab-[20px]"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
        />
      </div>
    </div>
  );
};