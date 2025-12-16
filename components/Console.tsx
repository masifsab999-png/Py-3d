import React, { useEffect, useRef } from 'react';
import { Terminal, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export interface LogEntry {
  type: 'info' | 'success' | 'error';
  message: string;
  timestamp: string;
}

interface ConsoleProps {
  logs: LogEntry[];
}

export const Console: React.FC<ConsoleProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-48 bg-slate-950 border-t border-slate-700 font-mono text-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Console</span>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {logs.length === 0 && (
            <div className="text-slate-600 italic text-xs">System ready... waiting for input.</div>
        )}
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-1 duration-300">
             <span className="text-xs text-slate-600 mt-0.5 min-w-[60px]">{log.timestamp}</span>
             <div className="mt-0.5">
                {log.type === 'error' && <AlertCircle size={14} className="text-red-500" />}
                {log.type === 'success' && <CheckCircle2 size={14} className="text-emerald-500" />}
                {log.type === 'info' && <Clock size={14} className="text-blue-500" />}
             </div>
             <span className={`
                break-all whitespace-pre-wrap
                ${log.type === 'error' ? 'text-red-400' : ''}
                ${log.type === 'success' ? 'text-emerald-400' : ''}
                ${log.type === 'info' ? 'text-slate-300' : ''}
             `}>
                {log.message}
             </span>
          </div>
        ))}
      </div>
    </div>
  );
};