import { useEffect, useRef, useState } from "react";
import { RefreshCw, Send, Sparkles } from "lucide-react";
import { ChatMessage, User } from "../types";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { requestAssistantReply } from "../lib/ai";
import MarkdownMessage from "./MarkdownMessage";

interface AIAssistantViewProps {
  user: User;
}

const SUGGESTIONS = [
  "Recommend a high-energy seat under $200",
  "Where is the Brazilian fan section?",
  "What's the atmosphere like in Section 302?",
  "Show me VIP premium seating options",
  "Tell me about the live Brazil vs France match stats",
];

function createWelcomeMessage(id = "welcome-msg"): ChatMessage {
  return {
    id,
    role: "model",
    content: `**Welcome to Pitch Precision AI.** I can help with stadium seating, accessible entrances, crowd conditions, and match-day guidance.\n\n- Find affordable or shaded seats\n- Locate accessible entrances and amenities\n- Get guidance for gates, transport, and the match`,
    timestamp: new Date(),
  };
}

export default function AIAssistantView({ user }: AIAssistantViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const requestControllerRef = useRef<AbortController | null>(null);

  useAutoScroll(messagesEndRef, [messages, isTyping]);
  useEffect(() => () => requestControllerRef.current?.abort(), []);

  const handleSend = async (suggestion?: string) => {
    const text = (suggestion ?? input).trim();
    if (!text || isTyping) return;

    if (!suggestion) setInput("");

    const userMessage: ChatMessage = {
      id: `message-${Date.now()}-user`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    const conversation = [...messages, userMessage];
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setMessages(conversation);
    setIsTyping(true);

    try {
      const content = await requestAssistantReply(
        conversation.map(({ role, content: messageContent }) => ({ role, content: messageContent })),
        {
          userName: user.name,
          userPremium: user.isPremium,
          currentMatch: "Brazil vs France",
          stadiumVenue: "MetLife Stadium, New Jersey",
          liveScore: "2 - 1",
          liveTime: "72'",
        },
        controller.signal,
      );
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: `message-${Date.now()}-assistant`, role: "model", content, timestamp: new Date() },
      ]);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const detail = error instanceof Error ? error.message : "Unable to reach the service.";
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `message-${Date.now()}-error`,
          role: "model",
          content: `**Service interrupted.** I couldn't reach the assistant. Please try again. (${detail})`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        setIsTyping(false);
      }
    }
  };

  const handleReset = () => {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    setIsTyping(false);
    setInput("");
    setMessages([createWelcomeMessage("welcome-msg-reset")]);
  };

  return (
    <section className="glass-panel rounded-2xl border border-white/5 shadow-xl h-[650px] flex flex-col overflow-hidden relative" aria-labelledby="ai-assistant-heading">
      <header className="bg-surface-container/60 backdrop-blur-md px-6 py-4 border-b border-white/5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary" aria-hidden="true">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 id="ai-assistant-heading" className="font-display font-extrabold text-sm text-on-surface uppercase">AI Assistant</h2>
            <p className="text-[10px] text-on-surface-variant/70 font-mono">PITCH PRECISION MATCH-DAY GUIDANCE</p>
          </div>
        </div>
        <button onClick={handleReset} type="button" title="Reset conversation" aria-label="Reset chat conversation" className="text-on-surface-variant/60 hover:text-error p-2 rounded-lg bg-surface-container border border-white/10 active:scale-95 duration-150">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
        </button>
      </header>

      <div className="bg-surface-container-low/40 px-4 py-3 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-none" role="group" aria-label="Quick suggestion prompts">
        {SUGGESTIONS.map((suggestion) => (
          <button key={suggestion} onClick={() => void handleSend(suggestion)} type="button" disabled={isTyping} aria-label={`Ask: ${suggestion}`} className="flex-shrink-0 bg-surface-container/50 border border-white/5 hover:border-tertiary/30 hover:bg-white/5 text-[10px] font-medium text-on-surface px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
            {suggestion}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4" aria-live="polite" aria-label="Chat conversation" role="log" aria-busy={isTyping}>
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <article key={message.id} className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border text-xs font-bold ${isUser ? "bg-primary-container/20 border-primary-light/10 text-primary-light" : "bg-tertiary-container/30 border-tertiary/10 text-tertiary"}`} aria-hidden="true">
                {isUser ? "ME" : "AI"}
              </div>
              <div className={`rounded-2xl px-4 py-3 border ${isUser ? "bg-surface-container-high border-white/10 text-on-surface" : "bg-surface-container-low/60 border-white/5 shadow-md"}`}>
                <MarkdownMessage content={message.content} />
                <time className="block text-[8px] text-on-surface-variant/30 font-mono mt-1 text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </time>
              </div>
            </article>
          );
        })}
        {isTyping && <div className="flex gap-3 mr-auto max-w-[70%]" aria-label="AI is thinking" role="status"><div className="w-8 h-8 rounded-full bg-tertiary-container/20 border border-tertiary/10 flex items-center justify-center text-tertiary text-xs font-bold" aria-hidden="true">AI</div><div className="bg-surface-container-low/60 border border-white/5 rounded-2xl px-5 py-3.5">Thinking…</div></div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={(event) => { event.preventDefault(); void handleSend(); }} className="p-4 bg-surface-container/30 border-t border-white/5 flex gap-3 z-10">
        <label htmlFor="ai-chat-input" className="sr-only">Type a message</label>
        <input id="ai-chat-input" type="text" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about seating, accessibility, or transport…" aria-label="Type a message" disabled={isTyping} maxLength={4000} className="flex-1 bg-surface-container-lowest border border-white/10 rounded-xl py-3.5 px-4 text-xs text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all disabled:opacity-60" />
        <button type="submit" aria-label="Send message" disabled={isTyping || input.trim().length === 0} className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-tertiary hover:opacity-90 active:scale-95 transition-all text-on-primary flex items-center justify-center shadow-lg cursor-pointer disabled:opacity-50">
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
