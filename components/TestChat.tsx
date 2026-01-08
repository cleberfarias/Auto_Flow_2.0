
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, RefreshCcw, X, Loader2 } from 'lucide-react';
import { Automation, WorkflowStep } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface TestChatProps {
  automation: Automation;
  onClose: () => void;
}

export const TestChat: React.FC<TestChatProps> = ({ automation, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: `Simulador Ativo: ${automation.name}. Como posso ajudar?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getAiResponse = async (userText: string, step: WorkflowStep) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Você é um chatbot simulando um fluxo de automação conversacional.
      O nome da automação é: "${automation.name}".
      O nó atual que você está executando é do tipo: "${step.type}".
      Título do Nó: "${step.title}"
      Descrição do Nó: "${step.description}"
      
      Histórico da conversa:
      ${messages.map(m => `${m.sender}: ${m.text}`).join('\n')}
      Usuário enviou agora: "${userText}"
      
      INSTRUÇÃO:
      Responda ao usuário como se você fosse o bot configurado neste nó específico. 
      Seja breve e natural. Não mencione detalhes técnicos (como o nome do nó ou ID) na resposta final.
      Se o nó for um 'AI_AGENT', use sua inteligência para responder à intenção.
      Se o nó for um 'CHATGURU_REPLY', siga o tom da descrição.
      Se for 'MCP_TOOL', simule que buscou a informação e retorne algo coerente.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Desculpe, tive um erro ao processar sua resposta.";
    } catch (err) {
      console.error("Erro na simulação IA:", err);
      return `[Executando ${step.title}]: ${step.description}`;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input, timestamp: new Date() };
    const currentInput = input;
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Encontra o próximo passo
    let nextStep: WorkflowStep | undefined;
    if (!currentStepId) {
      nextStep = automation.steps.find(s => s.type === 'CHATGURU_TRIGGER');
    } else {
      const current = automation.steps.find(s => s.id === currentStepId);
      nextStep = automation.steps.find(s => s.id === current?.nextStepId);
    }

    if (nextStep) {
      const botText = await getAiResponse(currentInput, nextStep);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText,
        timestamp: new Date()
      }]);
      setCurrentStepId(nextStep.id);
    } else {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Fluxo encerrado. Não há mais passos configurados.",
        timestamp: new Date()
      }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="fixed right-6 bottom-6 w-[400px] h-[600px] bg-[#1a1a24] rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] flex flex-col border border-white/10 overflow-hidden z-50 animate-in slide-in-from-bottom-10 duration-300 ring-1 ring-white/5">
      {/* Header */}
      <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Bot size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight leading-none">Simulador de IA</h4>
            <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Modo Rascunho</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
             onClick={() => { setMessages([]); setCurrentStepId(null); }}
             className="p-2 hover:bg-white/10 rounded-xl transition-colors"
             title="Reiniciar"
          >
            <RefreshCcw size={16} />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0d0d12]">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xl
              ${m.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none border-t border-white/20' 
                : 'bg-[#1a1a24] text-slate-300 border border-white/5 rounded-tl-none'}
            `}>
              {m.text.split('\n').map((line, i) => <div key={i} className="mb-1 last:mb-0">{line}</div>)}
              <div className={`text-[9px] mt-2 font-bold opacity-40 uppercase tracking-widest ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
             <div className="bg-[#1a1a24] border border-white/5 rounded-2xl rounded-tl-none px-5 py-3 shadow-xl">
               <div className="flex gap-1.5 items-center">
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                 <span className="text-[10px] text-slate-500 font-black uppercase ml-2 tracking-widest">IA Pensando...</span>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-[#121218] border-t border-white/5">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-3 bg-[#0a0a0c] p-1.5 rounded-2xl border border-white/10 ring-1 ring-white/5">
          <input 
            type="text" 
            placeholder="Interagir com o bot..." 
            className="flex-1 bg-transparent border-none px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none font-medium"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-20 shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};
