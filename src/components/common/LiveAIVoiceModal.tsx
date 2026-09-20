import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
  Play,
  RotateCcw,
  Bot,
  User,
  Radio,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { Card3D } from './Card3D';
import { AIProposedAction } from '../../types';

interface LiveAIVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveAIVoiceModal: React.FC<LiveAIVoiceModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    sendChatMessage,
    chatMessages,
    isGeneratingAI,
    executeAIAction,
    tasks,
    goals,
    habits,
    expenses,
  } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(true);
  const [isAudioFeedbackEnabled, setIsAudioFeedbackEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [liveLog, setLiveLog] = useState<
    Array<{ id: string; sender: 'user' | 'ai'; text: string; timestamp: Date; actions?: AIProposedAction[] }>
  >([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Tap microphone or speak naturally to start');
  const [selectedVoiceMode, setSelectedVoiceMode] = useState<'briefing' | 'triage' | 'treasury' | 'general'>('general');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const animFrameRef = useRef<number | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = 'en-US';

        recog.onstart = () => {
          setIsListening(true);
          setStatusMessage('Listening to your voice...');
        };

        recog.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          setAudioLevel(0.8 + Math.random() * 0.2);
        };

        recog.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          setStatusMessage('Mic paused. Tap to speak.');
        };

        recog.onend = () => {
          setIsListening(false);
          setAudioLevel(0);
        };

        recognitionRef.current = recog;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (synthRef.current) {
        try {
          synthRef.current.cancel();
        } catch (e) {}
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Text-to-speech speaker
  const speakAIResponse = useCallback(
    (text: string) => {
      if (!isAudioFeedbackEnabled || !synthRef.current) return;

      synthRef.current.cancel();
      // Strip markdown codeblocks or symbols for clean speech
      const cleaned = text.replace(/[*_#`~[\]]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Select warm natural voice if available
      const voices = synthRef.current.getVoices();
      const preferredVoice =
        voices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.lang === 'en-US') ||
        voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setStatusMessage('LifeOps AI is speaking...');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setStatusMessage('Ready for your response...');
        // If hands-free is enabled, auto resume listening after a brief pause
        if (isHandsFree && isOpen) {
          setTimeout(() => {
            startListening();
          }, 800);
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    },
    [isAudioFeedbackEnabled, isHandsFree, isOpen]
  );

  // Start speech recognition
  const startListening = useCallback(() => {
    if (synthRef.current?.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        // May already be running
      }
    } else {
      setStatusMessage('Voice recognition not supported in browser. Use typing.');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setIsListening(false);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Handle submitting user utterance to AI
  const handleProcessUserUtterance = async (queryText: string) => {
    if (!queryText.trim() || isGeneratingAI) return;
    const cleanQuery = queryText.trim();
    setTranscript('');
    stopListening();

    const userMsgId = 'live-user-' + Date.now();
    setLiveLog((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: cleanQuery, timestamp: new Date() },
    ]);

    setStatusMessage('Synthesizing directives...');

    try {
      await sendChatMessage(cleanQuery);
    } catch (err: any) {
      setStatusMessage('Error processing utterance.');
    }
  };

  // Auto submit when user pauses speaking after a recognized phrase
  useEffect(() => {
    if (transcript.trim().length > 3 && !isListening) {
      const timer = setTimeout(() => {
        handleProcessUserUtterance(transcript);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [transcript, isListening]);

  // Sync latest chat message from app context to live conversation log and speak it
  useEffect(() => {
    if (chatMessages.length > 0) {
      const latest = chatMessages[chatMessages.length - 1];
      if (latest.sender === 'assistant') {
        const alreadyLogged = liveLog.some((l) => l.text === latest.text);
        if (!alreadyLogged) {
          setLiveLog((prev) => [
            ...prev,
            {
              id: latest.id,
              sender: 'ai',
              text: latest.text,
              timestamp: new Date(latest.timestamp),
              actions: latest.proposedActions,
            },
          ]);

          if (isOpen) {
            speakAIResponse(latest.text);
          }
        }
      }
    }
  }, [chatMessages, isOpen, speakAIResponse]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveLog, transcript]);

  // Animated 3D Sonic Waveform Canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const w = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 300);
      const h = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 120);

      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;
      phase += 0.05;

      // Base intensity based on active state
      let amp = isListening ? 25 + Math.sin(phase * 4) * 15 : isSpeaking ? 30 + Math.sin(phase * 3) * 18 : 8;
      if (isGeneratingAI) amp = 18 + Math.cos(phase * 5) * 12;

      // Draw multi-layered glowing sonic rings & waves
      const lines = 4;
      for (let l = 0; l < lines; l++) {
        ctx.beginPath();
        ctx.lineWidth = 2 * window.devicePixelRatio;
        const alpha = 0.2 + (l / lines) * 0.6;
        ctx.strokeStyle =
          isListening
            ? `rgba(239, 68, 68, ${alpha})`
            : isSpeaking
            ? `rgba(197, 160, 89, ${alpha})`
            : `rgba(197, 160, 89, ${alpha * 0.4})`;

        for (let x = 0; x < w; x += 4) {
          const normX = (x - centerX) / (w / 2);
          const envelope = Math.exp(-Math.pow(normX * 2, 2)); // Gaussian bell curve
          const freq = 0.015 + l * 0.005;
          const y = centerY + Math.sin(x * freq + phase + l * 0.8) * amp * envelope;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw central pulsating core
      ctx.beginPath();
      const coreRadius = (isListening ? 14 : isSpeaking ? 18 : 10) * window.devicePixelRatio;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 2);
      gradient.addColorStop(0, isListening ? 'rgba(239, 68, 68, 0.9)' : 'rgba(197, 160, 89, 0.9)');
      gradient.addColorStop(1, 'rgba(197, 160, 89, 0)');
      ctx.fillStyle = gradient;
      ctx.arc(centerX, centerY, coreRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isListening, isSpeaking, isGeneratingAI]);

  // Initial welcome greeting on open
  useEffect(() => {
    if (isOpen && liveLog.length === 0) {
      const greeting = `Greetings ${user?.name ? user.name.split(' ')[0] : 'there'}. LifeOps Voice Assistant is online. You have ${
        tasks.filter((t) => t.status !== 'completed').length
      } active tasks. Speak naturally to organize tasks, manage finances, or plan your schedule.`;

      setLiveLog([
        {
          id: 'welcome-init',
          sender: 'ai',
          text: greeting,
          timestamp: new Date(),
        },
      ]);
      speakAIResponse(greeting);
    }
  }, [isOpen, liveLog.length, user, tasks, speakAIResponse]);

  const presetQueries = [
    {
      label: 'Morning Strategic Briefing',
      query: 'Give me a live executive summary of today: top directives, schedule, and habit streaks.',
    },
    {
      label: 'Treasury & Expense Audit (₹)',
      query: 'Analyze our monthly spend versus our budget cap in Indian Rupees and suggest savings.',
    },
    {
      label: 'Directive Triage & Overdue Quick-Wins',
      query: 'What urgent or overdue tasks should I tackle first to eliminate bottlenecks today?',
    },
    {
      label: 'Focus & Flow State Alignment',
      query: 'Guide me into a 90-minute deep work block with a focus theme.',
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      id="live-ai-voice-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        id="live-ai-voice-modal-window"
        className="w-full max-w-3xl bg-[#080808] border border-[#c5a059]/40 rounded-sm shadow-[0_0_60px_rgba(197,160,89,0.15)] flex flex-col max-h-[92vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Live Status & Controls */}
        <div className="p-4 sm:p-5 border-b border-[#1a1a1a] flex items-center justify-between bg-[#050505] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-sm bg-[#111] border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.25)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <span
                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                  isListening
                    ? 'bg-rose-500 animate-ping'
                    : isSpeaking
                    ? 'bg-[#c5a059] animate-pulse'
                    : 'bg-emerald-400'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif text-white tracking-wide">
                  LifeOps Live Voice Assistant
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-sm bg-[#141414] text-[#c5a059] border border-[#c5a059]/30 uppercase">
                  Real-time Neural STT/TTS
                </span>
              </div>
              <p className="text-[11px] text-[#7a7a7a] font-light">
                Hands-free voice recognition & real-time task and finance execution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Feedback Toggle */}
            <button
              id="live-voice-audio-toggle-btn"
              onClick={() => {
                if (isAudioFeedbackEnabled && synthRef.current) {
                  synthRef.current.cancel();
                  setIsSpeaking(false);
                }
                setIsAudioFeedbackEnabled(!isAudioFeedbackEnabled);
              }}
              className={`p-2 rounded-sm border transition-all ${
                isAudioFeedbackEnabled
                  ? 'bg-[#141414] text-[#c5a059] border-[#c5a059]/40'
                  : 'bg-[#111] text-[#555] border-[#1a1a1a]'
              }`}
              title={isAudioFeedbackEnabled ? 'Audio Speech Output Enabled' : 'Audio Speech Muted'}
            >
              {isAudioFeedbackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Hands-Free Toggle */}
            <button
              id="live-voice-handsfree-toggle-btn"
              onClick={() => setIsHandsFree(!isHandsFree)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-wider font-mono border transition-all ${
                isHandsFree
                  ? 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/40'
                  : 'bg-[#111] text-[#7a7a7a] border-[#1a1a1a]'
              }`}
              title="Continuous conversation loop"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Hands-Free {isHandsFree ? 'ON' : 'OFF'}</span>
            </button>

            {/* Close Button */}
            <button
              id="live-voice-close-btn"
              onClick={onClose}
              className="p-2 rounded-sm text-[#7a7a7a] hover:text-white hover:bg-[#141414] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Sonic Waveform Visualizer Banner */}
        <div className="relative bg-gradient-to-b from-[#050505] to-[#080808] border-b border-[#1a1a1a] p-4 flex flex-col items-center justify-center flex-shrink-0">
          <canvas ref={canvasRef} className="w-full h-24 max-w-xl mx-auto cursor-pointer" onClick={toggleListening} />
          
          <div className="mt-1 flex items-center justify-between w-full max-w-xl px-2 text-[10px] font-mono text-[#7a7a7a]">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isListening
                    ? 'bg-rose-500 animate-pulse'
                    : isSpeaking
                    ? 'bg-[#c5a059] animate-bounce'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="text-white uppercase tracking-wider font-medium">{statusMessage}</span>
            </div>
            <span className="text-[#555] hidden sm:inline">Tap Canvas or Orb to Toggle Mic</span>
          </div>
        </div>

        {/* Live Conversation Transcript Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#050505] min-h-[220px]">
          {liveLog.map((item) => {
            const isUser = item.sender === 'user';
            return (
              <div
                key={item.id}
                id={`live-msg-${item.id}`}
                className={`flex gap-3 animate-in fade-in duration-300 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-sm bg-[#111] border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-sm text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#c5a059] text-black font-medium shadow-[0_4px_12px_rgba(197,160,89,0.2)]'
                        : 'bg-[#0a0a0a] border border-[#1a1a1a] text-[#d1d1d1] whitespace-pre-wrap'
                    }`}
                  >
                    {item.text}
                  </div>

                  {/* Actions generated live */}
                  {item.actions && item.actions.length > 0 && (
                    <div className="space-y-2 mt-2 w-full">
                      {item.actions.map((act) => (
                        <div
                          key={act.id}
                          className="p-3 rounded-sm bg-[#080808] border border-[#c5a059]/40 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-[#c5a059]">
                              <Zap className="w-3 h-3" />
                              <span>{act.type.replace('_', ' ')}</span>
                            </div>
                            <div className="text-white font-medium mt-0.5">{act.title}</div>
                          </div>
                          {act.status === 'executed' ? (
                            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </span>
                          ) : (
                            <button
                              onClick={async () => {
                                await executeAIAction(act);
                              }}
                              className="px-3 py-1.5 rounded-sm bg-[#c5a059] hover:bg-[#d8b56f] text-black text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Execute</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] font-mono text-[#555] block px-1">
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-sm bg-[#111] border border-[#222] text-[#c5a059] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Realtime Live Speech In-Flight Preview */}
          {transcript && (
            <div className="flex gap-3 justify-end animate-in fade-in">
              <div className="p-3 rounded-sm bg-[#181818] border border-[#c5a059]/40 text-[#c5a059] text-xs font-mono italic flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Transcribing: "{transcript}"</span>
              </div>
            </div>
          )}

          {/* AI Generating Indicator */}
          {isGeneratingAI && (
            <div className="flex items-center gap-2.5 text-xs text-[#c5a059] font-mono p-3 bg-[#080808] border border-[#1a1a1a] rounded-sm w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>LifeOps AI is analyzing command and formulating response...</span>
            </div>
          )}

          <div ref={transcriptEndRef} />
        </div>

        {/* Quick Voice Presets Bar */}
        <div className="px-4 py-2.5 bg-[#080808] border-t border-[#1a1a1a] overflow-x-auto flex items-center gap-2 flex-shrink-0 scrollbar-none">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#555] flex-shrink-0">
            Presets:
          </span>
          {presetQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleProcessUserUtterance(item.query)}
              disabled={isGeneratingAI}
              className="px-2.5 py-1 rounded-sm bg-[#0e0e0e] hover:bg-[#141414] border border-[#1a1a1a] hover:border-[#c5a059]/40 text-[10px] text-[#999] hover:text-[#c5a059] whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <Sparkles className="w-2.5 h-2.5 text-[#c5a059]" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom Interactive Command Controls */}
        <div className="p-4 sm:p-5 bg-[#050505] border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
          {/* Main Push to Talk / Toggle Microphone Button */}
          <button
            id="live-voice-main-mic-btn"
            onClick={toggleListening}
            className={`w-full sm:w-auto px-6 py-3 rounded-sm flex items-center justify-center gap-2.5 text-xs uppercase tracking-widest font-semibold transition-all shadow-lg ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-[#c5a059] hover:bg-[#d8b56f] text-black shadow-[0_0_20px_rgba(197,160,89,0.25)]'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isListening ? 'Stop Listening (Transcribe)' : 'Speak to LifeOps (Tap to Talk)'}</span>
          </button>

          {/* Quick manual text fallback */}
          <div className="flex-1 w-full flex items-center gap-2">
            <input
              id="live-voice-text-fallback-input"
              type="text"
              placeholder="Or type a live voice command (e.g. 'Add task prepare report')..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && transcript.trim()) {
                  handleProcessUserUtterance(transcript);
                }
              }}
              className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] focus:border-[#c5a059]/50 text-white text-xs px-3.5 py-2.5 rounded-sm placeholder-[#555] focus:outline-none"
            />
            {transcript.trim() && (
              <button
                onClick={() => handleProcessUserUtterance(transcript)}
                className="px-4 py-2.5 bg-[#141414] hover:bg-[#1a1a1a] border border-[#c5a059]/40 text-[#c5a059] text-xs uppercase tracking-wider font-semibold rounded-sm transition-all"
              >
                Send
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
