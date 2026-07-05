import React, { useState, useEffect, useRef } from 'react';
import { WebOrchestrator, Task } from './logic/orchestrator';
import SettingsModal from './components/SettingsModal';
import ArtifactModal from './components/ArtifactModal';
import {
  Cpu,
  Settings,
  Layers,
  Send,
  Database,
  Zap,
  Sparkles,
  History,
  LayoutDashboard,
  ExternalLink,
  Bot
} from 'lucide-react';

interface Message {
  role: string;
  content: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [selectedArtifact, setSelectedArtifact] = useState<Task | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKeys = localStorage.getItem('ai_team_keys');
    if (savedKeys) setApiKeys(JSON.parse(savedKeys));
    const savedHistory = localStorage.getItem('ai_team_history');
    if (savedHistory) setMessages(JSON.parse(savedHistory));

    const checkApi = async () => {
      try {
        const url = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api/orchestrate').replace('/api/orchestrate', '');
        const res = await fetch(url || '/');
        if (res.ok) setApiStatus('online');
        else setApiStatus('offline');
      } catch (e) {
        setApiStatus('offline');
      }
    };
    checkApi();
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_team_history', JSON.stringify(messages));
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isOrchestrating) return;
    if (Object.keys(apiKeys).length === 0) { setIsSettingsOpen(true); return; }

    setMessages(prev => [...prev, { role: 'user', content: input, timestamp: Date.now() }]);
    setInput('');
    setIsOrchestrating(true);
    setTasks([]);

    const orchestrator = new WebOrchestrator(apiKeys);
    await orchestrator.processRequest(input, (step) => {
      setStatusMessage(step.message);
      if (step.type === 'task_assigned' || step.type === 'task_completed') {
        setTasks(prev => {
          const exists = prev.find(t => t.id === step.payload.id);
          if (exists) return prev.map(t => t.id === step.payload.id ? step.payload : t);
          return [...prev, step.payload];
        });
      }
      if (step.type === 'final_response') {
        setMessages(prev => [...prev, { role: 'AI Team', content: step.payload, timestamp: Date.now() }]);
        setIsOrchestrating(false);
      }
    });
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30 overflow-hidden">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} apiKeys={apiKeys} onSave={(keys) => {
        setApiKeys(keys);
        localStorage.setItem('ai_team_keys', JSON.stringify(keys));
      }} />
      <ArtifactModal isOpen={!!selectedArtifact} onClose={() => setSelectedArtifact(null)} title={selectedArtifact?.description || ''} role={selectedArtifact?.role || ''} content={selectedArtifact?.result || ''} />

      {/* Sidebar: Navigation */}
      <nav className="w-20 bg-slate-950 border-r border-slate-900 flex flex-col items-center py-8 space-y-8 z-50">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          <Cpu size={24} />
        </div>
        <div className="flex-1 flex flex-col space-y-6 pt-10">
          <button className="p-3 text-blue-500 bg-blue-500/10 rounded-xl transition-all"><LayoutDashboard size={20} /></button>
          <button className="p-3 text-slate-500 hover:text-white transition-all"><Layers size={20} /></button>
          <button className="p-3 text-slate-500 hover:text-white transition-all"><History size={20} /></button>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="p-3 text-slate-500 hover:text-white transition-all"><Settings size={20} /></button>
      </nav>

      {/* Primary Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Interface */}
        <main className="flex-1 flex flex-col bg-slate-950/50 relative">
          <header className="h-16 px-8 flex items-center justify-between border-b border-slate-900 bg-slate-950/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-blue-500" />
              <h2 className="text-sm font-bold tracking-tight text-white uppercase tracking-widest">Collaborative OS</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] ${apiStatus === 'online' ? 'bg-green-500' : apiStatus === 'offline' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`}></div>
                {apiStatus === 'online' ? 'Engine Online' : apiStatus === 'offline' ? 'Engine Offline' : 'Verifying...'}
              </div>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center border border-slate-800 shadow-2xl">
                  <Bot size={40} className="text-blue-500 animate-pulse" />
                </div>
                <h3 className="text-3xl font-black text-white">Assemble Your Team</h3>
                <p className="text-slate-400 leading-relaxed">Describe your project goal. We will analyze the scope, assign specialized experts, and collaborate in real-time to build your vision.</p>
                <div className="grid grid-cols-2 gap-3 w-full pt-4">
                  {['Cloud Architecture', 'React Frontend', 'Go Backend', 'Security Audit'].map(t => (
                    <button key={t} onClick={() => setInput(t)} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-xs font-bold hover:border-blue-500/50 transition-all">{t}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className={`group relative max-w-3xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-[2rem] rounded-tr-sm shadow-xl shadow-blue-900/10' : 'bg-slate-900 border border-slate-800 rounded-[2rem] rounded-tl-sm'} p-6`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${m.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>{m.role}</span>
                    <span className="text-[10px] opacity-40">{new Date(m.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-base leading-relaxed whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}

            {isOrchestrating && (
              <div className="flex items-start gap-4 animate-in fade-in duration-1000">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Zap size={18} className="text-blue-500 animate-bounce" />
                </div>
                <div className="py-2">
                  <p className="text-sm font-bold text-blue-400 flex items-center gap-2 tracking-tight">
                    <span className="animate-pulse-slow italic">{statusMessage}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-10 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
              <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-[2rem] px-4 py-3 focus-within:border-blue-500/50 transition-all shadow-2xl">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="What should we build today?"
                  className="flex-1 bg-transparent px-4 py-2 text-white outline-none placeholder:text-slate-600 font-medium"
                />
                <button
                  onClick={handleSend}
                  disabled={isOrchestrating || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white p-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 shrink-0"
                >
                  {isOrchestrating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Knowledge Base & Shared Memory */}
        <aside className="w-[440px] bg-slate-950 border-l border-slate-900 flex flex-col shrink-0">
          <div className="p-8 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database size={16} className="text-slate-500" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Project Memory</h3>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-blue-500/30 rounded-full" />)}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {tasks.length === 0 && !isOrchestrating && (
              <div className="h-64 border-2 border-dashed border-slate-900 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center">
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-loose">The team's specialized artifacts and code outputs will manifest here.</p>
              </div>
            )}

            {tasks.map(t => (
              <div
                key={t.id}
                onClick={() => t.status === 'completed' && setSelectedArtifact(t)}
                className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${t.status === 'completed' ? 'bg-slate-900/50 border-slate-800 cursor-pointer hover:border-blue-500/40 shadow-xl' : 'bg-blue-600/5 border-blue-600/10 border-dashed animate-pulse'}`}
              >
                {t.status === 'running' && <div className="absolute top-0 left-0 h-1 bg-blue-500 shimmer" />}
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${t.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                    {t.role}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-blue-400 animate-pulse'}`}></div>
                </div>
                <h4 className="text-sm font-bold text-slate-200 mb-3 group-hover:text-white transition-colors leading-snug">{t.description}</h4>
                {t.status === 'completed' && (
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                    <span>Inspect Artifact</span>
                    <ExternalLink size={12} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-8 border-t border-slate-900 bg-slate-950">
            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap size={10} /> Active Team Members
            </h4>
            <div className="flex flex-wrap gap-2">
              {['PM', 'Architect', 'Researcher', 'Dev', 'Reviewer', 'QA'].map(role => (
                <div key={role} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all cursor-default">
                  {role}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
