
import React from 'react';
import { 
  Zap, 
  MessageSquare, 
  LayoutList, 
  Tag, 
  UserPlus, 
  Split, 
  Globe, 
  Clock, 
  XCircle,
  Cpu,
  Bot,
  Terminal
} from 'lucide-react';
import { StepType } from './types';

export const STEP_TYPES: Record<StepType, { label: string; icon: React.ReactNode; color: string; tier: string }> = {
  CHATGURU_TRIGGER: { 
    label: 'Gatilho WhatsApp', 
    icon: <Zap size={18} />, 
    color: 'bg-emerald-600',
    tier: 'System'
  },
  CHATGURU_REPLY: { 
    label: 'Resposta Texto', 
    icon: <MessageSquare size={18} />, 
    color: 'bg-indigo-500',
    tier: 'LITE'
  },
  CHATGURU_BUTTONS: { 
    label: 'Botões Interativos', 
    icon: <LayoutList size={18} />, 
    color: 'bg-violet-500',
    tier: 'LITE'
  },
  CHATGURU_TAG: { 
    label: 'Gerenciar Tags', 
    icon: <Tag size={18} />, 
    color: 'bg-blue-500',
    tier: 'System'
  },
  CHATGURU_TRANSFER: { 
    label: 'Transbordo Humano', 
    icon: <UserPlus size={18} />, 
    color: 'bg-orange-500',
    tier: 'System'
  },
  CONDITION: { 
    label: 'Lógica / Filtro', 
    icon: <Split size={18} />, 
    color: 'bg-fuchsia-500',
    tier: 'FLASH'
  },
  AI_AGENT: { 
    label: 'Agente Cognitivo', 
    icon: <Bot size={18} />, 
    color: 'bg-purple-600',
    tier: 'PRO'
  },
  MCP_TOOL: { 
    label: 'Ferramenta MCP', 
    icon: <Terminal size={18} />, 
    color: 'bg-amber-500',
    tier: 'External'
  },
  API_CALL: { 
    label: 'Integração API', 
    icon: <Globe size={18} />, 
    color: 'bg-slate-600',
    tier: 'System'
  },
  DELAY: { 
    label: 'Aguardar', 
    icon: <Clock size={18} />, 
    color: 'bg-slate-400',
    tier: 'System'
  },
  END: { 
    label: 'Encerrar Fluxo', 
    icon: <XCircle size={18} />, 
    color: 'bg-rose-700',
    tier: 'System'
  }
};

export const NODE_WIDTH = 280;
