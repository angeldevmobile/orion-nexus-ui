import { ChatMessage, ChatContext } from './chatSession';

export type { ChatMessage, ChatContext };

export interface GenerateResponseOptions {
  chatHistory?: ChatMessage[];
  context?: ChatContext;
  userId?: string;
  userPlan?: 'free' | 'pro' | 'business' | 'enterprise';
}

export interface GenerateCodeOptions {
  prompt: string;
  language?: string;
  framework?: string;
  context?: ChatContext;
  returnJson?: boolean;
  userId?: string;
  userPlan?: 'free' | 'pro' | 'business' | 'enterprise';
}

export type GeneratedComponentResult = {
  design: {
    palette: Record<string, string>;
    effects: string[];
    layout: string;
    fields?: string[];
  };
  files: { path: string; content: string }[];
  previewHtml: string;
  meta?: { framework?: string; animations?: string[]; styleGuide?: string };
};

export interface ProjectStructure {
  name: string;
  description: string;
  files: ProjectFile[];
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
}

export interface ProjectFile {
  path: string;
  content: string;
  type: 'file' | 'directory';
}

export interface FullProjectResult {
  files: Record<string, string>;
  meta: {
    name: string;
    description: string;
    framework: string;
    features: string[];
  };
}

// Internal message types for AI SDKs
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}
