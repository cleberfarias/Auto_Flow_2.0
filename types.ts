
export type StepType = 
  | 'CHATGURU_TRIGGER' 
  | 'CHATGURU_REPLY' 
  | 'CHATGURU_BUTTONS'
  | 'CHATGURU_TAG' 
  | 'CHATGURU_TRANSFER'
  | 'CONDITION' 
  | 'API_CALL' 
  | 'MCP_TOOL'
  | 'AI_AGENT'
  | 'DELAY' 
  | 'END';

export type AIModelTier = 'PRO' | 'FLASH' | 'LITE';

export interface WorkflowStep {
  id: string;
  type: StepType;
  title: string;
  description: string;
  x: number;
  y: number;
  config: {
    modelTier?: AIModelTier;
    mcpEndpoint?: string;
    mcpCommand?: string;
    [key: string]: any;
  };
  nextStepId?: string;
  branches?: { condition: string; nextStepId: string }[];
}

export interface MCPConfig {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'error';
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  automations: Automation[];
  mcpServers: MCPConfig[];
}
