import { createContext } from 'react';
import { UIComponentData } from '../service/AiService';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  uiData?: UIComponentData;
}

export type ChatContextType = {
  messages: Message[];
  sending: boolean;
  streamingContent: string;   // live buffer while SSE streams
  generatedCode: string;      // reactCode from last UI response
  previewHtml: string;        // previewHtml for iframe
  uiData: UIComponentData | null;
  sendMessage: (prompt: string, fileContext?: string) => Promise<void>;
  clearChat: () => void;
};

export const ChatContext = createContext<ChatContextType | undefined>(undefined);
