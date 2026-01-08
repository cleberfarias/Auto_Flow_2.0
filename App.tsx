
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, 
  Users, 
  Workflow, 
  ChevronRight,
  Settings,
  HelpCircle,
  Play,
  Maximize,
  Sparkles,
  Layers,
  Activity,
  Loader2,
  Smartphone,
  CloudLightning,
  Terminal,
  Cpu,
  BarChart3,
  Trash2,
  FolderPlus,
  UserPlus
} from 'lucide-react';
import { Client, Automation, WorkflowStep, StepType, MCPConfig } from './types';
import { NodeCard } from './components/NodeCard';
import { EditorModal } from './components/EditorModal';
import { TestChat } from './components/TestChat';
import { STEP_TYPES } from './constants';
import { generateWorkflowFromPrompt } from './services/geminiService';

const LOCAL_STORAGE_KEY = 'autoflow_chatguru_mcp_v2';

const App: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [currentAutomationId, setCurrentAutomationId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [showTestChat, setShowTestChat] = useState(false);
  const [canvasTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const draggingId = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Load Initial State
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && data.clients) {
          setClients(data.clients);
          return;
        }
      }
    } catch (e) { console.warn("Cache reset."); }

    // Demo Initial Data
    const demoClient: Client = {
      id: 'c1',
      name: 'Chatguru Demo',
      email: 'demo@guru.com',
      mcpServers: [
        { id: 'mcp1', name: 'Estoque Local', url: 'http://localhost:3001', status: 'connected' }
      ],
      automations: [{
        id: 'a1',
        name: 'Fluxo Boas-vindas',
        description: 'Automação inicial',
        isActive: true,
        updatedAt: new Date().toISOString(),
        steps: [
          { id: 's1', type: 'CHATGURU_TRIGGER', title: 'Olá!', description: 'Início da conversa', x: 100, y: 250, config: {} }
        ]
      }]
    };
    setClients([demoClient]);
  }, []);

  const saveToLocalStorage = useCallback((newClients: Client[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ clients: newClients }));
  }, []);

  // Creation Functions
  const createNewClient = () => {
    const name = prompt("Nome do Cliente/Empresa:");
    if (!name) return;
    const newClient: Client = {
      id: `c_${Date.now()}`,
      name,
      email: '',
      automations: [],
      mcpServers: []
    };
    const updated = [...clients, newClient];
    setClients(updated);
    saveToLocalStorage(updated);
    setCurrentClientId(newClient.id);
  };

  const createNewAutomation = () => {
    if (!currentClientId) {
      alert("Selecione um cliente primeiro!");
      return;
    }
    const name = prompt("Nome da Automação:");
    if (!name) return;
    const newAuto: Automation = {
      id: `a_${Date.now()}`,
      name,
      description: 'Nova automação criada.',
      isActive: true,
      updatedAt: new Date().toISOString(),
      steps: []
    };
    const updated = clients.map(c => c.id === currentClientId ? {
      ...c, automations: [...c.automations, newAuto]
    } : c);
    setClients(updated);
    saveToLocalStorage(updated);
    setCurrentAutomationId(newAuto.id);
  };

  // Node Management
  const addStep = (type: StepType) => {
    if (!currentAutomationId) {
      alert("Selecione um fluxo no menu lateral antes de adicionar nós!");
      return;
    }
    const meta = STEP_TYPES[type];
    const newStep: WorkflowStep = {
      id: `s_${Date.now()}`,
      type,
      title: meta.label,
      description: 'Configure os detalhes deste passo.',
      x: 400,
      y: 300,
      config: {
        modelTier: meta.tier as any
      }
    };
    const updated = clients.map(c => c.id === currentClientId ? {
      ...c, automations: c.automations.map(a => a.id === currentAutomationId ? { ...a, steps: [...a.steps, newStep] } : a)
    } : c);
    setClients(updated);
    saveToLocalStorage(updated);
  };

  const updateStep = (updatedStep: WorkflowStep) => {
    const updated = clients.map(c => c.id === currentClientId ? {
      ...c, automations: c.automations.map(a => a.id === currentAutomationId ? {
        ...a, steps: a.steps.map(s => s.id === updatedStep.id ? updatedStep : s)
      } : a)
    } : c);
    setClients(updated);
    saveToLocalStorage(updated);
  };

  const deleteStep = (id: string) => {
    const updated = clients.map(c => c.id === currentClientId ? {
      ...c, automations: c.automations.map(a => a.id === currentAutomationId ? {
        ...a, steps: a.steps.filter(s => s.id !== id).map(s => s.nextStepId === id ? { ...s, nextStepId: undefined } : s)
      } : a)
    } : c);
    setClients(updated);
    saveToLocalStorage(updated);
  };

  const handleAiWorkflowGen = async () => {
    if (!aiPrompt.trim() || !currentAutomationId) return;
    setIsAiGenerating(true);
    try {
      const newSteps = await generateWorkflowFromPrompt(aiPrompt);
      if (newSteps.length > 0) {
        const updated = clients.map(c => c.id === currentClientId ? {
          ...c, automations: c.automations.map(a => a.id === currentAutomationId ? { ...a, steps: [...a.steps, ...newSteps] } : a)
        } : c);
        setClients(updated);
        saveToLocalStorage(updated);
        setAiPrompt('');
      }
    } catch (e) { console.error(e); } finally { setIsAiGenerating(false); }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    draggingId.current = id;
    const currentClient = clients.find(c => c.id === currentClientId);
    const currentAutomation = currentClient?.automations.find(a => a.id === currentAutomationId);
    const step = currentAutomation?.steps.find(s => s.id === id);
    if (step) dragOffset.current = { x: e.clientX - step.x, y: e.clientY - step.y };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggingId.current) {
      const currentClient = clients.find(c => c.id === currentClientId);
      const currentAutomation = currentClient?.automations.find(a => a.id === currentAutomationId);
      if (currentAutomation) {
        const updatedSteps = currentAutomation.steps.map(s => 
          s.id === draggingId.current ? { ...s, x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y } : s
        );
        setClients(clients.map(c => c.id === currentClientId ? {
          ...c, automations: c.automations.map(a => a.id === currentAutomationId ? { ...a, steps: updatedSteps } : a)
        } : c));
      }
    }
  };

  const currentClient = clients.find(c => c.id === currentClientId);
  const currentAutomation = currentClient?.automations.find(a => a.id === currentAutomationId);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] text-slate-300 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-[#121218] border-r border-white/5 flex flex-col z-20 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Cpu size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">AutoFlow <span className="text-indigo-400">2.0</span></h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Hierarchical & MCP</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users size={12} /> Workspaces
              </h2>
              <button onClick={createNewClient} className="p-1 hover:bg-white/5 rounded-md text-indigo-400 transition-colors">
                <UserPlus size={14} />
              </button>
            </div>

            {clients.map(client => (
              <div key={client.id} className="space-y-1">
                <button 
                  onClick={() => { setCurrentClientId(client.id); setCurrentAutomationId(null); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all
                    ${currentClientId === client.id ? 'bg-indigo-500/10 text-white ring-1 ring-indigo-500/30 shadow-inner' : 'text-slate-500 hover:bg-white/5'}
                  `}
                >
                  <span className="truncate font-medium">{client.name}</span>
                  {currentClientId === client.id && <ChevronRight size={14} className="text-indigo-400" />}
                </button>
                
                {currentClientId === client.id && (
                  <div className="pl-4 pr-2 py-2 space-y-1 animate-in slide-in-from-left-2 duration-200">
                    <div className="flex items-center justify-between px-2 py-1">
                       <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Flows</span>
                       <button onClick={createNewAutomation} className="p-1 hover:bg-white/5 rounded-md text-emerald-400">
                         <FolderPlus size={12} />
                       </button>
                    </div>
                    {client.automations.map(auto => (
                      <button 
                        key={auto.id}
                        onClick={() => setCurrentAutomationId(auto.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2
                          ${currentAutomationId === auto.id ? 'text-indigo-400 bg-indigo-500/5 ring-1 ring-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}
                        `}
                      >
                        <Workflow size={12} className={currentAutomationId === auto.id ? 'text-indigo-400' : 'text-slate-700'} />
                        {auto.name}
                      </button>
                    ))}
                    {client.automations.length === 0 && (
                      <p className="text-[10px] text-slate-700 italic px-4 py-2">Nenhum fluxo criado.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {currentClientId && (
            <div className="space-y-3 pt-4 border-t border-white/5">
              <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Terminal size={12} /> Servidores MCP
              </h2>
              <div className="space-y-2">
                {currentClient?.mcpServers.map(mcp => (
                  <div key={mcp.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{mcp.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono truncate w-32">{mcp.url}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>
        
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
           <div className="space-y-3 text-center">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Token Efficiency</p>
             <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                   <p className="text-[8px] text-indigo-400 font-bold">Saving</p>
                   <p className="text-xs font-black text-white">88.4%</p>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                   <p className="text-[8px] text-emerald-400 font-bold">Tasks/s</p>
                   <p className="text-xs font-black text-white">12.5k</p>
                </div>
             </div>
           </div>
        </div>
      </aside>

      {/* Editor Main */}
      <main className="flex-1 relative flex flex-col overflow-hidden bg-[#0d0d12]">
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between z-10 bg-[#0d0d12]/80 backdrop-blur-xl">
          <div className="flex flex-col">
            {currentAutomation ? (
              <>
                <h2 className="text-xl font-black text-white tracking-tight">{currentAutomation.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full ring-1 ring-white/10">
                    <CloudLightning size={10} className="text-amber-500" /> Chatguru API
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full ring-1 ring-white/10">
                    <Cpu size={10} className="text-indigo-500" /> Hierarchical AI
                  </span>
                </div>
              </>
            ) : (
              <h2 className="text-slate-500 font-bold text-lg">Selecione um Workspace no Menu Lateral</h2>
            )}
          </div>

          <div className="flex items-center gap-4">
             <button 
               disabled={!currentAutomation} 
               onClick={() => setShowTestChat(true)}
               className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-20 active:scale-95 shadow-xl shadow-indigo-600/20"
             >
               <Play size={14} fill="white" />
               SIMULAR FLUXO
             </button>
          </div>
        </header>

        <div className="flex-1 relative bg-[#0a0a0c] overflow-hidden" onDragOver={handleDragOver} onDrop={() => draggingId.current = null}>
           <div className="absolute inset-0 canvas-grid opacity-10"></div>
          
          {currentAutomation ? (
            <>
              {/* Nodes Selection */}
              <div className="absolute top-8 left-8 flex flex-col gap-4 z-10">
                <div className="bg-[#1a1a24]/90 backdrop-blur-2xl p-3 rounded-3xl shadow-2xl border border-white/10 flex flex-col gap-2 ring-1 ring-white/5">
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 px-3">Paleta de Nós</p>
                   {(Object.keys(STEP_TYPES) as StepType[]).map(type => (
                     <button 
                       key={type} 
                       onClick={() => addStep(type)} 
                       className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white flex items-center gap-3 group transition-all"
                       title={STEP_TYPES[type].label}
                     >
                       <div className={`p-2 rounded-lg text-white ${STEP_TYPES[type].color} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
                         {STEP_TYPES[type].icon}
                       </div>
                       <div className="flex flex-col items-start leading-none hidden lg:flex">
                          <span className="text-[10px] font-bold uppercase tracking-tight">{STEP_TYPES[type].label}</span>
                          <span className="text-[8px] text-slate-600 font-bold mt-0.5">Tier: {STEP_TYPES[type].tier}</span>
                       </div>
                     </button>
                   ))}
                </div>
              </div>

              {/* AI Input */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-6">
                <div className="bg-[#121218]/95 backdrop-blur-3xl p-2 rounded-full shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] border border-white/10 flex gap-2 ring-1 ring-white/10">
                   <div className="flex-1 flex items-center px-6">
                     <Sparkles size={16} className="text-indigo-400 mr-4 shrink-0" />
                     <input 
                       type="text" 
                       placeholder="Peça ao Arquiteto: 'Crie um suporte que usa MCP para consultar pedidos'" 
                       className="w-full py-3 bg-transparent text-sm outline-none placeholder:text-slate-600 text-white font-medium"
                       value={aiPrompt} 
                       onChange={e => setAiPrompt(e.target.value)} 
                       onKeyPress={e => e.key === 'Enter' && handleAiWorkflowGen()} 
                     />
                   </div>
                   <button 
                     onClick={handleAiWorkflowGen} 
                     disabled={isAiGenerating || !aiPrompt.trim()}
                     className="px-6 py-3 bg-indigo-600 text-white rounded-full text-xs font-black hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/30"
                   >
                     {isAiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                     GERAR
                   </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="w-full h-full relative overflow-hidden" onClick={() => setSelectedStepId(null)}>
                <div className="absolute inset-0" style={{ transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})` }}>
                  <svg className="absolute inset-0 pointer-events-none w-[10000px] h-[10000px]">
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orientation="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#312e81" />
                      </marker>
                    </defs>
                    {currentAutomation.steps.map(step => {
                      if (!step.nextStepId) return null;
                      const next = currentAutomation.steps.find(s => s.id === step.nextStepId);
                      if (!next) return null;
                      return (
                        <path 
                          key={step.id} 
                          d={`M ${step.x + 280} ${step.y + 70} C ${(step.x + 280 + next.x) / 2} ${step.y + 70}, ${(step.x + 280 + next.x) / 2} ${next.y + 20}, ${next.x} ${next.y + 20}`}
                          stroke="#312e81" 
                          strokeWidth="2" 
                          fill="none"
                          markerEnd="url(#arrowhead)"
                          className="opacity-40"
                        />
                      );
                    })}
                  </svg>
                  {currentAutomation.steps.map(step => (
                    <NodeCard 
                      key={step.id} 
                      step={step} 
                      isSelected={selectedStepId === step.id}
                      onSelect={setSelectedStepId} 
                      onEdit={setEditingStep} 
                      onDelete={deleteStep} 
                      onDragStart={handleDragStart} 
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-500 mb-8 border border-indigo-500/20 shadow-2xl">
                <Workflow size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">AutoFlow 2.0 Ativo</h3>
              <p className="text-slate-500 max-w-sm font-medium leading-relaxed mb-8">
                Para começar, crie ou selecione um <b>Workspace</b> e depois uma <b>Automação</b> no menu lateral.
              </p>
              {!currentClientId && (
                <button onClick={createNewClient} className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black text-xs rounded-xl hover:bg-slate-200 transition-all">
                   <UserPlus size={16} /> CRIAR PRIMEIRO CLIENTE
                </button>
              )}
              {currentClientId && !currentAutomationId && (
                <button onClick={createNewAutomation} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black text-xs rounded-xl hover:bg-indigo-500 transition-all">
                   <FolderPlus size={16} /> CRIAR NOVO FLUXO
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {editingStep && currentAutomation && (
        <EditorModal 
          step={editingStep} 
          allSteps={currentAutomation.steps} 
          onClose={() => setEditingStep(null)} 
          onSave={updateStep} 
        />
      )}
      {showTestChat && currentAutomation && (
        <TestChat automation={currentAutomation} onClose={() => setShowTestChat(false)} />
      )}
    </div>
  );
};

export default App;
