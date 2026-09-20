import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  CheckCircle2,
  X,
  Calendar,
  RefreshCw,
  Mic,
} from 'lucide-react';
import { NeuralVisualizer3D } from '../common/NeuralVisualizer3D';
import { Card3D } from '../common/Card3D';

export const AIAssistantView: React.FC = () => {
  const {
    chatMessages,
    isGeneratingAI,
    sendChatMessage,
    executeAIAction,
    setActiveTab,
    openLiveVoice,
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isGeneratingAI]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isGeneratingAI) return;
    const query = inputQuery.trim();
    setInputQuery('');
    await sendChatMessage(query);
  };

  const handleChipClick = async (promptText: string) => {
    if (isGeneratingAI) return;
    await sendChatMessage(promptText);
  };

  const suggestedPrompts = [
    'Analyze my current workload and plan a time-blocked schedule for today',
    'What are my highest leverage bottlenecks and overdue items?',
    'Break down my active strategic goals into 3 actionable tasks for tomorrow',
    'Evaluate my financial spend against my monthly budget cap in ₹ INR',
  ];

  return (
    <div id="lifeops-ai-assistant-view" className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Header Bar with 3D Neural Core Mini Visualizer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#080808] border border-[#1a1a1a] p-4 rounded-sm flex-shrink-0 relative overflow-hidden">
        {/* Mini 3D Visualizer in header corner */}
        <div className="absolute right-36 top-1/2 -translate-y-1/2 w-20 h-20 opacity-30 pointer-events-none hidden md:block">
          <NeuralVisualizer3D size={80} isThinking={isGeneratingAI} />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#111] border border-[#c5a059]/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(197,160,89,0.2)]">
            <Sparkles className="w-5 h-5 text-[#c5a059]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-serif text-white tracking-wide">LifeOps AI Assistant</h2>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-sm bg-[#141414] text-[#c5a059] border border-[#c5a059]/30 uppercase">
                Gemini 2.5 &bull; 3D Core
              </span>
            </div>
            <p className="text-xs text-[#7a7a7a] font-light">
              Intelligent coordinator with real-time awareness of your tasks, habits, and finances in ₹ INR.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto relative z-10">
          <button
            id="ai-launch-live-voice-btn"
            onClick={openLiveVoice}
            className="flex items-center gap-2 px-3.5 py-2 rounded-sm bg-[#c5a059] hover:bg-[#d8b56f] text-black text-[10px] uppercase tracking-widest font-semibold transition-all shadow-[0_0_15px_rgba(197,160,89,0.25)]"
          >
            <Mic className="w-3.5 h-3.5 stroke-[2.5] animate-pulse" />
            <span>Live Voice Mode</span>
          </button>

          <button
            id="ai-launch-daily-flow-btn"
            onClick={() => setActiveTab('daily_flow')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-sm bg-[#0e0e0e] hover:bg-[#141414] border border-[#1a1a1a] hover:border-[#c5a059]/40 text-[#c5a059] text-[10px] uppercase tracking-widest font-semibold transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daily Flow</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Log Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 md:p-6 rounded-sm bg-[#050505] border border-[#1a1a1a] shadow-inner relative">
        {chatMessages.length === 0 ? (
          <div className="py-8 text-center max-w-xl mx-auto space-y-4">
            {/* Live Interactive 3D Neural Sphere in Empty State */}
            <div className="w-48 h-48 mx-auto -my-4 flex items-center justify-center">
              <NeuralVisualizer3D size={190} isThinking={isGeneratingAI} />
            </div>

            <h3 className="text-xl font-serif italic text-white">How may LifeOps AI assist you today?</h3>
            <p className="text-xs text-[#7a7a7a] leading-relaxed font-light">
              Ask to structure your daily schedule, prioritize tasks, analyze habits, or review finances in ₹ INR.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              {suggestedPrompts.map((prompt, idx) => (
                <Card3D key={idx} depth={8}>
                  <button
                    id={`suggested-prompt-${idx}`}
                    onClick={() => handleChipClick(prompt)}
                    className="w-full p-3.5 rounded-sm bg-[#080808] border border-[#141414] hover:border-[#c5a059]/40 text-xs text-[#999] hover:text-white transition-all text-left flex items-start gap-2.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#c5a059] flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{prompt}</span>
                  </button>
                </Card3D>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-sm bg-[#0e0e0e] border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-sm text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#c5a059] text-black font-medium shadow-[0_5px_15px_rgba(197,160,89,0.2)]'
                        : 'bg-[#080808] border border-[#1a1a1a] text-[#d1d1d1] whitespace-pre-wrap shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Proposed AI Actions (If Any) */}
                  {msg.proposedActions && msg.proposedActions.length > 0 && (
                    <div className="space-y-2.5 w-full">
                      <div className="text-[10px] uppercase font-mono tracking-widest text-[#c5a059] font-semibold flex items-center gap-1.5 px-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Proposed System Interventions ({msg.proposedActions.length})</span>
                      </div>

                      {msg.proposedActions.map((action) => (
                        <Card3D key={action.id} depth={10}>
                          <div
                            id={`proposed-action-${action.id}`}
                            className={`p-3.5 rounded-sm border transition-all ${
                              action.status === 'executed'
                                ? 'bg-[#080808] border-emerald-800/40 text-emerald-400'
                                : action.status === 'dismissed'
                                ? 'bg-[#050505] border-[#141414] opacity-40'
                                : 'bg-[#0a0a0a] border-[#c5a059]/40 text-[#d1d1d1]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm bg-[#111] text-[#c5a059] border border-[#222]">
                                    {action.type.replace('_', ' ')}
                                  </span>
                                  {action.status === 'executed' && (
                                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> Executed
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-serif text-white mt-1">{action.title}</h4>
                                <p className="text-[11px] text-[#7a7a7a] mt-0.5">{action.description}</p>
                              </div>

                              {/* Action Buttons */}
                              {action.status === 'proposed' && (
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <button
                                    id={`action-approve-${action.id}`}
                                    onClick={() => executeAIAction(action)}
                                    className="px-3 py-1.5 rounded-sm bg-[#c5a059] text-black text-[10px] uppercase tracking-wider font-semibold hover:bg-[#d8b56f] flex items-center gap-1 shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    id={`action-dismiss-${action.id}`}
                                    onClick={() => {
                                      action.status = 'dismissed';
                                    }}
                                    className="p-1.5 rounded-sm bg-[#111] hover:bg-[#181818] text-[#7a7a7a] hover:text-white"
                                    title="Dismiss"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card3D>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-[#555] font-mono px-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-sm bg-[#111] border border-[#222] text-[#c5a059] flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Typing Loading Indicator with 3D animation */}
        {isGeneratingAI && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#0e0e0e] border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-sm bg-[#080808] border border-[#1a1a1a] text-xs text-[#7a7a7a] flex items-center gap-2 shadow-md">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c5a059]" />
              <span>LifeOps AI is analyzing context and formulating recommendations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-[#080808] border border-[#1a1a1a] p-2 rounded-sm flex-shrink-0"
      >
        <button
          type="button"
          id="ai-chat-mic-trigger-btn"
          onClick={openLiveVoice}
          className="p-2 rounded-sm bg-[#141414] hover:bg-[#1f1f1f] text-[#c5a059] border border-[#262626] transition-all"
          title="Open Live Voice Conversation (⌘J)"
        >
          <Mic className="w-4 h-4 animate-pulse" />
        </button>

        <input
          id="ai-chat-input"
          type="text"
          placeholder="Ask LifeOps AI for schedule planning, task prioritization, or habit audit..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isGeneratingAI}
          className="flex-1 bg-transparent text-white placeholder-[#555] text-xs px-3 py-2 focus:outline-none"
        />
        <button
          id="ai-chat-send-btn"
          type="submit"
          disabled={!inputQuery.trim() || isGeneratingAI}
          className="px-4 sm:px-5 py-2 rounded-sm bg-[#c5a059] text-black font-semibold text-xs uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-40 hover:bg-[#d8b56f] transition-all shadow-[0_0_12px_rgba(197,160,89,0.25)]"
        >
          <span>Transmit</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
