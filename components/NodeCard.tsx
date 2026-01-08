
import React from 'react';
import { Settings, Trash2, GripHorizontal, ChevronRight, Zap } from 'lucide-react';
import { WorkflowStep } from '../types';
import { STEP_TYPES, NODE_WIDTH } from '../constants';

interface NodeCardProps {
  step: WorkflowStep;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (step: WorkflowStep) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({ 
  step, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete,
  onDragStart
}) => {
  const meta = STEP_TYPES[step.type];
  const tier = step.config.modelTier || meta.tier;

  return (
    <div 
      className={`absolute node-card bg-[#1a1a24] rounded-2xl border-2 overflow-hidden cursor-default select-none shadow-2xl transition-all
        ${isSelected ? 'border-indigo-600 scale-[1.05] z-10 ring-8 ring-indigo-600/10' : 'border-white/5 z-0'}
      `}
      style={{ 
        left: step.x, 
        top: step.y, 
        width: NODE_WIDTH,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(step.id);
      }}
    >
      {/* Header */}
      <div 
        className={`px-4 py-3 flex items-center justify-between text-white ${meta.color} cursor-grab active:cursor-grabbing border-b border-black/10`}
        draggable
        onDragStart={(e) => onDragStart(e, step.id)}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-black/20 rounded-md">
            {meta.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-black">{meta.label}</span>
            <div className="flex items-center gap-1">
              <Zap size={8} className={tier === 'PRO' ? 'text-amber-300' : 'text-slate-300'} />
              <span className="text-[8px] font-bold opacity-70">TIER: {tier}</span>
            </div>
          </div>
        </div>
        <GripHorizontal size={14} className="opacity-40" />
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <h3 className="text-sm font-bold text-white leading-snug">{step.title}</h3>
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed h-8 font-medium">
          {step.description || "Clique em configurar para definir este nó."}
        </p>

        {/* Action Bar */}
        <div className="flex justify-between items-center pt-3 mt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
             <button 
               onClick={(e) => { e.stopPropagation(); onDelete(step.id); }}
               className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all border border-red-500/20"
             >
               <Trash2 size={14} />
             </button>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(step); }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
            >
              <Settings size={14} />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-600 font-black uppercase">Output</span>
              <div className={`w-1.5 h-1.5 rounded-full ${step.nextStepId ? 'bg-indigo-500 animate-pulse shadow-lg shadow-indigo-500/50' : 'bg-slate-700'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
