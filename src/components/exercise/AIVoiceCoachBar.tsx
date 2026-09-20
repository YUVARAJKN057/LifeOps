import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Bot,
  Sliders,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
} from 'lucide-react';
import { ExerciseGuide } from '../../types';

interface AIVoiceCoachBarProps {
  exercise: ExerciseGuide;
  isAudioEnabled?: boolean;
}

export const AIVoiceCoachBar: React.FC<AIVoiceCoachBarProps> = ({
  exercise,
  isAudioEnabled = true,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedVoiceGender, setSelectedVoiceGender] = useState<'female' | 'male' | 'coach'>('female');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeSpeechSnippet, setActiveSpeechSnippet] = useState<string>('');
  const [isCustomQAModalOpen, setIsCustomQAModalOpen] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load browser speech voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Stop speech when switching exercises
  useEffect(() => {
    stopVoice();
    setActiveSpeechSnippet('');
    setAiAnswer(null);
  }, [exercise.id]);

  // Construct full AI voice coaching narrative
  const getFullNarrationText = () => {
    let script = exercise.aiVoiceScript;
    if (!script) {
      script = `Hello! Let's explore the ${exercise.name}. ${exercise.whatItIsDoing} For who it's best: ${exercise.whoItsFor}. Here is how to perform it safely.`;
    }

    const stepsText = exercise.steps
      .map(
        (s) =>
          `Step ${s.stepNumber}: ${s.title}. ${s.instruction}. Tip: ${s.tips.join('. ')}. Safety check: ${s.safetyCheck}.`
      )
      .join(' ');

    const benefitsText = `Key health benefits: ${exercise.benefits.slice(0, 3).join('. ')}.`;

    return `${script} ${stepsText} ${benefitsText} You've got this!`;
  };

  const startVoice = (customText?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = customText || getFullNarrationText();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Pick best matching natural voice
    if (availableVoices.length > 0) {
      const englishVoices = availableVoices.filter((v) => v.lang.startsWith('en'));
      let chosenVoice: SpeechSynthesisVoice | undefined;

      if (selectedVoiceGender === 'female') {
        chosenVoice = englishVoices.find(
          (v) =>
            v.name.includes('Female') ||
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Google UK English Female') ||
            v.name.includes('Karen') ||
            v.name.includes('Zira')
        );
      } else if (selectedVoiceGender === 'male') {
        chosenVoice = englishVoices.find(
          (v) =>
            v.name.includes('Male') ||
            v.name.includes('Daniel') ||
            v.name.includes('Alex') ||
            v.name.includes('Google UK English Male') ||
            v.name.includes('David')
        );
      }

      if (!chosenVoice && englishVoices.length > 0) {
        chosenVoice = englishVoices[0];
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
    }

    utterance.rate = speechRate;
    utterance.pitch = selectedVoiceGender === 'female' ? 1.05 : 0.95;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setActiveSpeechSnippet(textToSpeak.slice(0, 120) + '...');
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        const charIdx = event.charIndex;
        const currentSlice = textToSpeak.slice(charIdx, charIdx + 90);
        setActiveSpeechSnippet(currentSlice + '...');
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveSpeechSnippet('');
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeaking && !isPaused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } else if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    }
  };

  const stopVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  // Ask AI Voice Coach custom questions powered by Gemini / server
  const handleAskAICoach = async () => {
    if (!customQuestion.trim()) return;
    setIsAiLoading(true);
    setAiAnswer(null);

    try {
      const res = await fetch('/api/exercise/ai-coach-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          category: exercise.category,
          question: customQuestion,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnswer(data.advice || data.answer);
        if (data.advice) {
          startVoice(data.advice);
        }
      } else {
        // Fallback intelligent coaching response
        const fallbackAdvice = `For ${exercise.name}: make sure you keep your breath steady, never hold your breath, and stay inside a comfortable, pain-free range. If you feel any joint pinch, reduce the range or take a short rest. You are doing fantastic!`;
        setAiAnswer(fallbackAdvice);
        startVoice(fallbackAdvice);
      }
    } catch (err) {
      const fallbackAdvice = `Coaching note for ${exercise.name}: Keep your posture tall, move with steady control over 3 seconds, and focus on clean form rather than speed!`;
      setAiAnswer(fallbackAdvice);
      startVoice(fallbackAdvice);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-[#111116] border border-[#2a2a32] rounded-md p-3.5 sm:p-4 shadow-xl text-[#d4d4d8]">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#22222a]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-[#c5a059]/20 border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white font-serif">AI Voice Coach Agent</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-xs bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40">
                Live Speech
              </span>
            </div>
            <p className="text-xs text-[#888] font-mono">
              Narrating exercise mechanics, benefits & real-time coaching cues
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isSpeaking ? (
            <button
              onClick={() => startVoice()}
              className="px-3.5 py-1.5 rounded-sm bg-[#c5a059] text-black font-semibold text-xs font-mono hover:bg-[#d8b56f] transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen to AI Coach</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={pauseVoice}
                className="px-3 py-1.5 rounded-sm bg-[#222] border border-[#444] text-white text-xs font-mono hover:bg-[#333] transition-all flex items-center gap-1"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                onClick={stopVoice}
                className="px-3 py-1.5 rounded-sm bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono hover:bg-red-900/60 transition-all flex items-center gap-1"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsCustomQAModalOpen(!isCustomQAModalOpen)}
            className="px-2.5 py-1.5 rounded-sm bg-[#1c1c24] border border-[#333] text-[#bbb] hover:text-white text-xs font-mono flex items-center gap-1 transition-all"
            title="Ask a custom question to the AI coach"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>

      {/* Voice Controls: Speed & Gender Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs font-mono text-[#888]">
        <div className="flex items-center gap-2">
          <span>Speed:</span>
          {[0.8, 1.0, 1.2].map((rate) => (
            <button
              key={rate}
              onClick={() => {
                setSpeechRate(rate);
                if (isSpeaking) {
                  stopVoice();
                  setTimeout(() => startVoice(), 100);
                }
              }}
              className={`px-2 py-0.5 rounded-xs border transition-all ${
                speechRate === rate
                  ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059] font-bold'
                  : 'bg-[#18181f] border-[#2a2a32] text-[#888] hover:text-white'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span>Voice Tone:</span>
          {(['female', 'male', 'coach'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => {
                setSelectedVoiceGender(gender);
                if (isSpeaking) {
                  stopVoice();
                  setTimeout(() => startVoice(), 100);
                }
              }}
              className={`px-2 py-0.5 rounded-xs border capitalize transition-all ${
                selectedVoiceGender === gender
                  ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059] font-bold'
                  : 'bg-[#18181f] border-[#2a2a32] text-[#888] hover:text-white'
              }`}
            >
              {gender === 'female' ? 'Warm Female' : gender === 'male' ? 'Clear Male' : 'Energetic'}
            </button>
          ))}
        </div>
      </div>

      {/* Active Speech Transcript Wave Bar */}
      {isSpeaking && (
        <div className="mt-3 p-2.5 rounded-sm bg-[#09090c] border border-[#c5a059]/40 flex items-start gap-2.5 text-xs font-mono text-[#e5e5e5] animate-in fade-in">
          {/* Animated sound wave bars */}
          <div className="flex items-end gap-1 h-5 pt-1 flex-shrink-0">
            <span className="w-1 bg-[#c5a059] rounded-full animate-bounce [animation-delay:-0.3s] h-4" />
            <span className="w-1 bg-[#c5a059] rounded-full animate-bounce [animation-delay:-0.15s] h-5" />
            <span className="w-1 bg-[#c5a059] rounded-full animate-bounce h-3" />
            <span className="w-1 bg-[#c5a059] rounded-full animate-bounce [animation-delay:-0.2s] h-4" />
          </div>
          <div className="flex-1">
            <span className="text-[#c5a059] font-bold mr-1.5">Speaking:</span>
            <span className="text-[#d1d5db] italic leading-relaxed">
              "{activeSpeechSnippet || exercise.aiVoiceScript}"
            </span>
          </div>
        </div>
      )}

      {/* Custom AI Q&A Panel */}
      {isCustomQAModalOpen && (
        <div className="mt-3 pt-3 border-t border-[#22222a] space-y-2.5 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#a1a1aa]">
            <span className="flex items-center gap-1.5 text-[#38bdf8]">
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI Coach about this exercise (safety, modifications, joint/senior adjustments):
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAICoach()}
              placeholder="e.g. Is this safe for lower back pain? How can I modify it for knee sensitivity?"
              className="flex-1 bg-[#09090c] border border-[#333] rounded-sm px-3 py-2 text-xs font-mono text-white placeholder-[#666] focus:outline-none focus:border-[#c5a059]"
            />
            <button
              onClick={handleAskAICoach}
              disabled={isAiLoading || !customQuestion.trim()}
              className="px-3.5 py-2 bg-[#38bdf8] text-black font-semibold text-xs font-mono rounded-sm hover:bg-[#60a5fa] disabled:opacity-50 transition-all flex items-center gap-1"
            >
              {isAiLoading ? 'Thinking...' : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>

          {aiAnswer && (
            <div className="p-3 bg-[#0d1520] border border-[#38bdf8]/40 rounded-sm text-xs font-mono text-[#bae6fd] space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-[#38bdf8]" />
                AI Coach Advice:
              </div>
              <p className="leading-relaxed text-[#e0f2fe]">{aiAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
