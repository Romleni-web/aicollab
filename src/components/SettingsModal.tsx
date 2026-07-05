import React, { useState } from 'react';
import { X, Shield, Key, Check, Info, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: Record<string, string>;
  onSave: (keys: Record<string, string>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKeys, onSave }) => {
  const [localKeys, setLocalKeys] = useState(apiKeys);
  const providers = [
    { id: 'openai', name: 'OpenAI', desc: 'Required for orchestration & planning' },
    { id: 'anthropic', name: 'Anthropic', desc: 'Expert reasoning & architecture' },
    { id: 'google', name: 'Google AI', desc: 'Deep research & large context' },
    { id: 'deepseek', name: 'DeepSeek', desc: 'Advanced coding & logic' },
    { id: 'groq', name: 'Groq', desc: 'Ultra-fast inference speed' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white leading-none mb-1">Infrastructure</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bring Your Own Key</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all">&times;</button>
        </div>

        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <div className="flex gap-4 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
            <Shield className="text-blue-500 shrink-0" size={18} />
            <p className="text-xs text-slate-400 leading-relaxed">
              Your keys are encrypted and stored <b>only in your browser</b>. No backend storage is utilized for these credentials.
            </p>
          </div>

          <div className="space-y-4">
            {providers.map(p => (
              <div key={p.id} className="group">
                <div className="flex justify-between items-end mb-2 px-1">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-500 transition-colors">{p.name}</label>
                    <p className="text-[9px] text-slate-600 font-bold">{p.desc}</p>
                  </div>
                  {localKeys[p.id] && <Check size={12} className="text-green-500 mb-1" />}
                </div>
                <input
                  type="password"
                  value={localKeys[p.id] || ''}
                  onChange={(e) => setLocalKeys({ ...localKeys, [p.id]: e.target.value })}
                  placeholder="Paste secure key..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all placeholder:text-slate-800"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
            <AlertTriangle className="text-amber-500 shrink-0" size={16} />
            <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-wide">
              Ensure billing is active on your provider accounts.
            </p>
          </div>
        </div>

        <div className="p-8 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-white transition">Discard</button>
          <button
            onClick={() => { onSave(localKeys); onClose(); }}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
          >
            Deploy Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
