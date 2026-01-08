
import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Plus, Trash2, Cpu, Terminal, Globe } from 'lucide-react';
import { WorkflowStep, StepType, AIModelTier } from '../types';
import { STEP_TYPES } from '../constants';
import { suggestStepContent } from '../services/geminiService';

interface EditorModalProps {
  step: WorkflowStep;
  allSteps: WorkflowStep[];
  onClose: () => void;
  onSave: (step: WorkflowStep) => void;
}

export const EditorModal: React.FC<EditorModalProps> = ({ step, allSteps, onClose, onSave }) => {
  const [formData, setFormData] = useState<WorkflowStep>({ ...step });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiImprove = async () => {
    setIsGenerating(true);
    const suggestion = await suggestStepContent(formData.type, formData.title || "Interação no WhatsApp");
    setFormData(prev => ({ ...prev, ...suggestion }));
    setIsGenerating(false);
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1a1a24] w-full max-w-2xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#121218]/50">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl text-white ${STEP_TYPES[formData.type].color} shadow-xl shadow-current/20`}>
              {STEP_TYPES[formData.type].icon}
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">{STEP_TYPES[formData.type].label}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configuração do Nó</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <label className="block">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Título Visual</span>
                <input 
                  type="text" 
                  className="w-full bg-[#0d0d12] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Descrição / Conteúdo</span>
                <textarea 
                  className="w-full bg-[#0d0d12] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all h-32 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </label>
            </div>

            <div className="space-y-6">
              <label className="block">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Próximo Passo (Conexão)</span>
                <select 
                  className="w-full bg-[#0d0d12] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                  value={formData.nextStepId || ''}
                  onChange={e => setFormData({ ...formData, nextStepId: e.target.value || undefined })}
                >
                  <option value="">Nenhum (Finalizar)</option>
                  {allSteps.filter(s => s.id !== formData.id).map(s => (
                    <option key={s.id} value={s.id}>{s.title} ({STEP_TYPES[s.type].label})</option>
                  ))}
                </select>
              </label>

              <div className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-3">
                 <div className="flex items-center gap-2 mb-2">
                   <Cpu size={14} className="text-indigo-400" />
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Inteligência Artificial</span>
                 </div>
                 <select 
                    className="w-full bg-[#0d0d12] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    value={formData.config.modelTier}
                    onChange={e => setFormData({ ...formData, config: { ...formData.config, modelTier: e.target.value as AIModelTier } })}
                 >
                   <option value="LITE">Gemini Flash Lite (Econômico)</option>
                   <option value="FLASH">Gemini Flash (Velocidade)</option>
                   <option value="PRO">Gemini Pro (Arquitetura)</option>
                 </select>
                 <button 
                  onClick={handleAiImprove}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 text-xs font-bold shadow-lg shadow-indigo-600/20"
                >
                  <Sparkles size={14} className={isGenerating ? "animate-spin" : ""} />
                  {isGenerating ? 'ANALISANDO...' : 'OTIMIZAR COM IA'}
                </button>
              </div>
            </div>
          </div>

          {/* Special Configs for MCP or API */}
          {formData.type === 'MCP_TOOL' && (
             <div className="pt-6 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2">
               <div className="flex items-center gap-2">
                 <Terminal size={16} className="text-amber-500" />
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Configuração do Servidor MCP</h4>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input 
                   type="text" 
                   placeholder="Comando MCP (ex: check_stock)" 
                   className="bg-[#0d0d12] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none"
                   value={formData.config.mcpCommand || ''}
                   onChange={e => setFormData({ ...formData, config: { ...formData.config, mcpCommand: e.target.value } })}
                 />
                 <input 
                   type="text" 
                   placeholder="Endpoint MCP (URL do Servidor)" 
                   className="bg-[#0d0d12] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none"
                   value={formData.config.mcpEndpoint || ''}
                   onChange={e => setFormData({ ...formData, config: { ...formData.config, mcpEndpoint: e.target.value } })}
                 />
               </div>
             </div>
          )}

          {formData.type === 'API_CALL' && (
             <div className="pt-6 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2">
               <div className="flex items-center gap-2">
                 <Globe size={16} className="text-blue-500" />
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Integração Externa (Webhook)</h4>
               </div>
               <div className="flex gap-2">
                 <select className="bg-[#0d0d12] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none font-bold">
                   <option>GET</option>
                   <option>POST</option>
                 </select>
                 <input 
                   type="text" 
                   placeholder="https://api.empresa.com/v1/dados" 
                   className="flex-1 bg-[#0d0d12] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none"
                 />
               </div>
             </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 border-t border-white/5 flex justify-end gap-3 bg-[#121218]/50">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-xs font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            Descartar
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-10 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Save size={16} />
            SALVAR ALTERAÇÕES
          </button>
        </div>
      </div>
    </div>
  );
};
