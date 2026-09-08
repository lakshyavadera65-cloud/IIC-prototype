import React, { useState, useRef, useEffect } from 'react';
import { sendChatQuery } from '../../services/api';
import {
  MessageSquare,
  Send,
  X,
  Minus,
  Maximize2,
  Bot,
  HelpCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: string[];
  timestamp: string;
}

interface FloatingCoPilotDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const FloatingCoPilotDrawer: React.FC<FloatingCoPilotDrawerProps> = ({
  isOpen = true,
  onClose,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>(() => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      {
        id: 'msg-1',
        sender: 'user',
        text: 'Why was recovery plan Option A recommended over Option B?',
        timestamp: timeNow,
      },
      {
        id: 'msg-2',
        sender: 'assistant',
        text: 'Option A was recommended by the Oracle simulation engine because it preserves 100% SLA compliance for ORD-102 by utilizing redundant capacity on CNC-01. Option B incurs an additional overtime overhead and introduces higher operational risk.',
        citations: ['Digital Twin: CNC-01 idle slot', 'Oracle Simulation: 94% confidence'],
        timestamp: timeNow,
      },
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMinimized]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await sendChatQuery(userMsg.text);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        citations: res.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to query the local factory intelligence backend. Please ensure the PULSE FastAPI service is online.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-[#0B1320] border border-[#182840] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col font-sans select-none"
      id="copilot-drawer"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0E1726] border-b border-[#132238]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#00F2FE] animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">Factory Intelligence Assistant</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#132238] transition"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#132238] transition"
              title="Close Assistant"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className="flex flex-col p-3 gap-3 max-h-[460px]">
          {/* Messages Log */}
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[280px] pr-1">
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="bg-[#00F2FE]/15 border border-[#00F2FE]/30 text-white px-3 py-2 rounded-xl rounded-tr-none max-w-[85%] text-xs font-medium">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-lg bg-[#00F2FE]/10 text-[#00F2FE] flex items-center justify-center shrink-0 mt-0.5 border border-[#00F2FE]/20">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-[#0E1726] border border-[#16253D] px-3 py-2 rounded-xl rounded-tl-none max-w-[90%] text-xs text-slate-200 flex flex-col gap-1.5">
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-[#16253D]">
                        {msg.citations.map((cite, cIdx) => (
                          <span
                            key={cIdx}
                            className="bg-[#132238] px-1.5 py-0.5 rounded font-mono text-[9px] text-[#00F2FE] border border-[#1E3557]"
                          >
                            [{cite}]
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex items-center gap-2 text-[#00F2FE] font-mono text-xs pl-8">
                <span className="h-3 w-3 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin" />
                <span>Querying factory state...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Query Suggestions */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[#132238]">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              OPERATIONAL INQUIRIES:
            </span>
            <div className="flex flex-col gap-1">
              {[
                'Which machines are currently at risk?',
                'Why was this recovery plan recommended?',
                'Which orders are affected by CNC-02?',
              ].map((queryText) => (
                <button
                  key={queryText}
                  type="button"
                  onClick={() => handleSend(queryText)}
                  className="text-left text-[11px] bg-[#0E1726] hover:bg-[#132238] px-2.5 py-1 rounded text-slate-300 hover:text-white transition border border-[#16253D] truncate"
                >
                  {queryText}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 bg-[#0E1726] px-3 py-2 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00F2FE] border border-[#182840]"
              placeholder="Ask anything about your factory..."
            />
            <button
              type="button"
              disabled={isLoading || !inputQuery.trim()}
              onClick={() => handleSend()}
              className="p-2 bg-[#00F2FE] text-[#070D17] hover:bg-[#38BDF8] rounded-lg transition disabled:opacity-50 shrink-0 font-bold"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
