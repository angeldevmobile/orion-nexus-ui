const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatContext {
  projectId?: string;
  fileContext?: string;
  codeContext?: string;
}

export interface UIComponentData {
  type: 'ui_component';
  description?: string;
  reactCode: string;
  previewHtml: string;
  designInfo: {
    colors: Record<string, string>;
    effects: string[];
    layout: string;
    components: string[];
  };
  files: { path: string; content: string }[];
  timestamp: string;
}

export interface EnrichedPayload {
  previewHtml: string;
  reactCode: string;
  files: { path: string; content: string }[];
  description?: string;
  designInfo?: UIComponentData['designInfo'];
  timestamp: string;
}

export interface GenerateCodeRequest {
  prompt: string;
  language?: string;
  framework?: string;
  context?: ChatContext;
}

class AIService {
  /**
   * Stateless chat — returns the full AI response as a string.
   * Used as a fallback when streaming fails.
   */
  async sendMessage(
    message: string,
    chatHistory: ChatMessage[] = [],
    context?: ChatContext
  ): Promise<string> {
    const response = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, chatHistory, context }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || `HTTP ${response.status}`);
    }

    const data = await response.json() as { response: string };
    return data.response;
  }

  /**
   * Streaming chat via SSE.
   * Calls onChunk for every token. When the backend sends __ENRICHED__
   * data (previewHtml + reactCode), calls onEnriched.
   * Falls back to sendMessage automatically on failure.
   */
  async streamMessage(
    message: string,
    chatHistory: ChatMessage[],
    context: ChatContext | undefined,
    onChunk: (chunk: string) => void,
    onEnriched?: (data: EnrichedPayload) => void,
    onPreview?: (previewHtml: string) => void
  ): Promise<void> {
    const response = await fetch(`${BASE_URL}/ai/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, chatHistory, context }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Stream HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') return;

        try {
          const parsed = JSON.parse(payload) as { chunk?: string; error?: string };
          if (parsed.error) throw new Error(parsed.error);
          if (!parsed.chunk) continue;

          const chunk = parsed.chunk;

          if (chunk === '__BUILDING__') {
            // Heartbeat — backend is generating, nothing to show yet
            onChunk('__BUILDING__');
          } else if (chunk.startsWith('__ENRICHED__:')) {
            if (onEnriched) {
              try {
                const enriched = JSON.parse(chunk.slice('__ENRICHED__:'.length)) as EnrichedPayload;
                onEnriched(enriched);
              } catch (e) {
                console.error('Failed to parse __ENRICHED__ payload', e);
              }
            }
          } else if (chunk.startsWith('__PREVIEW__:')) {
            if (onPreview) {
              try {
                const { previewHtml } = JSON.parse(chunk.slice('__PREVIEW__:'.length)) as { previewHtml: string };
                onPreview(previewHtml);
              } catch (e) {
                console.error('Failed to parse __PREVIEW__ payload', e);
              }
            }
          } else {
            // Conversational text chunk — show to user
            onChunk(chunk);
          }
        } catch {
          // skip malformed SSE lines
        }
      }
    }
  }

  async generateCode(request: GenerateCodeRequest): Promise<string> {
    const response = await fetch(`${BASE_URL}/ai/generate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { code: string };
    return data.code;
  }

  async generateComponent(prompt: string): Promise<{
    design: { palette: Record<string, string>; effects: string[]; layout: string };
    files: { path: string; content: string }[];
    previewHtml: string;
    meta?: { framework?: string; animations?: string[]; styleGuide?: string };
  }> {
    const response = await fetch(`${BASE_URL}/ai/generate-component`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async generateFullProject(prompt: string, framework = 'react') {
    const response = await fetch(`${BASE_URL}/ai/generate-full-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, framework }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async explainCode(code: string, language = 'typescript'): Promise<string> {
    const response = await fetch(`${BASE_URL}/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { explanation: string };
    return data.explanation;
  }

  async optimizeCode(code: string, language = 'typescript'): Promise<string> {
    const response = await fetch(`${BASE_URL}/ai/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { optimized: string };
    return data.optimized;
  }

  async reviewCode(code: string, language = 'typescript'): Promise<string> {
    const response = await fetch(`${BASE_URL}/ai/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { review: string };
    return data.review;
  }
}

export const aiService = new AIService();
