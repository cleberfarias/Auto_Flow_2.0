
import { GoogleGenAI, Type } from "@google/genai";
import { WorkflowStep, StepType } from "../types";

// Função de Nível PRO: Criação de fluxo completa
export const generateWorkflowFromPrompt = async (prompt: string): Promise<WorkflowStep[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Usamos o modelo mais potente para planejar a arquitetura do fluxo
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Você é o Arquiteto Master de Automação para Chatguru e MCP (Model Context Protocol).
    Contexto: O usuário quer "${prompt}".
    
    Instruções Hierárquicas:
    1. Identifique se o fluxo precisa de dados externos (use MCP_TOOL).
    2. Identifique se precisa de raciocínio complexo (use AI_AGENT).
    3. Use passos simples para mensagens padrão (CHATGURU_REPLY).
    
    Tipos de nós disponíveis: CHATGURU_TRIGGER, CHATGURU_REPLY, CHATGURU_BUTTONS, CHATGURU_TAG, CHATGURU_TRANSFER, CONDITION, AI_AGENT, MCP_TOOL, END.
    
    Retorne um JSON array seguindo a estrutura de WorkflowStep.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER },
            config: { 
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                modelTier: { type: Type.STRING, enum: ['PRO', 'FLASH', 'LITE'] }
              }
            },
            nextStepId: { type: Type.STRING }
          },
          required: ["id", "type", "title", "description", "x", "y", "config"]
        }
      }
    }
  });

  try {
    const text = response.text?.trim();
    return text ? JSON.parse(text) : [];
  } catch (err) {
    console.error("Architect Generation Error:", err);
    return [];
  }
};

// Função de Nível FLASH/LITE: Sugestões rápidas e baratas
export const suggestStepContent = async (stepType: StepType, context: string): Promise<{ title: string; description: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Usamos o Flash Lite para tarefas triviais de preenchimento, economizando 10x em tokens
  const response = await ai.models.generateContent({
    model: "gemini-flash-lite-latest",
    contents: `Sugira título e descrição curta para nó "${stepType}" no contexto: ${context}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "description"]
      }
    }
  });

  try {
    const text = response.text?.trim();
    return text ? JSON.parse(text) : { title: "Novo Passo", description: "Configurado automaticamente" };
  } catch {
    return { title: "Erro na Sugestão", description: "Configuração manual necessária." };
  }
};
