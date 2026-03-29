"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What deals are closed?",
  "What's available at Commonwealth?",
  "Show me tequila inventory",
  "Total pipeline value?",
];

export function DiscoAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
      setMessages([...newMessages, { role: "assistant", content: data.response || data.error || "Woof! Something went wrong." }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Woof! Can't connect right now." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full overflow-hidden shadow-lg shadow-[#aea2ff]/20 hover:scale-110 active:scale-95 transition-all ring-2 ${open ? "ring-neon-cyan" : "ring-neon-violet/50 hover:ring-neon-violet"}`}
      >
        <img src="/disco.jpg" alt="Disco" className="w-full h-full object-cover" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[500px] bg-[#0e0e11] rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden border border-[#25252a]">
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 bg-[#131316] flex-shrink-0">
            <img src="/disco.jpg" alt="Disco" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1">
              <p className="text-[#f3f0f4] text-sm font-bold">Disco</p>
              <p className="text-[#acaaae] text-[10px]">CBM Portfolio Agent</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-pulse" />
              <span className="text-[9px] text-[#acaaae] font-bold uppercase tracking-[0.15em]">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 min-h-[200px] max-h-[340px]">
            {messages.length === 0 ? (
              <div className="space-y-2">
                <p className="text-[#acaaae] text-xs text-center mb-3">Ask Disco anything about the CBM portfolio</p>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="w-full text-left bg-[#1f1f23] rounded-lg px-3 py-2 text-xs text-[#acaaae] hover:text-[#f3f0f4] hover:bg-[#25252a] transition-all">
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <img src="/disco.jpg" alt="" className="w-6 h-6 rounded-full object-cover mr-2 mt-1 flex-shrink-0" />
                    )}
                    <div className={`max-w-[75%] rounded-xl px-3 py-2 ${
                      msg.role === "user"
                        ? "bg-[#aea2ff]/15 text-[#f3f0f4]"
                        : "bg-[#1f1f23] text-[#f3f0f4]"
                    }`}>
                      {msg.role === "assistant" ? (
                        <div className="text-xs leading-relaxed prose prose-invert prose-xs max-w-none [&_p]:mb-1.5 [&_ul]:mb-1.5 [&_ul]:pl-4 [&_li]:mb-0.5 [&_strong]:text-[#00eefc] [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_code]:text-[#aea2ff] [&_code]:bg-[#25252a] [&_code]:px-1 [&_code]:rounded">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <img src="/disco.jpg" alt="" className="w-6 h-6 rounded-full object-cover mr-2 mt-1 flex-shrink-0" />
                    <div className="bg-[#1f1f23] rounded-xl px-3 py-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#aea2ff]/40 animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#aea2ff]/40 animate-pulse [animation-delay:0.15s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#aea2ff]/40 animate-pulse [animation-delay:0.3s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="px-3 pb-3 flex-shrink-0">
            <div className="bg-[#1f1f23] rounded-lg flex items-center gap-2 px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Disco..."
                disabled={loading}
                className="flex-1 bg-transparent text-[#f3f0f4] text-xs focus:outline-none placeholder:text-[#48474b] disabled:opacity-50"
              />
              <button type="submit" disabled={loading || !input.trim()}
                className="text-[#aea2ff] hover:text-[#00eefc] disabled:text-[#48474b] transition-colors text-sm">
                &#10148;
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
