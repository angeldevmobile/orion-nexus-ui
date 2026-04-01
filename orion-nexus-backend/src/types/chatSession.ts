export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatContext {
  projectId?: number;
  fileContext?: string;
  codeContext?: string;
}

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  messages: ChatMessage[];
  context?: ChatContext;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}