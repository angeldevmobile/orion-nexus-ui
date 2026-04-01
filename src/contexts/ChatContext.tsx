import React, { useState, useCallback, ReactNode } from 'react';
import { ChatContext, Message } from './ChatContextType';
import { aiService, ChatMessage, UIComponentData } from '../service/AiService';
import { useToast } from '../hooks/use-toast';

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [uiData, setUiData] = useState<UIComponentData | null>(null);
  const { toast } = useToast();

  const sendMessage = useCallback(async (prompt: string, fileContext?: string) => {
    if (!prompt.trim()) return;

    const userMsg: Message = { role: 'user', content: prompt, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);
    setStreamingContent('');

    const history: ChatMessage[] = messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
    }));

    const context = fileContext ? { fileContext } : undefined;
    let fullResponse = '';
    let enrichedData: { previewHtml: string; reactCode: string; timestamp: string } | null = null;

    try {
      await aiService.streamMessage(
        prompt,
        history,
        context,
        (chunk) => {
          fullResponse += chunk;
          setStreamingContent(fullResponse);
        },
        (enriched) => {
          enrichedData = enriched;
          setPreviewHtml(enriched.previewHtml);
          setGeneratedCode(enriched.reactCode);
        }
      );
    } catch {
      // Fallback to non-streaming
      try {
        fullResponse = await aiService.sendMessage(prompt, history, context);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al contactar la IA';
        toast({ title: 'Error', description: msg, variant: 'destructive' });
        setSending(false);
        setStreamingContent('');
        return;
      }
    }

    // Parse full response for UI component data
    let parsedUiData: UIComponentData | undefined;
    if (!enrichedData) {
      // Non-streaming path or streaming without enriched event
      try {
        const parsed = JSON.parse(fullResponse) as UIComponentData;
        if (parsed.type === 'ui_component') {
          parsedUiData = parsed;
          setGeneratedCode(parsed.reactCode || parsed.files?.[0]?.content || '');
          setPreviewHtml(parsed.previewHtml || '');
          setUiData(parsed);
        }
      } catch {
        // plain text response — no UI data
      }
    } else {
      // Enriched data came via streaming
      try {
        const parsed = JSON.parse(fullResponse) as UIComponentData;
        if (parsed.type === 'ui_component') {
          parsedUiData = {
            ...parsed,
            reactCode: enrichedData.reactCode,
            previewHtml: enrichedData.previewHtml,
          };
          setUiData(parsedUiData);
        }
      } catch {
        // JSON in fullResponse may be valid but just couldn't parse — enrichedData is already set
      }
    }

    const assistantMsg: Message = {
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date(),
      uiData: parsedUiData,
    };

    setMessages(prev => [...prev, assistantMsg]);
    setStreamingContent('');
    setSending(false);
  }, [messages, toast]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setGeneratedCode('');
    setPreviewHtml('');
    setUiData(null);
    setStreamingContent('');
  }, []);

  return (
    <ChatContext.Provider value={{
      messages,
      sending,
      streamingContent,
      generatedCode,
      previewHtml,
      uiData,
      sendMessage,
      clearChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
