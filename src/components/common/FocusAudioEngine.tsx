import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Headphones,
  Play,
  Pause,
  Sparkles,
  Zap,
  Flame,
  Moon,
  CloudRain,
  Wind,
  Activity,
  X,
} from 'lucide-react';

export type AmbientSoundType =
  | 'alpha_10hz'
  | 'gamma_40hz'
  | 'gamma_45hz'
  | 'deep_brown'
  | 'rainfall'
  | 'cosmic_drift';

export type BinauralFrequencyHz = 10 | 40 | 45;
export type CarrierFrequencyHz = 216 | 432 | 528;

interface FocusAudioEngineProps {
  compact?: boolean;
  onCloseCompact?: () => void;
}

export const FocusAudioEngine: React.FC<FocusAudioEngineProps> = ({
  compact = false,
  onCloseCompact,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState<AmbientSoundType>('alpha_10hz');
  const [binauralHz, setBinauralHz] = useState<BinauralFrequencyHz>(10);
  const [carrierHz, setCarrierHz] = useState<CarrierFrequencyHz>(432);
  const [volume, setVolume] = useState(0.5);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const nodesRef = useRef<any[]>([]);

  // Close compact menu on outside click
  useEffect(() => {
    if (!compact || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (onCloseCompact) onCloseCompact();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [compact, isOpen, onCloseCompact]);

  // Sound generator using Web Audio API
  const startAudio = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Stop previous nodes cleanly
      stopAudio();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const createdNodes: any[] = [masterGain];

      const isBinaural =
        selectedSound === 'alpha_10hz' ||
        selectedSound === 'gamma_40hz' ||
        selectedSound === 'gamma_45hz';

      if (isBinaural) {
        let targetDiff: number = binauralHz;
        if (selectedSound === 'alpha_10hz') targetDiff = 10;
        else if (selectedSound === 'gamma_40hz') targetDiff = 40;
        else if (selectedSound === 'gamma_45hz') targetDiff = 45;

        const baseCarrier = carrierHz === 216 ? 216 : carrierHz === 528 ? 264 : 216;
        const leftFreq = baseCarrier;
        const rightFreq = baseCarrier + targetDiff;

        const merger = ctx.createChannelMerger(2);

        // Left ear
        const oscLeft = ctx.createOscillator();
        oscLeft.type = 'sine';
        oscLeft.frequency.setValueAtTime(leftFreq, ctx.currentTime);

        const gainLeft = ctx.createGain();
        gainLeft.gain.setValueAtTime(0.7, ctx.currentTime);
        oscLeft.connect(gainLeft);
        gainLeft.connect(merger, 0, 0);

        // Right ear
        const oscRight = ctx.createOscillator();
        oscRight.type = 'sine';
        oscRight.frequency.setValueAtTime(rightFreq, ctx.currentTime);

        const gainRight = ctx.createGain();
        gainRight.gain.setValueAtTime(0.7, ctx.currentTime);
        oscRight.connect(gainRight);
        gainRight.connect(merger, 0, 1);

        // Sub-harmonic warm base
        const subOsc = ctx.createOscillator();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(baseCarrier / 2, ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.2, ctx.currentTime);
        subOsc.connect(subGain);
        subGain.connect(masterGain);

        merger.connect(masterGain);

        oscLeft.start();
        oscRight.start();
        subOsc.start();

        leftOscRef.current = oscLeft;
        rightOscRef.current = oscRight;

        createdNodes.push(oscLeft, oscRight, gainLeft, gainRight, merger, subOsc, subGain);
      } else if (selectedSound === 'deep_brown') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();

        createdNodes.push(whiteNoise, filter);
      } else if (selectedSound === 'rainfall') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(1200, ctx.currentTime);
        bandpass.Q.setValueAtTime(0.5, ctx.currentTime);

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(2500, ctx.currentTime);

        whiteNoise.connect(bandpass);
        bandpass.connect(lowpass);
        lowpass.connect(masterGain);
        whiteNoise.start();

        createdNodes.push(whiteNoise, bandpass, lowpass);
      } else if (selectedSound === 'cosmic_drift') {
        const freqs = [108, 162, 216, 324];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq + idx * 0.4, ctx.currentTime);
          gain.gain.setValueAtTime(0.15 / (idx + 1), ctx.currentTime);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start();
          createdNodes.push(osc, gain);
        });
      }

      nodesRef.current = createdNodes;
      setIsPlaying(true);
    } catch (e) {
      console.warn('Audio context init error:', e);
    }
  };

  const stopAudio = () => {
    try {
      nodesRef.current.forEach((node) => {
        if (node && typeof node.stop === 'function') {
          try {
            node.stop();
          } catch {}
        }
        if (node && typeof node.disconnect === 'function') {
          try {
            node.disconnect();
          } catch {}
        }
      });
      nodesRef.current = [];
      leftOscRef.current = null;
      rightOscRef.current = null;
      setIsPlaying(false);
    } catch (e) {
      console.warn('Audio stop error:', e);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  const handleSelectFrequency = (hz: BinauralFrequencyHz) => {
    setBinauralHz(hz);
    if (hz === 10) setSelectedSound('alpha_10hz');
    else if (hz === 40) setSelectedSound('gamma_40hz');
    else if (hz === 45) setSelectedSound('gamma_45hz');

    if (isPlaying && audioCtxRef.current && leftOscRef.current && rightOscRef.current) {
      const ctx = audioCtxRef.current;
      const base = carrierHz === 216 ? 216 : carrierHz === 528 ? 264 : 216;
      leftOscRef.current.frequency.cancelScheduledValues(ctx.currentTime);
      rightOscRef.current.frequency.cancelScheduledValues(ctx.currentTime);
      leftOscRef.current.frequency.linearRampToValueAtTime(base, ctx.currentTime + 0.1);
      rightOscRef.current.frequency.linearRampToValueAtTime(base + hz, ctx.currentTime + 0.1);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startAudio();
    }
    return () => {
      stopAudio();
    };
  }, [selectedSound, carrierHz]);

  const soundOptions: Array<{
    id: AmbientSoundType;
    hz?: number;
    label: string;
    badge: string;
    icon: React.ReactNode;
    desc: string;
  }> = [
    {
      id: 'alpha_10hz',
      hz: 10,
      label: '10Hz Alpha Waves',
      badge: '10 Hz',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#c5a059] flex-shrink-0" />,
      desc: 'Relaxed focus, calm concentration & flow',
    },
    {
      id: 'gamma_40hz',
      hz: 40,
      label: '40Hz Gamma Focus',
      badge: '40 Hz',
      icon: <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />,
      desc: 'Deep coding & complex problem solving',
    },
    {
      id: 'gamma_45hz',
      hz: 45,
      label: '45Hz High-Gamma',
      badge: '45 Hz',
      icon: <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />,
      desc: 'Acute synaptic speed & pattern recognition',
    },
    {
      id: 'deep_brown',
      label: 'Deep Brown Noise',
      badge: 'Mask',
      icon: <Moon className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />,
      desc: 'Low-frequency acoustic shield',
    },
    {
      id: 'rainfall',
      label: 'Monsoon Rain',
      badge: 'Nature',
      icon: <CloudRain className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />,
      desc: 'Gentle organic rainfall synthesis',
    },
    {
      id: 'cosmic_drift',
      label: 'Cosmic Drone',
      badge: 'Drone',
      icon: <Wind className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />,
      desc: 'Harmonic resonant detuned sines',
    },
  ];

  const activeOption = soundOptions.find((o) => o.id === selectedSound);
  const isBinauralMode =
    selectedSound === 'alpha_10hz' ||
    selectedSound === 'gamma_40hz' ||
    selectedSound === 'gamma_45hz';

  // Compact Header / Pill Mode
  if (compact) {
    return (
      <div ref={containerRef} className="relative inline-block max-w-full">
        <button
          id="compact-focus-audio-btn"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border text-xs transition-all max-w-full truncate ${
            isPlaying
              ? 'bg-[#c5a059]/15 border-[#c5a059] text-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.2)] animate-pulse'
              : 'bg-[#111] border-[#1a1a1a] text-[#888] hover:text-white hover:border-[#333]'
          }`}
          title="Binaural Focus Soundscape (10Hz / 40Hz / 45Hz)"
        >
          <Headphones className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline text-[10px] uppercase tracking-wider font-mono truncate">
            {isPlaying ? `${activeOption?.badge || '10Hz'} ON` : 'Audio'}
          </span>
        </button>

        {isOpen && (
          <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full mt-1 w-[calc(100vw-1rem)] sm:w-80 max-w-[340px] p-3.5 bg-[#0a0a0a] border border-[#c5a059]/40 rounded-sm shadow-2xl z-50 animate-in zoom-in-95 overflow-hidden box-border">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2 min-w-0">
                <Headphones className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-serif text-white tracking-wider block truncate">
                    Binaural Focus Engine
                  </span>
                  <span className="text-[9px] text-[#777] font-mono block truncate">
                    10Hz • 40Hz • 45Hz Synthesizer
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={togglePlayback}
                  className={`p-1.5 rounded-full transition-all ${
                    isPlaying
                      ? 'bg-[#c5a059] text-black shadow-[0_0_10px_rgba(197,160,89,0.5)]'
                      : 'bg-[#222] text-[#888] hover:text-white'
                  }`}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-[#666] hover:text-white rounded-sm"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Frequency Tabs for 10Hz, 40Hz, 45Hz */}
            <div className="my-2.5 p-1 bg-[#111] rounded-sm border border-[#1a1a1a]">
              <div className="text-[9px] uppercase tracking-widest text-[#777] font-mono px-1 pb-1 flex items-center justify-between">
                <span>Neural Band</span>
                <span className="text-[#c5a059] font-bold">
                  {isBinauralMode ? `${binauralHz} Hz` : 'Ambient'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {([10, 40, 45] as BinauralFrequencyHz[]).map((hz) => {
                  const isCur = isBinauralMode && binauralHz === hz;
                  return (
                    <button
                      key={hz}
                      onClick={() => handleSelectFrequency(hz)}
                      className={`py-1 px-1 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all flex flex-col items-center justify-center min-w-0 ${
                        isCur
                          ? 'bg-[#c5a059] text-black font-bold shadow-[0_0_8px_rgba(197,160,89,0.3)]'
                          : 'bg-[#181818] text-[#888] hover:text-white hover:bg-[#222]'
                      }`}
                    >
                      <span className="font-bold">{hz} Hz</span>
                      <span className="text-[8px] opacity-80 truncate">
                        {hz === 10 ? 'Alpha' : hz === 40 ? 'Gamma' : 'Hi-Gamma'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sound Presets List */}
            <div className="space-y-1 my-2 max-h-40 overflow-y-auto pr-0.5 custom-scrollbar">
              {soundOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedSound(opt.id);
                    if (opt.hz) setBinauralHz(opt.hz as BinauralFrequencyHz);
                  }}
                  className={`w-full flex items-center justify-between p-1.5 rounded-sm text-left transition-all min-w-0 ${
                    selectedSound === opt.id
                      ? 'bg-[#161616] border border-[#c5a059]/60 text-[#c5a059]'
                      : 'hover:bg-[#111] text-[#999] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {opt.icon}
                    <div className="min-w-0 flex-1 truncate">
                      <div className="text-[11px] font-medium text-white flex items-center gap-1.5 truncate">
                        <span className="truncate">{opt.label}</span>
                      </div>
                      <div className="text-[9px] text-[#666] truncate">{opt.desc}</div>
                    </div>
                  </div>
                  {selectedSound === opt.id && isPlaying && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-ping flex-shrink-0 ml-1" />
                  )}
                </button>
              ))}
            </div>

            {/* Volume Control */}
            <div className="pt-2 border-t border-[#1a1a1a]">
              <div className="flex items-center justify-between text-[10px] text-[#777] mb-1 font-mono">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#222] accent-[#c5a059] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Embedded / Sidebar / Card View
  return (
    <div className="w-full max-w-full p-3 sm:p-3.5 rounded-sm bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#c5a059]/40 transition-all space-y-2.5 overflow-hidden box-border">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-sm bg-[#111] border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] flex-shrink-0">
            <Headphones className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-serif text-white tracking-wide truncate">
              Focus Soundscape
            </h4>
            <p className="text-[9px] text-[#777] font-mono truncate">
              10Hz • 40Hz • 45Hz
            </p>
          </div>
        </div>

        <button
          onClick={togglePlayback}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-semibold uppercase tracking-wider transition-all flex-shrink-0 ${
            isPlaying
              ? 'bg-[#c5a059] text-black shadow-[0_0_10px_rgba(197,160,89,0.3)]'
              : 'bg-[#161616] text-[#c5a059] border border-[#c5a059]/40 hover:bg-[#222]'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Play</span>
            </>
          )}
        </button>
      </div>

      {/* Discrete Frequency Selector (10Hz, 40Hz, 45Hz) */}
      <div className="p-1.5 sm:p-2 rounded-sm bg-[#070707] border border-[#181818] space-y-1.5 overflow-hidden">
        <div className="flex items-center justify-between text-[9px] uppercase font-mono text-[#777]">
          <span className="flex items-center gap-1 truncate">
            <Activity className="w-2.5 h-2.5 text-[#c5a059] flex-shrink-0" />
            <span>Target Band</span>
          </span>
          <span className="text-[#c5a059] font-bold">
            {isBinauralMode ? `${binauralHz} Hz` : 'Ambient'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {([10, 40, 45] as BinauralFrequencyHz[]).map((hz) => {
            const isSelected = isBinauralMode && binauralHz === hz;
            return (
              <button
                key={hz}
                onClick={() => handleSelectFrequency(hz)}
                className={`p-1.5 rounded-sm text-center border transition-all min-w-0 ${
                  isSelected
                    ? 'bg-[#18150f] border-[#c5a059] text-[#c5a059] shadow-[0_0_8px_rgba(197,160,89,0.15)]'
                    : 'bg-[#0d0d0d] border-[#1a1a1a] text-[#888] hover:border-[#333] hover:text-white'
                }`}
              >
                <div className="text-[11px] font-mono font-bold leading-tight truncate">
                  {hz} Hz
                </div>
                <div className="text-[8px] text-[#666] uppercase truncate">
                  {hz === 10 ? 'Alpha' : hz === 40 ? 'Gamma' : 'Hi-Gamma'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Soundscape Options List (Responsive 1 or 2 Columns) */}
      <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto pr-0.5 custom-scrollbar">
        {soundOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              setSelectedSound(opt.id);
              if (opt.hz) setBinauralHz(opt.hz as BinauralFrequencyHz);
            }}
            className={`p-1.5 rounded-sm text-left border transition-all flex items-center justify-between min-w-0 ${
              selectedSound === opt.id
                ? 'bg-[#141414] border-[#c5a059] text-[#c5a059]'
                : 'bg-[#080808] border-[#1a1a1a] text-[#888] hover:border-[#333] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {opt.icon}
              <div className="min-w-0 flex-1 truncate">
                <span className="text-[10px] font-medium text-white truncate block">
                  {opt.label}
                </span>
                <span className="text-[8px] text-[#666] truncate block">{opt.desc}</span>
              </div>
            </div>
            {selectedSound === opt.id && isPlaying && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-ping flex-shrink-0 ml-1" />
            )}
          </button>
        ))}
      </div>

      {/* Carrier Tuning & Volume Bar */}
      <div className="space-y-1.5 pt-1.5 border-t border-[#141414] text-[10px] font-mono">
        <div className="flex items-center justify-between text-[#777]">
          <span>Carrier Base:</span>
          <div className="flex items-center gap-1">
            {([216, 432, 528] as CarrierFrequencyHz[]).map((cHz) => (
              <button
                key={cHz}
                onClick={() => setCarrierHz(cHz)}
                className={`px-1 py-0.2 rounded-xs transition-all text-[9px] ${
                  carrierHz === cHz
                    ? 'bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/50'
                    : 'bg-[#111] text-[#666] hover:text-[#aaa]'
                }`}
              >
                {cHz}Hz
              </button>
            ))}
          </div>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-3 h-3 text-[#666] flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#1a1a1a] accent-[#c5a059] rounded-lg cursor-pointer"
          />
          <span className="text-[9px] font-mono text-[#888] w-6 text-right flex-shrink-0">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
