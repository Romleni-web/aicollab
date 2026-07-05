import React from 'react';
import { X, Copy, Check, Download, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ArtifactModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  role: string;
  content: string;
}

const ArtifactModal: React.FC<ArtifactModalProps> = ({ isOpen, onClose, title, role, content }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 lg:p-12 animate-in fade-in duration-300">
      <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 w-full max-w-6xl h-full flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-6">
            <div className="bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-[0.2em]">
              Artifact: {role}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"><Download size={18} /></button>
            <button className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"><Share2 size={18} /></button>
            <div className="w-px h-8 bg-slate-800 mx-2" />
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all hover:rotate-90 duration-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-950/50">
          <div className="max-w-4xl mx-auto">
            <pre className="font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap selection:bg-blue-600/30">
              {content}
            </pre>
          </div>
        </div>

        <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-center items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Version 1.0.4</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signed Artifact</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtifactModal;
