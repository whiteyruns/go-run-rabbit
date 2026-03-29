"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What deals are currently closed?",
  "What's available at Commonwealth?",
  "Show me the tequila inventory across all venues",
  "What's our total pipeline value?",
  "Which venues have no house pour for vodka?",
  "Give me a summary of the Casamigos deal",
];

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.response || data.error || "No response" }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Error connecting to agent" }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      {/* Header */}
      <div className="px-8 py-6 flex-shrink-0">
        <h1 className="text-4xl font-extrabold tracking-tight mb-1">AGENT</h1>
        <p className="text-on-surface-variant text-sm">Ask anything about deals, inventory, venues, or performance</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 pb-4">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto pt-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-neon-violet/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-neon-violet text-xl">&#9673;</span>
              </div>
              <p className="text-on-surface-variant">Ask me anything about the CBM portfolio</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-left bg-surface-container-high rounded-xl p-4 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === "user"
                    ? "bg-neon-violet/15 text-on-surface"
                    : "bg-surface-container-high text-on-surface"
                }`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-container-high rounded-2xl px-5 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-neon-violet/40 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-neon-violet/40 animate-pulse [animation-delay:0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-neon-violet/40 animate-pulse [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-8 pb-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="bg-surface-container-high rounded-xl flex items-center gap-3 px-4 py-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about deals, venues, inventory..."
              disabled={loading}
              className="flex-1 bg-transparent text-on-surface text-sm focus:outline-none placeholder:text-on-surface-variant/40 disabled:opacity-50"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="bg-gradient-to-br from-neon-violet-dim to-neon-violet text-[#1f0078] px-4 py-1.5 rounded-md text-xs font-bold hover:opacity-90 disabled:opacity-30 transition-all">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
