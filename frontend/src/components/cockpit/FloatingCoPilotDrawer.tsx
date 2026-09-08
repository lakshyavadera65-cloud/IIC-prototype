import React, { useState, useRef, useEffect } from 'react';
import { sendChatQuery } from '../../services/api';

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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'Why was Plan A recommended over Plan B?',
      timestamp: '14:26 UTC',
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      text: 'Plan A preserves 100% SLA compliance for Airbus #PO-9912 by utilizing an existing 3.5h idle spindle slot on CNC-03 (15:00-18:30 UTC). In comparison, Plan B forces ₹45,600 additional overtime overhead and introduces high thermal fatigue risk on Tool #4.',
      citations: ['Ref: Telemetry CNC-03: 42% idle', 'Ref: Contract SLA Penalty Table §4.2'],
      timestamp: '14:26 UTC',
    },
  ]);

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
        text: 'Apologies, unable to query the autonomous factory intelligence backend. Please verify FastAPI is active.',
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
      className="fixed bottom-space-md right-space-md w-96 max-w-[calc(100vw-2rem)] bg-surface-container-low/95 backdrop-blur-md rounded shadow-2xl z-50 overflow-hidden flex flex-col border border-outline-variant/40 font-sans select-none"
      id="copilot-drawer"
    >
      {/* Co-Pilot Header */}
      <div className="flex items-center justify-between p-space-sm bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping shrink-0" />
          <span className="font-mono text-headline-sm text-on-surface font-bold">
            PULSE Co-Pilot
          </span>
          <span className="font-mono text-mono-code text-primary bg-primary/10 px-space-2xs py-0.5 rounded text-[10px] font-bold">
            AUTONOMOUS REASONING
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container-high transition"
            title={isMinimized ? 'Expand Co-Pilot' : 'Minimize Co-Pilot'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isMinimized ? 'unfold_more' : 'unfold_less'}
            </span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container-high transition"
              title="Close Co-Pilot Drawer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Co-Pilot Collapsible Content */}
      {!isMinimized && (
        <div className="flex flex-col p-space-sm gap-space-sm max-h-[420px]">
          {/* Grounded Conversation Log */}
          <div className="flex flex-col gap-space-xs overflow-y-auto max-h-[260px] pr-1">
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="bg-primary-container text-on-primary-container px-space-sm py-space-xs rounded-xl rounded-tr-none max-w-[85%] text-body-sm shadow-sm font-medium">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-space-xs">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <span className="material-symbols-outlined text-on-primary text-[14px]">
                      smart_toy
                    </span>
                  </div>
                  <div className="bg-surface-container px-space-sm py-space-xs rounded-xl rounded-tl-none max-w-[90%] text-body-sm text-on-surface flex flex-col gap-space-2xs shadow-sm border border-outline-variant/20">
                    <p className="leading-relaxed">{msg.text}</p>
                    {/* Citation Pills */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap gap-space-2xs pt-1 border-t border-outline-variant/20">
                        {msg.citations.map((cite, cIdx) => (
                          <span
                            key={cIdx}
                            className="bg-surface-container-high px-space-2xs py-0.5 rounded font-mono text-[10px] text-primary border border-primary/20"
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
              <div className="flex items-center gap-2 text-primary font-mono text-xs pl-8">
                <span className="h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Auditing agent decision tree...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Suggestion Chips */}
          <div className="flex flex-col gap-space-2xs pt-space-xs border-t border-outline-variant/20">
            <span className="font-mono text-label-caps text-on-surface-variant uppercase font-bold text-[9px]">
              RECOMMENDED QUERIES
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => handleSend('Show CNC-03 spindle tool wear delta')}
                className="text-left text-body-sm bg-surface-container hover:bg-surface-container-high px-2 py-1 rounded text-on-surface transition-colors truncate max-w-full text-xs border border-outline-variant/20"
              >
                Show CNC-03 spindle tool wear delta
              </button>
              <button
                type="button"
                onClick={() => handleSend('Financial penalty if delayed > 2 hrs?')}
                className="text-left text-body-sm bg-surface-container hover:bg-surface-container-high px-2 py-1 rounded text-on-surface transition-colors truncate max-w-full text-xs border border-outline-variant/20"
              >
                Financial penalty if delayed &gt; 2 hrs?
              </button>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="flex items-center gap-space-xs pt-space-2xs bg-surface-container-low">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 bg-surface-container px-space-sm py-space-xs rounded text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30 text-xs font-mono"
              placeholder="Inquire agent decision audit log..."
            />
            <button
              type="button"
              disabled={isLoading || !inputQuery.trim()}
              onClick={() => handleSend()}
              className="p-space-xs bg-primary text-on-primary rounded hover:bg-primary-fixed-dim transition-colors flex items-center justify-center disabled:opacity-50 active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
