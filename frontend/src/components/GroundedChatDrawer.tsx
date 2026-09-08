import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { sendChatQuery } from '../services/api';
import { ChatMessage } from '../types';

interface GroundedChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_QUERIES = [
  'Why was Plan A recommended over Plan B?',
  'Why is ORD-104 at risk of missing its deadline?',
  'What is the cost breakdown of the emergency overtime shift?',
  'What is the current factory health status?',
];

export const GroundedChatDrawer: React.FC<GroundedChatDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content:
        "Hello! I'm the **PULSE Factory Operations Co-Pilot**. My responses are strictly grounded in our live digital twin state, dynamic dependency graphs, and Oracle simulation formulas. How can I assist your operational decisions?",
      timestamp: 'Just now',
      citations: ['Digital Twin State', 'Oracle Math Engine'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await sendChatQuery(userMsg.content);
      const assistantMsg: ChatMessage = {
        id: `msg-res-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        citations: res.citations,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Failed to fetch grounded response: ${err.message}`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#0A0E1A] border-l border-slate-700/80 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-wide">Factory Operations Co-Pilot</h3>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Zero hallucinations • Telemetry-backed Q&A</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Suggested Queries */}
      <div className="p-3 border-b border-slate-800/60 bg-slate-950/40">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Suggested Judge Prompts:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-left text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700/60 transition active:scale-95 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-xl p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-900/30'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Citations if assistant */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                  <span className="text-slate-500 flex items-center gap-1 mb-0.5">
                    <BookOpen className="h-2.5 w-2.5" />
                    Verified Grounded Sources:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {msg.citations.map((c, i) => (
                      <span key={i} className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 border border-slate-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 font-mono px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 w-fit">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            <span>Consulting Digital Twin Telemetry & Oracle Math...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about delays, trade-offs, costs..."
          disabled={isLoading}
          className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
