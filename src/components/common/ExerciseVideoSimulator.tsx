import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Layers,
  Activity,
  Maximize2,
  Sliders,
  Compass,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ExerciseGuide } from './ExerciseCoachModal';

interface ExerciseVideoSimulatorProps {
  exercise: ExerciseGuide;
  activeStepIdx: number;
  onStepChange?: (idx: number) => void;
  isAudioCuesEnabled?: boolean;
}

export const ExerciseVideoSimulator: React.FC<ExerciseVideoSimulatorProps> = ({
  exercise,
  activeStepIdx,
  onStepChange,
  isAudioCuesEnabled = true,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [animationPhase, setAnimationPhase] = useState<number>(0); // 0 to 1
  const [currentMovementPhase, setCurrentMovementPhase] = useState<string>('Preparation');
  const [showMuscles, setShowMuscles] = useState<boolean>(true);
  const [showAngles, setShowAngles] = useState<boolean>(true);
  const [showForces, setShowForces] = useState<boolean>(true);

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const progressRef = useRef<number>(0);

  // Play audio beep cue on key phases
  const playCueSound = (freq = 560, duration = 0.08) => {
    if (!isAudioCuesEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Main animation clock loop
  useEffect(() => {
    let lastPhaseIdx = -1;

    const loop = (time: number) => {
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying) {
        // Base rep duration from cadence or default 3 seconds
        const totalDuration = (exercise.cadence.down + exercise.cadence.hold + exercise.cadence.up) || 3;
        const normalizedRate = (1 / totalDuration) * playbackSpeed;
        progressRef.current = (progressRef.current + delta * normalizedRate) % 1;
        setAnimationPhase(progressRef.current);

        // Compute movement phase label & cues
        const p = progressRef.current;
        if (p < 0.45) {
          setCurrentMovementPhase('Phase A: Eccentric / Drive');
          if (lastPhaseIdx !== 0) {
            lastPhaseIdx = 0;
            if (onStepChange && exercise.steps.length > 0) onStepChange(0);
          }
        } else if (p < 0.6) {
          setCurrentMovementPhase('Phase B: Peak / Isometric Checkpoint');
          if (lastPhaseIdx !== 1) {
            lastPhaseIdx = 1;
            playCueSound(680, 0.1);
            if (onStepChange && exercise.steps.length > 1) onStepChange(1 % exercise.steps.length);
          }
        } else {
          setCurrentMovementPhase('Phase C: Concentric / Elastic Rebound');
          if (lastPhaseIdx !== 2) {
            lastPhaseIdx = 2;
            playCueSound(880, 0.12);
            if (onStepChange && exercise.steps.length > 2) onStepChange((exercise.steps.length - 1) % exercise.steps.length);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, exercise, onStepChange, isAudioCuesEnabled]);

  // Smooth sinusoidal normalized motion curves
  const motionT = (1 - Math.cos(animationPhase * Math.PI * 2)) / 2; // 0 to 1 to 0
  const phaseAngle = animationPhase * Math.PI * 2; // 0 to 2PI

  // Render Exercise-Specific Biomechanical Wireframes
  const renderBiomechanicalSkeleton = () => {
    switch (exercise.id) {
      /* ==================== 1. SKIPPING / SPEED JUMP ROPE ==================== */
      case 'skipping': {
        // High frequency bounce: body hops 12px off floor, rope sweeps overhead and under feet
        const jumpHeight = Math.max(0, Math.sin(phaseAngle)) * 14;
        const headY = 48 - jumpHeight;
        const shoulderY = 68 - jumpHeight;
        const hipY = 108 - jumpHeight;
        const kneeY = 142 - jumpHeight;
        const ankleY = 175 - jumpHeight;
        const footY = 185 - jumpHeight;

        // Wrists rotating in tight circle at hip sides
        const wristRotRadius = 5;
        const lWristX = 72 + Math.cos(phaseAngle) * wristRotRadius;
        const lWristY = 108 + Math.sin(phaseAngle) * wristRotRadius - jumpHeight;
        const rWristX = 128 - Math.cos(phaseAngle) * wristRotRadius;
        const rWristY = 108 + Math.sin(phaseAngle) * wristRotRadius - jumpHeight;

        // Rope 3D Path calculated via phaseAngle
        // When phaseAngle is 0 (bottom), rope passes under feet (y=190)
        // When phaseAngle is PI (top), rope sweeps overhead (y=20)
        const ropeY = 100 - Math.cos(phaseAngle) * 85;
        const ropeSpread = 60 * Math.sin(phaseAngle);

        return (
          <g>
            {/* Ground Plane Baseline */}
            <line x1="30" y1="185" x2="170" y2="185" stroke="#333" strokeWidth="2.5" />

            {/* Elastic Jump Impact Cushion Glow on Ground */}
            {jumpHeight <= 2 && (
              <ellipse cx="100" cy="185" rx="22" ry="4" fill="#c5a059" fillOpacity="0.4" />
            )}

            {/* Rope Arc Rendering (Back / Top layer) */}
            <path
              d={`M ${lWristX} ${lWristY} Q 100 ${ropeY} ${rWristX} ${rWristY}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              opacity={0.85}
            />

            {/* Muscle Activation Glows (Calves & Forearms) */}
            {showMuscles && (
              <>
                <circle cx="92" cy={ankleY - 14} r={8 + (jumpHeight > 2 ? 3 : 0)} fill="#34d399" fillOpacity={0.35} />
                <circle cx="108" cy={ankleY - 14} r={8 + (jumpHeight > 2 ? 3 : 0)} fill="#34d399" fillOpacity={0.35} />
                <circle cx="75" cy={shoulderY + 20} r="6" fill="#c5a059" fillOpacity="0.3" />
                <circle cx="125" cy={shoulderY + 20} r="6" fill="#c5a059" fillOpacity="0.3" />
              </>
            )}

            {/* Torso & Head */}
            <circle cx="100" cy={headY} r="11" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />
            <line x1="100" y1={shoulderY} x2="100" y2={hipY} stroke="#f5f5f5" strokeWidth="4" />

            {/* Upper Arms Pinned to Ribs */}
            <line x1="90" y1={shoulderY} x2="78" y2={shoulderY + 22} stroke="#f5f5f5" strokeWidth="3" />
            <line x1="110" y1={shoulderY} x2="122" y2={shoulderY + 22} stroke="#f5f5f5" strokeWidth="3" />

            {/* Forearms to Wrists */}
            <line x1="78" y1={shoulderY + 22} x2={lWristX} y2={lWristY} stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <line x1="122" y1={shoulderY + 22} x2={rWristX} y2={rWristY} stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

            {/* Legs (Knees Soft, Ankles Plantarflexed) */}
            <line x1="95" y1={hipY} x2="92" y2={kneeY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="105" y1={hipY} x2="108" y2={kneeY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />

            <line x1="92" y1={kneeY} x2="92" y2={ankleY} stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
            <line x1="108" y1={kneeY} x2="108" y2={ankleY} stroke="#34d399" strokeWidth="3" strokeLinecap="round" />

            {/* Feet (Toes pointing down slightly during air phase) */}
            <line x1="92" y1={ankleY} x2="90" y2={footY} stroke="#f5f5f5" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="108" y1={ankleY} x2="110" y2={footY} stroke="#f5f5f5" strokeWidth="3.5" strokeLinecap="round" />

            {/* Articulation Nodes */}
            <circle cx={lWristX} cy={lWristY} r="3.5" fill="#f59e0b" />
            <circle cx={rWristX} cy={rWristY} r="3.5" fill="#f59e0b" />
            <circle cx="92" cy={kneeY} r="3.5" fill="#34d399" />
            <circle cx="108" cy={kneeY} r="3.5" fill="#34d399" />

            {/* Telemetry Annotations */}
            {showAngles && (
              <g>
                <text x="50" y="32" fill="#c5a059" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  Wrist Pivot: 360° Rhythm
                </text>
                <text x="55" y="195" fill="#34d399" fontSize="8" fontFamily="monospace">
                  Ball-of-Foot Clearance: 1 inch
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 2. HORIZONTAL MOUNTAIN CLIMBERS ==================== */
      case 'mountain_climber': {
        const drivePhase = Math.sin(phaseAngle);
        const lLegT = (1 + drivePhase) / 2; // Left leg drives forward
        const rLegT = (1 - drivePhase) / 2; // Right leg extends back

        const shoulderX = 145;
        const shoulderY = 105;
        const hipX = 85;
        const hipY = 112;
        const handX = 145;
        const handY = 150;

        // Left Knee Driving toward chest
        const lKneeX = 65 + lLegT * 42;
        const lKneeY = 140 - lLegT * 18;
        const lFootX = 35 + lLegT * 40;
        const lFootY = 150 - lLegT * 8;

        // Right Knee Extended / Returning
        const rKneeX = 65 + rLegT * 42;
        const rKneeY = 140 - rLegT * 18;
        const rFootX = 35 + rLegT * 40;
        const rFootY = 150 - rLegT * 8;

        return (
          <g>
            {/* Floor Baseline */}
            <line x1="20" y1="150" x2="180" y2="150" stroke="#333" strokeWidth="3" />

            {/* Core Activation Zone */}
            {showMuscles && (
              <circle cx="105" cy="115" r="18" fill="#34d399" fillOpacity="0.25" />
            )}

            {/* Spine */}
            <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />

            {/* Head */}
            <circle cx="162" cy="98" r="10" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {/* Arms Vertical Stack */}
            <line x1={shoulderX} y1={shoulderY} x2={handX} y2={handY} stroke="#c5a059" strokeWidth="3.5" strokeLinecap="round" />

            {/* Right Leg (Back) */}
            <line x1={hipX} y1={hipY} x2={rKneeX} y2={rKneeY} stroke="#555" strokeWidth="3" strokeLinecap="round" />
            <line x1={rKneeX} y1={rKneeY} x2={rFootX} y2={rFootY} stroke="#555" strokeWidth="3" strokeLinecap="round" />

            {/* Left Leg (Active Drive) */}
            <line x1={hipX} y1={hipY} x2={lKneeX} y2={lKneeY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            <line x1={lKneeX} y1={lKneeY} x2={lFootX} y2={lFootY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />

            {/* Joints */}
            <circle cx={shoulderX} cy={shoulderY} r="4" fill="#c5a059" />
            <circle cx={hipX} cy={hipY} r="4" fill="#38bdf8" />
            <circle cx={lKneeX} cy={lKneeY} r="4" fill="#34d399" />

            {showAngles && (
              <g>
                <text x="40" y="85" fill="#34d399" fontSize="9" fontFamily="monospace">
                  Piston Knee Drive: Anti-Extension Core
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 3. HIGH-KNEE EXPLOSIVE SPRINT ==================== */
      case 'high_knees': {
        const drivePhase = Math.sin(phaseAngle);
        const lLift = Math.max(0, drivePhase) * 45;
        const rLift = Math.max(0, -drivePhase) * 45;
        const hop = Math.abs(Math.sin(phaseAngle)) * 8;

        const headY = 44 - hop;
        const shoulderY = 64 - hop;
        const hipY = 106 - hop;

        return (
          <g>
            {/* Ground Baseline */}
            <line x1="40" y1="185" x2="160" y2="185" stroke="#333" strokeWidth="3" />

            {/* Muscle Activation */}
            {showMuscles && (
              <circle cx="100" cy={hipY} r="16" fill="#34d399" fillOpacity="0.3" />
            )}

            {/* Torso & Head */}
            <line x1="100" y1={shoulderY} x2="100" y2={hipY} stroke="#f5f5f5" strokeWidth="4" />
            <circle cx="100" cy={headY} r="11" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {/* Left Arm & Right Arm Pumping */}
            <line x1="90" y1={shoulderY} x2={75 - drivePhase * 15} y2={shoulderY + 15 + drivePhase * 12} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="110" y1={shoulderY} x2={125 + drivePhase * 15} y2={shoulderY + 15 - drivePhase * 12} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />

            {/* Left Leg */}
            <line x1="95" y1={hipY} x2="88" y2={145 - lLift} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="88" y1={145 - lLift} x2="88" y2={185 - lLift * 0.8} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />

            {/* Right Leg */}
            <line x1="105" y1={hipY} x2="112" y2={145 - rLift} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="112" y1={145 - rLift} x2="112" y2={185 - rLift * 0.8} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />

            {showAngles && (
              <g>
                <line x1="70" y1="106" x2="130" y2="106" stroke="#c5a059" strokeWidth="1" strokeDasharray="3 3" />
                <text x="45" y="32" fill="#c5a059" fontSize="9" fontFamily="monospace">
                  Target: 90° Hip Thigh Flexion
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 4. BIRD DOG CONTRALATERAL REACH ==================== */
      case 'bird_dog': {
        const reach = motionT * 28;
        const shoulderX = 135;
        const shoulderY = 115;
        const hipX = 75;
        const hipY = 115;

        // Front Left Arm Reaching forward horizontally
        const handReachX = 135 + reach * 1.5;
        const handReachY = 115 - reach * 0.2;

        // Back Right Leg Extending back horizontally
        const footReachX = 75 - reach * 1.6;
        const footReachY = 115 + reach * 0.1;

        return (
          <g>
            {/* Floor Baseline */}
            <line x1="20" y1="165" x2="180" y2="165" stroke="#333" strokeWidth="3" />

            {/* Posterior Oblique Sling Muscle Glow */}
            {showMuscles && (
              <line
                x1={handReachX}
                y1={handReachY}
                x2={footReachX}
                y2={footReachY}
                stroke="#c5a059"
                strokeWidth="10"
                strokeOpacity={0.2 + motionT * 0.3}
                strokeLinecap="round"
              />
            )}

            {/* Flat Tabletop Torso Line */}
            <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#f5f5f5" strokeWidth="4" />

            {/* Head */}
            <circle cx="150" cy="110" r="10" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {/* Grounded Right Hand (Under Shoulder) */}
            <line x1={shoulderX} y1={shoulderY} x2={shoulderX} y2="165" stroke="#888" strokeWidth="3.5" strokeLinecap="round" />

            {/* Grounded Left Knee (Under Hip) */}
            <line x1={hipX} y1={hipY} x2={hipX} y2="165" stroke="#888" strokeWidth="3.5" strokeLinecap="round" />

            {/* Elevated Arm Reach */}
            <line x1={shoulderX} y1={shoulderY} x2={handReachX} y2={handReachY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={handReachX} cy={handReachY} r="3" fill="#38bdf8" />

            {/* Elevated Leg Reach */}
            <line x1={hipX} y1={hipY} x2={footReachX} y2={footReachY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={footReachX} cy={footReachY} r="3" fill="#34d399" />

            {/* Laser Neutral Spine Line */}
            {showAngles && (
              <g>
                <line x1="20" y1="115" x2="185" y2="115" stroke="#c5a059" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <text x="35" y="90" fill="#c5a059" fontSize="9" fontFamily="monospace">
                  Laser Horizontal: 180° Zero Pelvic Tilt
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 5. DEAD BUG ANTI-EXTENSION ==================== */
      case 'dead_bug': {
        const ext = motionT * 40;
        const shoulderX = 65;
        const hipX = 135;
        const spineY = 140;

        // Opposite arm reaches back overhead
        const armReachX = shoulderX - ext * 0.8;
        const armReachY = spineY - 45 + ext * 0.8;

        // Opposite leg extends forward flat
        const legReachX = hipX + ext * 0.9;
        const legReachY = spineY - 40 + ext * 0.7;

        return (
          <g>
            {/* Floor Mat Baseline */}
            <line x1="20" y1="145" x2="180" y2="145" stroke="#333" strokeWidth="4" />

            {/* Core Anti-Extension Pressure Zone into Floor */}
            {showMuscles && (
              <ellipse cx="100" cy={spineY} rx="35" ry="8" fill="#34d399" fillOpacity={0.35 + motionT * 0.25} />
            )}

            {/* Flat Spine firmly pressed on mat */}
            <line x1={shoulderX} y1={spineY} x2={hipX} y2={spineY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />

            {/* Head Resting on Mat */}
            <circle cx="48" cy={spineY - 5} r="10" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {/* Static 90° Arm */}
            <line x1={shoulderX} y1={spineY} x2={shoulderX} y2={spineY - 45} stroke="#666" strokeWidth="3" />

            {/* Static 90° Leg */}
            <line x1={hipX} y1={spineY} x2={hipX} y2={spineY - 35} stroke="#666" strokeWidth="3" />
            <line x1={hipX} y1={spineY - 35} x2={hipX + 25} y2={spineY - 35} stroke="#666" strokeWidth="3" />

            {/* Dynamic Extending Arm */}
            <line x1={shoulderX} y1={spineY} x2={armReachX} y2={armReachY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />

            {/* Dynamic Extending Leg */}
            <line x1={hipX} y1={spineY} x2={legReachX} y2={legReachY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />

            {showAngles && (
              <g>
                <text x="35" y="70" fill="#34d399" fontSize="9" fontFamily="monospace">
                  Lumbar Spine: Flush Against Mat (0° Gap)
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 6. BEAR CRAWL ISOMETRIC HOVER ==================== */
      case 'bear_hover': {
        const pulse = Math.sin(phaseAngle) * 2;
        const shoulderX = 135;
        const shoulderY = 115 + pulse;
        const hipX = 75;
        const hipY = 115 + pulse;
        const handX = 135;
        const handY = 160;
        const kneeX = 75;
        const kneeY = 152 + pulse; // Hovering 8px above floor
        const toeX = 55;
        const toeY = 160;

        return (
          <g>
            {/* Floor Baseline */}
            <line x1="20" y1="160" x2="180" y2="160" stroke="#333" strokeWidth="3" />

            {/* Full Body Tension Shield Glow */}
            {showMuscles && (
              <>
                <circle cx="105" cy="115" r="20" fill="#34d399" fillOpacity="0.3" />
                <circle cx={kneeX} cy={kneeY - 12} r="10" fill="#c5a059" fillOpacity="0.35" />
              </>
            )}

            {/* Rigid Tabletop Spine */}
            <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />

            {/* Head */}
            <circle cx="150" cy={shoulderY - 5} r="10" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {/* Arms Vertical Column */}
            <line x1={shoulderX} y1={shoulderY} x2={handX} y2={handY} stroke="#c5a059" strokeWidth="3.5" strokeLinecap="round" />

            {/* Thigh (Femur) 90° Down */}
            <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="#34d399" strokeWidth="4" strokeLinecap="round" />

            {/* Shin (Tibia) 90° Parallel to Floor */}
            <line x1={kneeX} y1={kneeY} x2={toeX} y2={toeY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />

            {/* Hover Gap Highlight */}
            <line x1={kneeX - 10} y1="160" x2={kneeX + 10} y2="160" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2 2" />

            {/* Joints */}
            <circle cx={shoulderX} cy={shoulderY} r="4" fill="#c5a059" />
            <circle cx={hipX} cy={hipY} r="4" fill="#38bdf8" />
            <circle cx={kneeX} cy={kneeY} r="4" fill="#34d399" />

            {showAngles && (
              <g>
                <text x="35" y="80" fill="#f59e0b" fontSize="9" fontFamily="monospace">
                  Knee Hover Gap: 1 Inch Off Mat
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 7. WORLD'S GREATEST MOBILITY FLOW ==================== */
      case 'worlds_greatest_stretch': {
        const twistAngle = motionT * 95; // Torso and arm rotate skyward
        const shoulderX = 120;
        const shoulderY = 110;
        const hipX = 70;
        const hipY = 120;

        const skyArmX = shoulderX + Math.sin((twistAngle * Math.PI) / 180) * 45;
        const skyArmY = shoulderY - Math.cos((twistAngle * Math.PI) / 180) * 45;

        return (
          <g>
            {/* Ground Line */}
            <line x1="20" y1="160" x2="180" y2="160" stroke="#333" strokeWidth="3" />

            {/* Thoracic Rotation Arc */}
            {showMuscles && (
              <circle cx={shoulderX} cy={shoulderY} r="18" fill="#38bdf8" fillOpacity={0.35} />
            )}

            {/* Deep Front Lunge Leg */}
            <line x1={hipX} y1={hipY} x2="140" y2="125" stroke="#34d399" strokeWidth="4" />
            <line x1="140" y1="125" x2="140" y2="160" stroke="#34d399" strokeWidth="4" />

            {/* Long Back Leg */}
            <line x1={hipX} y1={hipY} x2="35" y2="160" stroke="#c5a059" strokeWidth="3.5" />

            {/* Torso */}
            <line x1={hipX} y1={hipY} x2={shoulderX} y2={shoulderY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />

            {/* Planted Hand on Floor */}
            <line x1={shoulderX} y1={shoulderY} x2="120" y2="160" stroke="#888" strokeWidth="3.5" />

            {/* Skyward Reaching Arm */}
            <line x1={shoulderX} y1={shoulderY} x2={skyArmX} y2={skyArmY} stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
            <circle cx={skyArmX} cy={skyArmY} r="3.5" fill="#38bdf8" />

            {/* Head */}
            <circle cx={shoulderX + 12} cy={shoulderY - 8} r="10" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {showAngles && (
              <g>
                <text x="35" y="45" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                  Thoracic Spine Rotation: {Math.round(twistAngle)}°
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 8. PRONE COBRA POSTURE SCULPTOR ==================== */
      case 'prone_cobra': {
        const chestLift = motionT * 22;
        const armLift = motionT * 18;

        const headX = 155;
        const headY = 125 - chestLift;
        const shoulderX = 135;
        const shoulderY = 135 - chestLift * 0.8;
        const hipX = 65;
        const hipY = 150;

        const handX = 75 - armLift * 0.5;
        const handY = 145 - armLift;

        return (
          <g>
            {/* Floor Line */}
            <line x1="20" y1="155" x2="180" y2="155" stroke="#333" strokeWidth="3" />

            {/* Rhomboids / Lower Trap Scapular Pinch Glow */}
            {showMuscles && (
              <circle cx="115" cy={shoulderY + 5} r={14 + armLift * 0.5} fill="#c5a059" fillOpacity={0.4} />
            )}

            {/* Legs on floor */}
            <line x1={hipX} y1={hipY} x2="25" y2="155" stroke="#555" strokeWidth="3.5" />

            {/* Spine Extension Arc */}
            <path
              d={`M ${hipX} ${hipY} Q 100 ${145 - chestLift * 0.5} ${shoulderX} ${shoulderY}`}
              fill="none"
              stroke="#f5f5f5"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Head with Neutral Neck (Gaze at mat) */}
            <circle cx={headX} cy={headY} r="10" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {/* Externally Rotated Arms / Thumbs Up */}
            <line x1={shoulderX} y1={shoulderY} x2={handX} y2={handY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={handX} cy={handY} r="3" fill="#38bdf8" />

            {showAngles && (
              <g>
                <text x="35" y="85" fill="#c5a059" fontSize="9" fontFamily="monospace">
                  External Shoulder Rotation: Thumbs Up
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 9. SIDE PLANK LATERAL PILLAR ==================== */
      case 'side_plank': {
        const pulse = Math.sin(phaseAngle) * 3;
        const elbowX = 140;
        const elbowY = 150;
        const shoulderX = 140;
        const shoulderY = 110 + pulse;
        const hipX = 85;
        const hipY = 125 + pulse;
        const feetX = 30;
        const feetY = 150;

        return (
          <g>
            {/* Floor Mat Line */}
            <line x1="20" y1="150" x2="180" y2="150" stroke="#333" strokeWidth="3" />

            {/* Oblique Lateral Sling Glow */}
            {showMuscles && (
              <line
                x1={shoulderX}
                y1={shoulderY}
                x2={feetX}
                y2={feetY}
                stroke="#34d399"
                strokeWidth="10"
                strokeOpacity={0.35}
                strokeLinecap="round"
              />
            )}

            {/* Rigid Diagonal Pillar Line */}
            <line x1={shoulderX} y1={shoulderY} x2={feetX} y2={feetY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />

            {/* Head */}
            <circle cx="158" cy={shoulderY - 5} r="10" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {/* Vertical Forearm Support Column */}
            <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} stroke="#c5a059" strokeWidth="3.5" strokeLinecap="round" />

            {/* Top Arm Extended Straight Up */}
            <line x1={shoulderX} y1={shoulderY} x2={shoulderX} y2={shoulderY - 40} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={shoulderX} cy={shoulderY - 40} r="3" fill="#38bdf8" />

            {showAngles && (
              <g>
                <text x="35" y="80" fill="#34d399" fontSize="9" fontFamily="monospace">
                  Lateral Oblique Sling: 180° Rigid Vector
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 10. CAT-COW VERTEBRAL WAVE ==================== */
      case 'cat_cow': {
        const spineCurv = (motionT - 0.5) * 40; // Negative = Cow (extension), Positive = Cat (flexion)
        const shoulderX = 135;
        const shoulderY = 115;
        const hipX = 65;
        const hipY = 115;
        const midY = 115 - spineCurv;

        return (
          <g>
            {/* Floor Mat Line */}
            <line x1="20" y1="160" x2="180" y2="160" stroke="#333" strokeWidth="3" />

            {/* Spinal Fluid / Synovial Wave Glow */}
            {showMuscles && (
              <path
                d={`M ${hipX} ${hipY} Q 100 ${midY} ${shoulderX} ${shoulderY}`}
                fill="none"
                stroke="#c5a059"
                strokeWidth="12"
                strokeOpacity="0.3"
                strokeLinecap="round"
              />
            )}

            {/* Dynamic Vertebral Curve */}
            <path
              d={`M ${hipX} ${hipY} Q 100 ${midY} ${shoulderX} ${shoulderY}`}
              fill="none"
              stroke="#f5f5f5"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Head (Tilts up in Cow, drops down in Cat) */}
            <circle
              cx={shoulderX + 14}
              cy={shoulderY + (spineCurv > 0 ? 12 : -12)}
              r="10"
              fill="#181818"
              stroke="#c5a059"
              strokeWidth="2.5"
            />

            {/* Arms Under Shoulders */}
            <line x1={shoulderX} y1={shoulderY} x2={shoulderX} y2="160" stroke="#888" strokeWidth="3.5" />

            {/* Thighs Under Hips */}
            <line x1={hipX} y1={hipY} x2={hipX} y2="160" stroke="#888" strokeWidth="3.5" />

            {showAngles && (
              <g>
                <text x="40" y="60" fill="#c5a059" fontSize="9" fontFamily="monospace">
                  {spineCurv > 0 ? 'Cat Flexion: Exhale & Dome Upper Back' : 'Cow Extension: Inhale & Drop Belly'}
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 11. SQUAT ==================== */
      case 'squat': {
        const headY = 40 + motionT * 42;
        const shoulderY = 60 + motionT * 42;
        const shoulderX = 100 - motionT * 8;
        const hipX = 100 - motionT * 26;
        const hipY = 105 + motionT * 40;
        const kneeX = 85 + motionT * 6;
        const kneeY = 145 + motionT * 8;
        const ankleX = 85;
        const ankleY = 185;
        const kneeAngle = Math.round(170 - motionT * 85);

        return (
          <g>
            <line x1="85" y1="20" x2="85" y2="195" stroke="#c5a059" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
            {showMuscles && (
              <>
                <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="#34d399" strokeWidth={8 + motionT * 6} strokeOpacity={0.25 + motionT * 0.4} strokeLinecap="round" />
                <circle cx={hipX} cy={hipY} r={12 + motionT * 4} fill="#c5a059" fillOpacity={0.2 + motionT * 0.4} />
              </>
            )}
            <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
            <circle cx={shoulderX + 4} cy={headY} r="12" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />
            <line x1={shoulderX} y1={shoulderY} x2={shoulderX + 30 + motionT * 10} y2={shoulderY - 5 + motionT * 5} stroke="#888" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
            <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            <line x1={ankleX - 6} y1={ankleY} x2={ankleX + 22} y2={ankleY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
            <circle cx={shoulderX} cy={shoulderY} r="4" fill="#c5a059" />
            <circle cx={hipX} cy={hipY} r="4.5" fill="#34d399" />
            <circle cx={kneeX} cy={kneeY} r="4.5" fill="#34d399" />
            <circle cx={ankleX} cy={ankleY} r="3.5" fill="#c5a059" />
            {showAngles && (
              <g>
                <circle cx={kneeX} cy={kneeY} r="16" fill="none" stroke="#c5a059" strokeWidth="1.5" strokeDasharray="3 2" />
                <text x={kneeX + 18} y={kneeY + 4} fill="#c5a059" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  {kneeAngle}°
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 12. PUSHUP ==================== */
      case 'pushup': {
        const chestDip = motionT * 32;
        const headX = 160;
        const headY = 95 + chestDip;
        const shoulderX = 145;
        const shoulderY = 105 + chestDip;
        const hipX = 90;
        const hipY = 120 + chestDip * 0.7;
        const ankleX = 40;
        const ankleY = 135;
        const handX = 145;
        const handY = 145;
        const elbowX = 130 - motionT * 12;
        const elbowY = 122 + chestDip;
        const elbowAngle = Math.round(170 - motionT * 80);

        return (
          <g>
            <line x1="20" y1="145" x2="190" y2="145" stroke="#333" strokeWidth="3" />
            {showMuscles && (
              <>
                <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#38bdf8" strokeWidth={6 + motionT * 4} strokeOpacity={0.3} />
                <circle cx={shoulderX} cy={shoulderY} r={10 + motionT * 4} fill="#c5a059" fillOpacity={0.3} />
              </>
            )}
            <line x1={shoulderX} y1={shoulderY} x2={ankleX} y2={ankleY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
            <circle cx={headX} cy={headY} r="10" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />
            <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            <line x1={elbowX} y1={elbowY} x2={handX} y2={handY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            <line x1={handX - 5} y1={handY} x2={handX + 10} y2={handY} stroke="#f5f5f5" strokeWidth="3" />
            <circle cx={shoulderX} cy={shoulderY} r="4" fill="#c5a059" />
            <circle cx={elbowX} cy={elbowY} r="4" fill="#34d399" />
            {showAngles && (
              <g>
                <circle cx={elbowX} cy={elbowY} r="14" fill="none" stroke="#c5a059" strokeWidth="1.5" strokeDasharray="3 2" />
                <text x={elbowX - 25} y={elbowY - 5} fill="#c5a059" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  {elbowAngle}°
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 13. PLANK ==================== */
      case 'plank': {
        const pulse = Math.sin(animationPhase * Math.PI * 4) * 2;
        const headX = 160;
        const headY = 95 + pulse;
        const shoulderX = 140;
        const shoulderY = 105 + pulse;
        const hipX = 85;
        const hipY = 110 + pulse;
        const ankleX = 35;
        const ankleY = 135;
        const elbowX = 140;
        const elbowY = 145;

        return (
          <g>
            <line x1="20" y1="145" x2="190" y2="145" stroke="#333" strokeWidth="3" />
            {showMuscles && (
              <path
                d={`M ${shoulderX} ${shoulderY} Q ${hipX} ${hipY + 8} ${ankleX} ${ankleY}`}
                fill="none"
                stroke="#34d399"
                strokeWidth="12"
                strokeOpacity={0.35 + Math.abs(pulse) * 0.1}
                strokeLinecap="round"
              />
            )}
            <line x1={shoulderX} y1={shoulderY} x2={ankleX} y2={ankleY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
            <circle cx={headX} cy={headY} r="10" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />
            <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} stroke="#c5a059" strokeWidth="3.5" strokeLinecap="round" />
            <line x1={elbowX} y1={elbowY} x2={elbowX + 25} y2={elbowY} stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
            {showAngles && (
              <g>
                <text x="80" y="85" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Spine: 180° Neutral
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 14. JUMPING JACKS ==================== */
      case 'jumping_jack': {
        const armAngle = motionT * 140;
        const legSpread = motionT * 35;
        const jumpHop = motionT * 12;

        const headY = 42 - jumpHop;
        const shoulderY = 62 - jumpHop;
        const hipY = 105 - jumpHop;

        const lHandX = 100 - 15 - Math.sin((armAngle * Math.PI) / 180) * 45;
        const lHandY = shoulderY + Math.cos((armAngle * Math.PI) / 180) * 45;
        const rHandX = 100 + 15 + Math.sin((armAngle * Math.PI) / 180) * 45;
        const rHandY = shoulderY + Math.cos((armAngle * Math.PI) / 180) * 45;

        const lFootX = 90 - legSpread;
        const rFootX = 110 + legSpread;
        const footY = 185;

        return (
          <g>
            <line x1="40" y1="185" x2="160" y2="185" stroke="#333" strokeWidth="3" />
            {showMuscles && (
              <circle cx="100" cy={shoulderY} r="18" fill="#c5a059" fillOpacity={0.25 + motionT * 0.3} />
            )}
            <line x1="100" y1={shoulderY} x2="100" y2={hipY} stroke="#f5f5f5" strokeWidth="4" />
            <circle cx="100" cy={headY} r="12" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />
            <line x1="90" y1={shoulderY} x2={lHandX} y2={lHandY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="110" y1={shoulderY} x2={rHandX} y2={rHandY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="95" y1={hipY} x2={lFootX} y2={footY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="105" y1={hipY} x2={rFootX} y2={footY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
      }

      /* ==================== 15. LUNGE ==================== */
      case 'lunge': {
        const dip = motionT * 36;
        const headY = 42 + dip;
        const shoulderY = 62 + dip;
        const hipX = 90;
        const hipY = 105 + dip;
        const frontKneeX = 135;
        const frontKneeY = 145 + dip * 0.2;
        const frontAnkleX = 135;
        const frontAnkleY = 185;
        const backKneeX = 55;
        const backKneeY = 150 + dip * 0.95;
        const backAnkleX = 35;
        const backAnkleY = 175;

        return (
          <g>
            <line x1="20" y1="185" x2="180" y2="185" stroke="#333" strokeWidth="3" />
            {showMuscles && (
              <line x1={hipX} y1={hipY} x2={frontKneeX} y2={frontKneeY} stroke="#34d399" strokeWidth={8} strokeOpacity={0.35} />
            )}
            <line x1={hipX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
            <circle cx={hipX} cy={headY} r="12" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />
            <line x1={hipX} y1={hipY} x2={frontKneeX} y2={frontKneeY} stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
            <line x1={frontKneeX} y1={frontKneeY} x2={frontAnkleX} y2={frontAnkleY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            <line x1={hipX} y1={hipY} x2={backKneeX} y2={backKneeY} stroke="#c5a059" strokeWidth="3.5" strokeLinecap="round" />
            <line x1={backKneeX} y1={backKneeY} x2={backAnkleX} y2={backAnkleY} stroke="#c5a059" strokeWidth="3" strokeLinecap="round" />
            {showAngles && (
              <g>
                <text x={frontKneeX + 16} y={frontKneeY + 4} fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  90°
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 16. GLUTE BRIDGE ==================== */
      case 'glute_bridge': {
        const bridgeLift = motionT * 35;
        const shoulderX = 45;
        const shoulderY = 145;
        const hipX = 100;
        const hipY = 145 - bridgeLift;
        const kneeX = 145;
        const kneeY = 120 - bridgeLift * 0.3;
        const ankleX = 145;
        const ankleY = 150;

        return (
          <g>
            <line x1="20" y1="150" x2="180" y2="150" stroke="#333" strokeWidth="3" />
            {showMuscles && (
              <circle cx={hipX} cy={hipY} r={14 + motionT * 6} fill="#c5a059" fillOpacity={0.4} />
            )}
            <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
            <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
            <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={shoulderX - 15} cy={shoulderY - 5} r="10" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />
            {showAngles && (
              <g>
                <text x="60" y="80" fill="#c5a059" fontSize="9" fontFamily="monospace">
                  Posterior Glute Lockout
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 17. DESK STRETCH ==================== */
      case 'desk_stretch': {
        const retract = motionT * 18;
        const chinTuck = motionT * 8;
        const headX = 100 - chinTuck;
        const headY = 48;
        const shoulderX = 100;
        const shoulderY = 72;
        const elbowLX = 72 - retract;
        const elbowRX = 128 + retract;
        const elbowY = 95 + retract * 0.3;
        const handLX = 65 - retract;
        const handRX = 135 + retract;
        const handY = 65;

        return (
          <g>
            {showMuscles && (
              <circle cx="100" cy="80" r={16 + retract} fill="#38bdf8" fillOpacity={0.3} />
            )}
            <line x1="100" y1={shoulderY} x2="100" y2={150} stroke="#f5f5f5" strokeWidth="4" />
            <circle cx={headX} cy={headY} r="12" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />
            <line x1="90" y1={shoulderY} x2={elbowLX} y2={elbowY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <line x1={elbowLX} y1={elbowY} x2={handLX} y2={handY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="110" y1={shoulderY} x2={elbowRX} y2={elbowY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <line x1={elbowRX} y1={elbowY} x2={handRX} y2={handY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            {showAngles && (
              <g>
                <text x="50" y="32" fill="#c5a059" fontSize="9" fontFamily="monospace">
                  Chin Tuck & Scapular Retract
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 18. SHADOW BOXING & 1-2 COMBINATIONS ==================== */
      case 'shadow_boxing': {
        const punchPhase = Math.sin(phaseAngle);
        const isLeadPunch = punchPhase > 0;
        const punchExtension = Math.abs(punchPhase) * 55;
        const bob = Math.abs(Math.cos(phaseAngle * 2)) * 6;

        const headX = 85 + (isLeadPunch ? 6 : -4);
        const headY = 48 + bob;
        const torsoX1 = 85;
        const torsoY1 = 66 + bob;
        const torsoX2 = 80;
        const torsoY2 = 115 + bob;

        // Front lead arm punch
        const leadHandX = 105 + (isLeadPunch ? punchExtension : 0);
        const leadHandY = 65 + (isLeadPunch ? 0 : 10) + bob;
        const leadElbowX = 95 + (isLeadPunch ? punchExtension * 0.5 : 0);
        const leadElbowY = 85 + bob;

        // Rear guard arm punch
        const rearHandX = 75 + (!isLeadPunch ? punchExtension * 0.9 : 0);
        const rearHandY = 62 + (!isLeadPunch ? 0 : 5) + bob;

        return (
          <g>
            {/* Ground ring marker */}
            <ellipse cx="90" cy="182" rx="55" ry="10" fill="none" stroke="#222" strokeDasharray="3,3" />

            {/* Torso & Core Torque Glow */}
            {showMuscles && (
              <circle cx="85" cy="85" r="20" fill="#f59e0b" fillOpacity="0.25" />
            )}

            {/* Legs & Stance */}
            <line x1={torsoX2} y1={torsoY2} x2="115" y2={150 + bob * 0.5} stroke="#34d399" strokeWidth="3.5" />
            <line x1="115" y1={150 + bob * 0.5} x2="125" y2="182" stroke="#34d399" strokeWidth="3.5" />
            <line x1={torsoX2} y1={torsoY2} x2="55" y2={148 + bob * 0.5} stroke="#555" strokeWidth="3.5" />
            <line x1="55" y1={148 + bob * 0.5} x2="50" y2="180" stroke="#555" strokeWidth="3.5" />

            {/* Torso & Head */}
            <line x1={torsoX1} y1={torsoY1} x2={torsoX2} y2={torsoY2} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
            <circle cx={headX} cy={headY} r="12" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {/* Lead & Rear Arm Striking */}
            <line x1={torsoX1} y1={torsoY1} x2={leadElbowX} y2={leadElbowY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <line x1={leadElbowX} y1={leadElbowY} x2={leadHandX} y2={leadHandY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={leadHandX} cy={leadHandY} r="6" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />

            <line x1={torsoX1 - 10} y1={torsoY1 + 5} x2={rearHandX} y2={rearHandY} stroke="#c5a059" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={rearHandX} cy={rearHandY} r="5.5" fill="#ef4444" />

            {/* Telemetry */}
            {showAngles && (
              <g>
                <text x="35" y="28" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  Snap 1-2 Combo / 45° Guard Stack
                </text>
                <text x="45" y="196" fill="#34d399" fontSize="8" fontFamily="monospace">
                  Rear Foot Ball Pivot: Core Kinetic Drive
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 19. BURPEE / GROUND SPRAWL ==================== */
      case 'burpee': {
        const cycle = animationPhase; // 0 to 1
        let headY = 40, hipY = 100, spineX = 100, kneeY = 145, footY = 182;
        let isFloorSprawl = false;

        if (cycle < 0.25) {
          // Standing & dropping down
          const t = cycle / 0.25;
          headY = 40 + t * 60;
          hipY = 100 + t * 45;
        } else if (cycle < 0.65) {
          // Horizontal Plank Sprawl / Pushup
          isFloorSprawl = true;
          const t = (cycle - 0.25) / 0.4;
          const pushDepth = Math.sin(t * Math.PI) * 12;
          headY = 120 + pushDepth;
          hipY = 130 + pushDepth;
        } else if (cycle < 0.85) {
          // Tucking feet in
          const t = (cycle - 0.65) / 0.2;
          headY = 100 - t * 60;
          hipY = 145 - t * 45;
        } else {
          // Jump & Overhead Reach
          const t = (cycle - 0.85) / 0.15;
          const jumpH = Math.sin(t * Math.PI) * 25;
          headY = 40 - jumpH;
          hipY = 100 - jumpH;
          footY = 182 - jumpH;
        }

        return (
          <g>
            <line x1="20" y1="182" x2="180" y2="182" stroke="#333" strokeWidth="3" />
            {showMuscles && (
              <circle cx={isFloorSprawl ? "100" : "100"} cy={isFloorSprawl ? "130" : "110"} r="22" fill="#ef4444" fillOpacity="0.25" />
            )}

            {isFloorSprawl ? (
              <g>
                <line x1="140" y1={headY + 10} x2="70" y2={hipY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
                <circle cx="150" cy={headY} r="10" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />
                <line x1="135" y1={headY + 15} x2="135" y2="182" stroke="#38bdf8" strokeWidth="3.5" />
                <line x1="70" y1={hipY} x2="35" y2="182" stroke="#34d399" strokeWidth="3.5" />
              </g>
            ) : (
              <g>
                <line x1={spineX} y1={headY + 15} x2={spineX} y2={hipY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
                <circle cx={spineX} cy={headY} r="11" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />
                <line x1={spineX} y1={hipY} x2="80" y2={kneeY} stroke="#34d399" strokeWidth="3.5" />
                <line x1="80" y1={kneeY} x2="80" y2={footY} stroke="#34d399" strokeWidth="3.5" />
                <line x1={spineX} y1={hipY} x2="120" y2={kneeY} stroke="#34d399" strokeWidth="3.5" />
                <line x1="120" y1={kneeY} x2="120" y2={footY} stroke="#34d399" strokeWidth="3.5" />
              </g>
            )}

            {showAngles && (
              <g>
                <text x="35" y="26" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  Full Ground Sprawl & Vertical Spring
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 20. BULGARIAN SPLIT SQUAT ==================== */
      case 'bulgarian_split_squat': {
        const squatDepth = motionT * 38;
        const hipX = 105;
        const hipY = 98 + squatDepth;
        const shoulderY = 58 + squatDepth;
        const headY = 40 + squatDepth;

        // Front active working leg
        const fKneeX = 135 - motionT * 4;
        const fKneeY = 136 + squatDepth * 0.65;
        const fAnkleX = 135;
        const fAnkleY = 180;

        // Rear elevated foot on bench (box at x=45, y=140)
        const benchX = 42;
        const benchY = 140;
        const rKneeX = 75;
        const rKneeY = 140 + squatDepth * 0.8;

        return (
          <g>
            {/* Ground & Elevation Bench */}
            <line x1="20" y1="180" x2="180" y2="180" stroke="#333" strokeWidth="3" />
            <rect x="25" y="140" width="35" height="40" fill="#141414" stroke="#c5a059" strokeWidth="1.5" rx="2" />
            <text x="30" y="162" fill="#777" fontSize="7" fontFamily="monospace">BENCH</text>

            {/* Glute & Quad Peak Activation */}
            {showMuscles && (
              <circle cx="118" cy={hipY + 15} r={14 + motionT * 6} fill="#34d399" fillOpacity="0.3" />
            )}

            {/* Rear Leg (Elevated) */}
            <line x1={hipX} y1={hipY} x2={rKneeX} y2={rKneeY} stroke="#555" strokeWidth="3.5" strokeLinecap="round" />
            <line x1={rKneeX} y1={rKneeY} x2={benchX + 15} y2={benchY} stroke="#555" strokeWidth="3.5" strokeLinecap="round" />

            {/* Front Leg (Primary Driver) */}
            <line x1={hipX} y1={hipY} x2={fKneeX} y2={fKneeY} stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
            <line x1={fKneeX} y1={fKneeY} x2={fAnkleX} y2={fAnkleY} stroke="#34d399" strokeWidth="4" strokeLinecap="round" />

            {/* Torso & Head */}
            <line x1={hipX} y1={hipY} x2={hipX} y2={shoulderY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
            <circle cx={hipX} cy={headY} r="12" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {/* Telemetry */}
            {showAngles && (
              <g>
                <text x="40" y="28" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  90° Front Knee Angle / Vertical Shin
                </text>
                <text x="75" y={rKneeY + 12} fill="#c5a059" fontSize="8" fontFamily="monospace">
                  Rear Knee 1" Floor Hover
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 21. GYMNASTICS HOLLOW BODY ROCK ==================== */
      case 'hollow_body': {
        const rockAngle = Math.sin(phaseAngle) * 16; // gentle rock in degrees
        const rockRad = (rockAngle * Math.PI) / 180;

        const centerX = 100;
        const centerY = 145;

        // Banana curved shape coordinates rotated by rockRad
        const headX = centerX - Math.cos(rockRad) * 45 - Math.sin(rockRad) * 20;
        const headY = centerY - Math.sin(rockRad) * 45 + Math.cos(rockRad) * 20 - 25;

        const feetX = centerX + Math.cos(rockRad) * 55 - Math.sin(rockRad) * 15;
        const feetY = centerY + Math.sin(rockRad) * 55 + Math.cos(rockRad) * 15 - 20;

        return (
          <g>
            {/* Mat floor */}
            <line x1="20" y1="165" x2="180" y2="165" stroke="#333" strokeWidth="3" />

            {/* Core Anti-Extension Shield Glow */}
            {showMuscles && (
              <circle cx="100" cy="140" r="20" fill="#38bdf8" fillOpacity="0.35" />
            )}

            {/* Curved Banana Body */}
            <path
              d={`M ${headX} ${headY} Q ${centerX} ${centerY} ${feetX} ${feetY}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Head & Arms Extended */}
            <circle cx={headX} cy={headY} r="10" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />
            <line
              x1={headX}
              y1={headY}
              x2={headX - 15}
              y2={headY - 12}
              stroke="#c5a059"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Feet Glued Pointed */}
            <circle cx={feetX} cy={feetY} r="4" fill="#34d399" />

            {showAngles && (
              <g>
                <text x="35" y="32" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  0° Lumbar Gap / 100% Core Compression
                </text>
                <text x="45" y="185" fill="#777" fontSize="8" fontFamily="monospace">
                  Smooth Vertebral Rock on Glued Sacrum
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 22. COSSACK LATERAL SQUAT ==================== */
      case 'cossack_squat': {
        const lateralPhase = Math.sin(phaseAngle);
        const squatDepth = Math.abs(lateralPhase) * 35;
        const isRightSquat = lateralPhase >= 0;

        const hipX = 100 + (isRightSquat ? 25 : -25);
        const hipY = 110 + squatDepth;
        const headY = 60 + squatDepth * 0.8;

        // Squatting leg
        const sqKneeX = isRightSquat ? 135 : 65;
        const sqKneeY = 145 + squatDepth * 0.4;
        const sqFootX = isRightSquat ? 145 : 55;

        // Straight extended leg
        const strFootX = isRightSquat ? 45 : 155;
        const strFootY = 175;

        return (
          <g>
            <line x1="20" y1="180" x2="180" y2="180" stroke="#333" strokeWidth="3" />

            {showMuscles && (
              <circle cx={hipX} cy={hipY + 10} r="18" fill="#f59e0b" fillOpacity="0.25" />
            )}

            {/* Torso & Head */}
            <line x1={hipX} y1={hipY} x2={hipX} y2={headY + 12} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
            <circle cx={hipX} cy={headY} r="11" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {/* Squatting Side */}
            <line x1={hipX} y1={hipY} x2={sqKneeX} y2={sqKneeY} stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
            <line x1={sqKneeX} y1={sqKneeY} x2={sqFootX} y2="180" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />

            {/* Straight Trailing Leg */}
            <line x1={hipX} y1={hipY} x2={strFootX} y2={strFootY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={strFootX} cy={strFootY} r="4" fill="#38bdf8" />

            {showAngles && (
              <g>
                <text x="35" y="28" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  Frontal Plane Adductor & Ankle Stretch
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 23. CALF & ACHILLES SPRING RAISE ==================== */
      case 'calf_raise': {
        const rise = motionT * 26;
        const headY = 48 - rise;
        const shoulderY = 68 - rise;
        const hipY = 110 - rise;
        const kneeY = 145 - rise;
        const ankleY = 175 - rise;
        const toeY = 180;

        return (
          <g>
            <line x1="40" y1="180" x2="160" y2="180" stroke="#333" strokeWidth="3" />

            {/* Calf Activation Glow */}
            {showMuscles && (
              <ellipse cx="100" cy={160 - rise * 0.7} rx="16" ry="12" fill="#34d399" fillOpacity={0.3 + motionT * 0.4} />
            )}

            {/* Body Posture */}
            <line x1="100" y1={shoulderY} x2="100" y2={hipY} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy={headY} r="12" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {/* Arms at sides */}
            <line x1="90" y1={shoulderY} x2="85" y2={hipY} stroke="#777" strokeWidth="3" />
            <line x1="110" y1={shoulderY} x2="115" y2={hipY} stroke="#777" strokeWidth="3" />

            {/* Legs & High Metatarsal Raise */}
            <line x1="100" y1={hipY} x2="94" y2={kneeY} stroke="#34d399" strokeWidth="3.5" />
            <line x1="94" y1={kneeY} x2="94" y2={ankleY} stroke="#34d399" strokeWidth="3.5" />
            <line x1="94" y1={ankleY} x2="98" y2={toeY} stroke="#34d399" strokeWidth="4" strokeLinecap="round" />

            <line x1="100" y1={hipY} x2="106" y2={kneeY} stroke="#34d399" strokeWidth="3.5" />
            <line x1="106" y1={kneeY} x2="106" y2={ankleY} stroke="#34d399" strokeWidth="3.5" />
            <line x1="106" y1={ankleY} x2="102" y2={toeY} stroke="#34d399" strokeWidth="4" strokeLinecap="round" />

            {showAngles && (
              <g>
                <text x="35" y="28" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  Triple Extension / Gastrocnemius Peak
                </text>
                <text x="45" y="195" fill="#c5a059" fontSize="8" fontFamily="monospace">
                  Hold 2s on Metatarsals / Zero Ankle Sickling
                </text>
              </g>
            )}
          </g>
        );
      }

      /* ==================== 24. 90/90 HIP CAPSULE MOBILITY FLOW ==================== */
      case 'hip_90_90': {
        const hinge = motionT * 18;
        const hipX = 100;
        const hipY = 145;
        const headX = 100 + hinge * 0.8;
        const headY = 85 + hinge * 0.7;

        return (
          <g>
            {/* Mat */}
            <line x1="20" y1="160" x2="180" y2="160" stroke="#333" strokeWidth="3" />

            {showMuscles && (
              <circle cx="100" cy="140" r="22" fill="#38bdf8" fillOpacity="0.3" />
            )}

            {/* Front 90-degree Leg (Lead Shin) */}
            <line x1={hipX} y1={hipY} x2="135" y2="145" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
            <line x1="135" y1="145" x2="135" y2="160" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />

            {/* Rear 90-degree Leg (Trail Shin) */}
            <line x1={hipX} y1={hipY} x2="65" y2="148" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="65" y1="148" x2="65" y2="160" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />

            {/* Torso Hinged with Flat Back */}
            <line x1={hipX} y1={hipY} x2={headX - 10} y2={headY + 12} stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
            <circle cx={headX} cy={headY} r="12" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />

            {showAngles && (
              <g>
                <text x="35" y="32" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  90° Internal & External Hip Capsule
                </text>
                <text x="45" y="180" fill="#777" fontSize="8" fontFamily="monospace">
                  Neutral Lumbar Spine Hinge Over Lead Shin
                </text>
              </g>
            )}
          </g>
        );
      }

      default: {
        return (
          <g>
            <circle cx="100" cy={50 + motionT * 20} r="14" fill="#181818" stroke="#c5a059" strokeWidth="2.5" />
            <line x1="100" y1={64 + motionT * 20} x2="100" y2={120 + motionT * 30} stroke="#f5f5f5" strokeWidth="4" />
            <line x1="100" y1={120 + motionT * 30} x2="70" y2="180" stroke="#34d399" strokeWidth="3.5" />
            <line x1="100" y1={120 + motionT * 30} x2="130" y2="180" stroke="#34d399" strokeWidth="3.5" />
          </g>
        );
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-gradient-to-b from-[#0a0a0a] via-[#060606] to-[#030303] rounded-sm border border-[#222] overflow-hidden p-3 sm:p-4 space-y-2.5 shadow-2xl">
      {/* Top Simulator Status Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#181818]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-[#c5a059]/10 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-serif text-white flex items-center gap-1.5">
              <span>{exercise.name} Simulator</span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-xs bg-[#1a1a1a] text-emerald-400 border border-[#333]">
                Kinetic 2D HUD
              </span>
            </div>
          </div>
        </div>

        {/* Layer Filters & Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowMuscles(!showMuscles)}
            className={`px-2 py-1 text-[10px] font-mono rounded-xs border transition-all ${
              showMuscles
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-[#111] border-[#222] text-[#666]'
            }`}
            title="Toggle Muscle Activation Heatmap"
          >
            Muscles
          </button>
          <button
            onClick={() => setShowAngles(!showAngles)}
            className={`px-2 py-1 text-[10px] font-mono rounded-xs border transition-all ${
              showAngles
                ? 'bg-[#c5a059]/20 border-[#c5a059]/60 text-[#c5a059]'
                : 'bg-[#111] border-[#222] text-[#666]'
            }`}
            title="Toggle Joint Angle Telemetry"
          >
            Angles
          </button>
        </div>
      </div>

      {/* Primary Simulator Screen (SVG Biomechanical Skeleton) */}
      <div className="relative w-full flex-1 min-h-[190px] aspect-[16/10] bg-[#020202] rounded-sm border border-[#1c1c1c] overflow-hidden flex items-center justify-center shadow-inner">
        {/* Isometric Grid Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#c5a059 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Live SVG Kinetic Model */}
        <svg className="w-full h-full max-w-[280px] max-h-[230px] relative z-10" viewBox="0 0 200 200">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
          </defs>
          {renderBiomechanicalSkeleton()}
        </svg>

        {/* Top Floating Phase Badge */}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-sm bg-black/80 border border-[#333] backdrop-blur-sm text-[10px] font-mono text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
          <span>{currentMovementPhase}</span>
        </div>

        {/* Cadence Indicator Top Right */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-sm bg-black/80 border border-[#333] text-[9px] font-mono text-[#c5a059]">
          Tempo: {exercise.cadence.down}s - {exercise.cadence.hold}s - {exercise.cadence.up}s
        </div>

        {/* Biomechanical Target Angle Bottom Left */}
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-sm bg-black/85 border border-[#262626] text-[10px] font-mono text-[#aaa]">
          Target: <strong className="text-white">{exercise.biomechanicsAngle}</strong>
        </div>

        {/* Repetition Cycle Progress Dial Bottom Right */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-sm bg-black/85 border border-[#262626] text-[10px] font-mono text-[#c5a059]">
          Cycle: {Math.round(animationPhase * 100)}%
        </div>
      </div>

      {/* Video Scrubber & Playback Controls */}
      <div className="space-y-2 pt-1">
        {/* Timeline Scrub Bar */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={animationPhase}
            onChange={(e) => {
              setIsPlaying(false);
              progressRef.current = parseFloat(e.target.value);
              setAnimationPhase(parseFloat(e.target.value));
            }}
            className="flex-1 h-1.5 bg-[#1f1f1f] rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
          />
        </div>

        {/* Control Button Strip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-sm bg-[#161616] border border-[#2a2a2a] hover:border-[#c5a059] text-white hover:text-[#c5a059] transition-all"
              title={isPlaying ? 'Pause Simulator' : 'Play Simulator'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                progressRef.current = 0;
                setAnimationPhase(0);
              }}
              className="p-2 rounded-sm bg-[#161616] border border-[#2a2a2a] hover:border-[#444] text-[#888] hover:text-white transition-all"
              title="Restart Cycle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Buttons */}
          <div className="flex items-center gap-1 bg-[#111] p-0.5 rounded-sm border border-[#222]">
            {[0.5, 1, 1.5].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded-xs transition-all ${
                  playbackSpeed === spd
                    ? 'bg-[#c5a059] text-black font-bold'
                    : 'text-[#777] hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Step Jumping Quick Pills */}
          <div className="flex items-center gap-1">
            {exercise.steps.map((st, sIdx) => (
              <button
                key={sIdx}
                onClick={() => {
                  if (onStepChange) onStepChange(sIdx);
                  progressRef.current = sIdx / exercise.steps.length;
                  setAnimationPhase(progressRef.current);
                }}
                className={`px-2 py-1 text-[9px] font-mono rounded-xs transition-all ${
                  activeStepIdx === sIdx
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-[#141414] border border-[#222] text-[#888] hover:text-white'
                }`}
              >
                P{sIdx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
