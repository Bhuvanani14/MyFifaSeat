import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, User, Seat } from "../types";
import { Send, Sparkles, MessageSquare, RefreshCw, Star, HelpCircle } from "lucide-react";

interface AIAssistantViewProps {
  user: User;
}

export default function AIAssistantView({ user }: AIAssistantViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "model",
      content: `👋 **Hala, Alex!** Welcome to the FIFA 2026 Match Assistant. 
      
I'm synced with MetLife Stadium parameters and the live match telemetry (**Brazil 2-1 France**, 72nd min). 

How can I assist you today?
- Find affordable stadium seats (e.g. *Category 2 or 3*)
- Locate the *loudest fan zones* or *accessible entrances*
- Get *real-time match insights* and player performance analysis`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick suggestions
  const SUGGESTIONS = [
    "Recommend a high-energy seat under $200",
    "Where is the Brazilian fan section?",
    "What's the atmosphere like in Section 302?",
    "Show me VIP premium seating options",
    "Tell me about the live Brazil vs France match stats"
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) setInput(""); // Clear typing bar if typed

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build context parameters to feed into the GenAI agent
      const context = {
        userName: user.name,
        userPremium: user.isPremium,
        currentMatch: "Brazil vs France",
        stadiumVenue: "MetLife Stadium, New Jersey",
        liveScore: "2 - 1",
        liveTime: "72'"
      };

      // Prepare request payload
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          })),
          context
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact the seating assistant gateway.");
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "model",
        content: data.content || "I apologize, I received an empty response. Let's try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error("AI Assistant error:", err);
      const errMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "model",
        content: `❌ **Service Interrupted** \n\nI couldn't reach the AI gateway. Please make sure the backend is active, or try asking again. \n*(Error: ${err.message || "Failed to fetch"})*`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome-msg-reset",
        role: "model",
        content: `🔄 **Assistant session reset.** \n\nReady for new queries about stadium layout, ticket selections, and FIFA World Cup live matches. What are you looking for?`,
        timestamp: new Date()
      }
    ]);
  };

  // Safe and clean custom Markdown formatter for simple bold text, lists, and headers in React
  const formatMarkdown = (text: string) => {
    return text.split("\n").map((line, lineIdx) => {
      let content = line;
      
      // Handle Headers e.g., ### Title or ## Title
      if (content.startsWith("### ")) {
        return <h4 key={lineIdx} className="font-display font-bold text-sm text-tertiary mt-3 mb-1">{content.replace("### ", "")}</h4>;
      }
      if (content.startsWith("## ")) {
        return <h3 key={lineIdx} className="font-display font-bold text-md text-on-surface mt-4 mb-2">{content.replace("## ", "")}</h3>;
      }
      if (content.startsWith("# ")) {
        return <h2 key={lineIdx} className="font-display font-extrabold text-lg text-on-surface mt-4 mb-2">{content.replace("# ", "")}</h2>;
      }

      // Handle Bullet Lists
      let isBullet = false;
      if (content.trim().startsWith("- ")) {
        isBullet = true;
        content = content.replace("- ", "");
      } else if (content.trim().startsWith("* ")) {
        isBullet = true;
        content = content.replace("* ", "");
      }

      // Parse Bold e.g. **text** and Italic *text*
      const parts = [];
      let lastIndex = 0;
      const boldRegex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        if (match[1]) {
          parts.push(<strong key={match.index} className="text-white font-extrabold font-display">{match[1]}</strong>);
        } else if (match[2]) {
          parts.push(<em key={match.index} className="text-tertiary font-medium">{match[2]}</em>);
        }
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      const formattedLine = parts.length > 0 ? parts : content;

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc text-xs text-on-surface-variant/90 leading-relaxed mb-1">
            {formattedLine}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="text-xs text-on-surface-variant leading-relaxed min-h-[8px] mb-2">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/5 shadow-xl h-[650px] flex flex-col overflow-hidden relative">
      {/* Top Banner */}
      <div className="bg-surface-container/60 backdrop-blur-md px-6 py-4 border-b border-white/5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-sm text-on-surface flex items-center gap-1.5 uppercase">
              Smart Seating Assistant
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary ai-pulse" />
            </h3>
            <p className="text-[10px] text-on-surface-variant/70 font-mono">POWERED BY LLAMA & OPENROUTER</p>
          </div>
        </div>
        
        <button
          onClick={handleClear}
          title="Reset conversation"
          aria-label="Reset chat conversation"
          className="text-on-surface-variant/60 hover:text-error p-2 rounded-lg bg-surface-container border border-white/10 active:scale-95 duration-150"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Suggestion Chips Row */}
      <div className="bg-surface-container-low/40 px-4 py-3 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-none scroll-smooth select-none" role="group" aria-label="Quick suggestion prompts">
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            aria-label={`Ask: ${s}`}
            className="flex-shrink-0 bg-surface-container/50 border border-white/5 hover:border-tertiary/30 hover:bg-white/5 text-[10px] font-medium text-on-surface px-3 py-1.5 rounded-lg transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages Conversation Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" aria-live="polite" aria-label="Chat conversation" role="log">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border text-xs font-bold ${
                isUser 
                  ? "bg-primary-container/20 border-primary-light/10 text-primary-light"
                  : "bg-tertiary-container/30 border-tertiary/10 text-tertiary"
              }`}>
                {isUser ? "ME" : "🤖"}
              </div>

              {/* Message Bubble */}
              <div className={`rounded-2xl px-4 py-3 border ${
                isUser 
                  ? "bg-surface-container-high border-white/10 text-on-surface"
                  : "bg-surface-container-low/60 border-white/5 shadow-md relative"
              }`}>
                {/* Visual marker for AI messages */}
                {!isUser && (
                  <div className="absolute top-3 right-3 text-[8px] font-mono font-bold text-tertiary/30 uppercase tracking-widest pointer-events-none">
                    AI Agent
                  </div>
                )}
                
                {/* Formatted body */}
                <div className="space-y-1">
                  {formatMarkdown(m.content)}
                </div>

                {/* Timestamp */}
                <div className="text-[8px] text-on-surface-variant/30 font-mono mt-1 text-right">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isTyping && (
          <div className="flex gap-3 mr-auto max-w-[70%]" aria-label="AI is thinking" role="status">
            <div className="w-8 h-8 rounded-full bg-tertiary-container/20 border border-tertiary/10 flex items-center justify-center text-tertiary text-xs font-bold" aria-hidden="true">
              🤖
            </div>
            <div className="bg-surface-container-low/60 border border-white/5 rounded-2xl px-5 py-3.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary/80 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-tertiary/80 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-tertiary/80 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing bar input */}
      <div className="p-4 bg-surface-container/30 border-t border-white/5 flex gap-3 z-10">
        <label htmlFor="ai-chat-input" className="sr-only">Message the AI assistant</label>
        <input
          id="ai-chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask AI about seating comfort, shaded rows, concessions..."
          aria-label="Message the AI assistant"
          className="flex-1 bg-surface-container-lowest border border-white/10 rounded-xl py-3.5 px-4 text-xs text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all"
        />
        <button
          onClick={() => handleSend()}
          aria-label="Send message"
          className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-tertiary hover:opacity-90 active:scale-95 transition-all text-on-primary flex items-center justify-center shadow-lg cursor-pointer"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
