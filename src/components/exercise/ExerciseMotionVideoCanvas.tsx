import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Compass,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Flame,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { ExerciseGuide, CATEGORY_DEFINITIONS } from '../../data/exerciseCatalogData';

interface ExerciseMotionVideoCanvasProps {
  exercise: ExerciseGuide;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  showAngles?: boolean;
  showGrid?: boolean;
}

export const ExerciseMotionVideoCanvas: React.FC<ExerciseMotionVideoCanvasProps> = ({
  exercise,
  isPlaying: externalIsPlaying = true,
  onTogglePlay,
  showAngles: initialShowAngles = true,
  showGrid: initialShowGrid = true,
}) => {
  const [internalPlaying, setInternalPlaying] = useState<boolean>(externalIsPlaying);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showAngles, setShowAngles] = useState<boolean>(initialShowAngles);
  const [showGrid, setShowGrid] = useState<boolean>(initialShowGrid);
  const [showMuscles, setShowMuscles] = useState<boolean>(true);
  const [scrubberTime, setScrubberTime] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<string>('Rep Cycle');
  const [liveAngle, setLiveAngle] = useState<number>(90);
  const [repCount, setRepCount] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrubberRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const elapsedRef = useRef<number>(0);
  const prevCyclePhaseRef = useRef<number>(0);

  const isPlaying = onTogglePlay ? externalIsPlaying : internalPlaying;
  const togglePlay = () => {
    if (onTogglePlay) {
      onTogglePlay();
    } else {
      setInternalPlaying(!internalPlaying);
    }
  };

  const categoryDef = CATEGORY_DEFINITIONS[exercise.category] || CATEGORY_DEFINITIONS.general_health;

  // Seeking logic
  const handleSeek = (clientX: number) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetSeconds = ratio * 4.0;
    elapsedRef.current = targetSeconds;
    setScrubberTime(targetSeconds);
  };

  const handleMouseDownScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleSeek(e.clientX);
  };

  useEffect(() => {
    const handleMouseMoveWindow = (e: MouseEvent) => {
      if (isScrubbing) {
        handleSeek(e.clientX);
      }
    };
    const handleMouseUpWindow = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
      }
    };

    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMoveWindow);
      window.addEventListener('mouseup', handleMouseUpWindow);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveWindow);
      window.removeEventListener('mouseup', handleMouseUpWindow);
    };
  }, [isScrubbing]);

  // Reset counters when switching exercise
  useEffect(() => {
    elapsedRef.current = 0;
    setRepCount(0);
    setScrubberTime(0);
  }, [exercise.id]);

  // Animation render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = (time: number) => {
      if (!running) return;

      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying) {
        elapsedRef.current += delta * playbackSpeed;
        setScrubberTime(elapsedRef.current % 4);
      }

      const t = elapsedRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas with sleek dark studio gradient
      ctx.clearRect(0, 0, width, height);

      // Background gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2 - 20, 40, width / 2, height / 2, width * 0.7);
      bgGrad.addColorStop(0, '#151522');
      bgGrad.addColorStop(0.6, '#0d0d14');
      bgGrad.addColorStop(1, '#07070b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Sub-grid lines if enabled
      if (showGrid) {
        ctx.strokeStyle = '#1a1a28';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Floor ground plane reference
        const floorY = height * 0.86;
        const floorGrad = ctx.createLinearGradient(0, floorY, width, floorY);
        floorGrad.addColorStop(0, 'rgba(197, 160, 89, 0.05)');
        floorGrad.addColorStop(0.5, 'rgba(197, 160, 89, 0.5)');
        floorGrad.addColorStop(1, 'rgba(197, 160, 89, 0.05)');
        ctx.strokeStyle = floorGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.08, floorY);
        ctx.lineTo(width * 0.92, floorY);
        ctx.stroke();
      }

      // Biomechanical Kinetic Math Cadence
      const cycleTime = 2.8; // 2.8s cadence
      const normalizedCycle = (t % cycleTime) / cycleTime; // 0 to 1
      const phaseSine = Math.sin(normalizedCycle * Math.PI * 2);
      const wave01 = (phaseSine + 1) / 2; // 0 to 1

      // Track rep count increments on cycle loop
      if (normalizedCycle < prevCyclePhaseRef.current && isPlaying) {
        setRepCount((prev) => prev + 1);
      }
      prevCyclePhaseRef.current = normalizedCycle;

      // Model anchor origin
      const centerX = width / 2;
      const centerY = height * 0.48;
      const scale = Math.min(width, height) / 420;

      // Default Neutral Kinetic Skeleton Joint Coordinates
      let head = { x: centerX, y: centerY - 140 * scale };
      let neck = { x: centerX, y: centerY - 100 * scale };
      let chest = { x: centerX, y: centerY - 50 * scale };
      let pelvis = { x: centerX, y: centerY + 10 * scale };
      let lShoulder = { x: centerX - 35 * scale, y: centerY - 80 * scale };
      let rShoulder = { x: centerX + 35 * scale, y: centerY - 80 * scale };
      let lElbow = { x: centerX - 55 * scale, y: centerY - 20 * scale };
      let rElbow = { x: centerX + 55 * scale, y: centerY - 20 * scale };
      let lHand = { x: centerX - 60 * scale, y: centerY + 30 * scale };
      let rHand = { x: centerX + 60 * scale, y: centerY + 30 * scale };
      let lHip = { x: centerX - 25 * scale, y: centerY + 20 * scale };
      let rHip = { x: centerX + 25 * scale, y: centerY + 20 * scale };
      let lKnee = { x: centerX - 30 * scale, y: centerY + 90 * scale };
      let rKnee = { x: centerX + 30 * scale, y: centerY + 90 * scale };
      let lAnkle = { x: centerX - 30 * scale, y: centerY + 160 * scale };
      let rAnkle = { x: centerX + 30 * scale, y: centerY + 160 * scale };

      let calculatedAngle = 90;
      let angleJoint = { x: centerX, y: centerY };
      let angleJointName = 'Joint';
      let phaseLabel = 'Concentric';

      const exId = exercise.id;

      /* =========================================================================
         KINEMATIC SKELETON POSITIONS MATCHED TO EVERY EXERCISE (53 EXERCISES)
         ========================================================================= */

      if (exId === 'kids_cheetah_dash') {
        // High-Energy Cheetah Fast-Feet Sprint Kinematics
        const sprintFreq = 7.0;
        const sprintCycle = Math.sin(t * sprintFreq); // -1 to +1
        const sprintCos = Math.cos(t * sprintFreq);
        const bobY = Math.abs(sprintCos) * 10 * scale;

        head = { x: centerX + 5 * scale, y: centerY - 145 * scale + bobY };
        neck = { x: centerX + 4 * scale, y: centerY - 115 * scale + bobY };
        chest = { x: centerX + 2 * scale, y: centerY - 75 * scale + bobY };
        pelvis = { x: centerX, y: centerY + bobY };

        lShoulder = { x: centerX - 25 * scale, y: centerY - 75 * scale + bobY };
        rShoulder = { x: centerX + 25 * scale, y: centerY - 75 * scale + bobY };
        lHip = { x: centerX - 18 * scale, y: centerY + bobY };
        rHip = { x: centerX + 18 * scale, y: centerY + bobY };

        // Rapid reciprocal high-knee sprint and arm pump
        if (sprintCycle >= 0) {
          // Right knee drives up, Left arm pumps forward
          rKnee = { x: centerX + 30 * scale, y: centerY + 25 * scale - sprintCycle * 45 * scale };
          rAnkle = { x: centerX + 22 * scale, y: centerY + 115 * scale - sprintCycle * 65 * scale };

          lKnee = { x: centerX - 18 * scale, y: centerY + 70 * scale + (1 - sprintCycle) * 15 * scale };
          lAnkle = { x: centerX - 15 * scale, y: centerY + 145 * scale };

          // Left arm pumps forward high, Right arm pumps back
          lElbow = { x: centerX - 38 * scale, y: centerY - 45 * scale + bobY };
          lHand = { x: centerX - 25 * scale, y: centerY - 85 * scale + sprintCycle * 15 * scale + bobY };

          rElbow = { x: centerX + 40 * scale, y: centerY - 35 * scale + bobY };
          rHand = { x: centerX + 30 * scale, y: centerY - 10 * scale + bobY };

          calculatedAngle = Math.round(180 - sprintCycle * 85); // knee angle
          angleJoint = { x: rKnee.x, y: rKnee.y };
          angleJointName = 'Right Knee Lift Angle';
          phaseLabel = 'Right High Knee Sprint';
        } else {
          const absCycle = -sprintCycle;
          // Left knee drives up, Right arm pumps forward
          lKnee = { x: centerX - 30 * scale, y: centerY + 25 * scale - absCycle * 45 * scale };
          lAnkle = { x: centerX - 22 * scale, y: centerY + 115 * scale - absCycle * 65 * scale };

          rKnee = { x: centerX + 18 * scale, y: centerY + 70 * scale + (1 - absCycle) * 15 * scale };
          rAnkle = { x: centerX + 15 * scale, y: centerY + 145 * scale };

          // Right arm pumps forward high, Left arm pumps back
          rElbow = { x: centerX + 38 * scale, y: centerY - 45 * scale + bobY };
          rHand = { x: centerX + 25 * scale, y: centerY - 85 * scale + absCycle * 15 * scale + bobY };

          lElbow = { x: centerX - 40 * scale, y: centerY - 35 * scale + bobY };
          lHand = { x: centerX - 30 * scale, y: centerY - 10 * scale + bobY };

          calculatedAngle = Math.round(180 - absCycle * 85);
          angleJoint = { x: lKnee.x, y: lKnee.y };
          angleJointName = 'Left Knee Lift Angle';
          phaseLabel = 'Left High Knee Sprint';
        }
      } else if (exId === 'kids_kangaroo_bounds' || exId === 'kids_frog_hops') {
        // Explosive hopping bounds
        const isFrog = exId === 'kids_frog_hops';
        const bounce = Math.abs(Math.sin(t * 5)); // 0 to 1
        const jumpY = -bounce * (isFrog ? 65 : 45) * scale;
        const tuck = (1 - bounce);

        head.y += jumpY + tuck * 40 * scale;
        neck.y += jumpY + tuck * 35 * scale;
        chest.y += jumpY + tuck * 30 * scale;
        pelvis.y += jumpY + tuck * 25 * scale;
        lShoulder.y += jumpY + tuck * 30 * scale;
        rShoulder.y += jumpY + tuck * 30 * scale;
        lHip.y += jumpY + tuck * 25 * scale;
        rHip.y += jumpY + tuck * 25 * scale;

        if (isFrog) {
          // Frog hands touch floor when low, reach high when jumping
          lHand = { x: centerX - 30 * scale, y: centerY + 120 * scale + jumpY * 0.2 + tuck * 30 * scale };
          rHand = { x: centerX + 30 * scale, y: centerY + 120 * scale + jumpY * 0.2 + tuck * 30 * scale };
          lKnee = { x: centerX - (50 + tuck * 30) * scale, y: centerY + 90 * scale + jumpY + tuck * 20 * scale };
          rKnee = { x: centerX + (50 + tuck * 30) * scale, y: centerY + 90 * scale + jumpY + tuck * 20 * scale };
        } else {
          // Kangaroo paws tucked up near chest
          lHand = { x: centerX - 25 * scale, y: centerY - 20 * scale + jumpY };
          rHand = { x: centerX + 25 * scale, y: centerY - 20 * scale + jumpY };
          lElbow = { x: centerX - 40 * scale, y: centerY + jumpY };
          rElbow = { x: centerX + 40 * scale, y: centerY + jumpY };
          lKnee = { x: centerX - (30 + tuck * 20) * scale, y: centerY + 80 * scale + jumpY + tuck * 20 * scale };
          rKnee = { x: centerX + (30 + tuck * 20) * scale, y: centerY + 80 * scale + jumpY + tuck * 20 * scale };
        }
        lAnkle.y = centerY + 160 * scale + jumpY * 0.4;
        rAnkle.y = centerY + 160 * scale + jumpY * 0.4;

        calculatedAngle = Math.round(75 + bounce * 95);
        angleJoint = { x: rKnee.x, y: rKnee.y };
        angleJointName = 'Knee Flexion';
        phaseLabel = bounce > 0.4 ? 'Explosive Leap' : 'Spring Crouch';
      } else if (exId === 'kids_crab_kicks') {
        // High-Precision Biomechanical Ninja Crab Toe Kicks Simulation
        // Reverse tabletop crab bridge with alternating cross-body high kicks & opposite toe taps
        const crabFreq = 2.4;
        const kickCycle = Math.sin(t * crabFreq); // -1 (left kick/right tap) to +1 (right kick/left tap)
        const baseY = centerY + 30 * scale;
        const floorY = baseY + 60 * scale;

        // Elevated reverse tabletop pelvis and chest
        head = { x: centerX - 65 * scale, y: baseY - 30 * scale };
        neck = { x: centerX - 45 * scale, y: baseY - 18 * scale };
        chest = { x: centerX - 15 * scale, y: baseY - 12 * scale };
        pelvis = { x: centerX + 25 * scale, y: baseY - 6 * scale };

        lShoulder = { x: centerX - 30 * scale, y: baseY - 12 * scale };
        rShoulder = { x: centerX - 30 * scale, y: baseY - 12 * scale };
        lHip = { x: centerX + 25 * scale, y: baseY - 6 * scale };
        rHip = { x: centerX + 25 * scale, y: baseY - 6 * scale };

        if (kickCycle >= 0) {
          // Phase A: Right Foot Kicks High, Left Hand Reaches to Tap Toe
          const kickProgress = Math.sin(kickCycle * Math.PI * 0.5); // 0 to 1

          // Supporting Right Hand planted behind
          rHand = { x: centerX - 65 * scale, y: floorY };
          rElbow = { x: centerX - 50 * scale, y: baseY + 20 * scale };

          // Supporting Left Leg planted in 90° reverse bridge
          lKnee = { x: centerX + 60 * scale, y: baseY + 8 * scale };
          lAnkle = { x: centerX + 75 * scale, y: floorY };

          // Kicking Right Leg shoots upward into the air
          rKnee = {
            x: (centerX + 60 * scale) * (1 - kickProgress) + (centerX + 50 * scale) * kickProgress,
            y: (baseY + 8 * scale) * (1 - kickProgress) + (baseY - 40 * scale) * kickProgress,
          };
          rAnkle = {
            x: (centerX + 75 * scale) * (1 - kickProgress) + (centerX + 55 * scale) * kickProgress,
            y: floorY * (1 - kickProgress) + (baseY - 80 * scale) * kickProgress,
          };

          // Reaching Left Hand rises to meet right foot in mid-air
          lHand = {
            x: (centerX - 65 * scale) * (1 - kickProgress) + (rAnkle.x - 5 * scale) * kickProgress,
            y: floorY * (1 - kickProgress) + (rAnkle.y + 5 * scale) * kickProgress,
          };
          lElbow = {
            x: (centerX - 50 * scale) * (1 - kickProgress) + (centerX + 10 * scale) * kickProgress,
            y: (baseY + 20 * scale) * (1 - kickProgress) + (baseY - 35 * scale) * kickProgress,
          };

          calculatedAngle = Math.round(90 + kickProgress * 70); // 90° to 160° knee extension
          angleJoint = { x: rKnee.x, y: rKnee.y };
          angleJointName = 'Kicking Hip & Knee Extension';
          phaseLabel = kickProgress > 0.4 ? 'Ninja High Kick & Toe Tap' : 'Crab Bridge Power Reset';
        } else {
          // Phase B: Left Foot Kicks High, Right Hand Reaches to Tap Toe
          const absCycle = -kickCycle;
          const kickProgress = Math.sin(absCycle * Math.PI * 0.5);

          // Supporting Left Hand planted behind
          lHand = { x: centerX - 65 * scale, y: floorY };
          lElbow = { x: centerX - 50 * scale, y: baseY + 20 * scale };

          // Supporting Right Leg planted in 90° reverse bridge
          rKnee = { x: centerX + 60 * scale, y: baseY + 8 * scale };
          rAnkle = { x: centerX + 75 * scale, y: floorY };

          // Kicking Left Leg shoots upward
          lKnee = {
            x: (centerX + 60 * scale) * (1 - kickProgress) + (centerX + 50 * scale) * kickProgress,
            y: (baseY + 8 * scale) * (1 - kickProgress) + (baseY - 40 * scale) * kickProgress,
          };
          lAnkle = {
            x: (centerX + 75 * scale) * (1 - kickProgress) + (centerX + 55 * scale) * kickProgress,
            y: floorY * (1 - kickProgress) + (baseY - 80 * scale) * kickProgress,
          };

          // Reaching Right Hand rises to meet left foot
          rHand = {
            x: (centerX - 65 * scale) * (1 - kickProgress) + (lAnkle.x - 5 * scale) * kickProgress,
            y: floorY * (1 - kickProgress) + (lAnkle.y + 5 * scale) * kickProgress,
          };
          rElbow = {
            x: (centerX - 50 * scale) * (1 - kickProgress) + (centerX + 10 * scale) * kickProgress,
            y: (baseY + 20 * scale) * (1 - kickProgress) + (baseY - 35 * scale) * kickProgress,
          };

          calculatedAngle = Math.round(90 + kickProgress * 70);
          angleJoint = { x: lKnee.x, y: lKnee.y };
          angleJointName = 'Kicking Hip & Knee Extension';
          phaseLabel = kickProgress > 0.4 ? 'Ninja High Kick & Toe Tap' : 'Crab Bridge Power Reset';
        }
      } else if (exId === 'kids_star_jumps' || exId === 'jumping_jack') {
        // Star Jumps / Jumping Jacks
        const starPhase = (Math.sin(t * 4) + 1) / 2; // 0 (crouch/narrow) to 1 (star open)
        const hopY = Math.abs(Math.sin(t * 4)) * 30 * scale;

        head.y -= hopY;
        neck.y -= hopY;
        chest.y -= hopY;
        pelvis.y -= hopY;
        lShoulder.y -= hopY;
        rShoulder.y -= hopY;
        lHip.y -= hopY;
        rHip.y -= hopY;

        // Wide star arms reaching to sky
        lElbow = { x: centerX - (50 + starPhase * 40) * scale, y: centerY - (60 + starPhase * 50) * scale - hopY };
        rElbow = { x: centerX + (50 + starPhase * 40) * scale, y: centerY - (60 + starPhase * 50) * scale - hopY };
        lHand = { x: centerX - (55 + starPhase * 65) * scale, y: centerY - (20 + starPhase * 130) * scale - hopY };
        rHand = { x: centerX + (55 + starPhase * 65) * scale, y: centerY - (20 + starPhase * 130) * scale - hopY };

        // Wide star legs
        lAnkle = { x: centerX - (25 + starPhase * 60) * scale, y: centerY + 160 * scale - hopY * 0.3 };
        rAnkle = { x: centerX + (25 + starPhase * 60) * scale, y: centerY + 160 * scale - hopY * 0.3 };
        lKnee = { x: centerX - (25 + starPhase * 35) * scale, y: centerY + 90 * scale - hopY * 0.5 };
        rKnee = { x: centerX + (25 + starPhase * 35) * scale, y: centerY + 90 * scale - hopY * 0.5 };

        calculatedAngle = Math.round(50 + starPhase * 110);
        angleJoint = { x: rShoulder.x, y: rShoulder.y };
        angleJointName = 'Star Arm Arc';
        phaseLabel = starPhase > 0.5 ? 'Star Blast (Open)' : 'Ninja Crouch (Tuck)';
      } else if (exId === 'skipping' || exId === 'boxer_skipping') {
        // Jump rope skipping
        const hopY = Math.abs(Math.sin(t * 6)) * 25 * scale;
        const ropeAngle = t * 6;
        const ropeX = Math.cos(ropeAngle) * 22 * scale;
        const ropeY = Math.sin(ropeAngle) * 22 * scale;

        head.y -= hopY;
        neck.y -= hopY;
        chest.y -= hopY;
        pelvis.y -= hopY;
        lShoulder.y -= hopY;
        rShoulder.y -= hopY;
        lHip.y -= hopY;
        rHip.y -= hopY;

        lHand = { x: centerX - 60 * scale + ropeX, y: centerY + 15 * scale + ropeY - hopY };
        rHand = { x: centerX + 60 * scale + ropeX, y: centerY + 15 * scale + ropeY - hopY };

        const isBoxer = exId === 'boxer_skipping';
        const altLeg = Math.sin(t * 3);
        lAnkle = { x: centerX - 25 * scale, y: centerY + 160 * scale - (isBoxer && altLeg > 0 ? 15 : 0) * scale - hopY * 0.4 };
        rAnkle = { x: centerX + 25 * scale, y: centerY + 160 * scale - (isBoxer && altLeg <= 0 ? 15 : 0) * scale - hopY * 0.4 };

        calculatedAngle = Math.round(175 - hopY * 1.5);
        angleJoint = { x: rAnkle.x, y: rAnkle.y };
        angleJointName = 'Achilles Spring';
        phaseLabel = hopY > 10 ? 'Rope Clearance' : 'Rebound Contact';
      } else if (exId === 'cardio_skater_bounds') {
        // Lateral Speed Skater Bounds
        const skate = Math.sin(t * 3.5); // -1 (left) to +1 (right)
        const shiftX = skate * 65 * scale;
        const dropY = Math.abs(skate) * 15 * scale;

        head.x += shiftX; head.y += dropY;
        chest.x += shiftX; chest.y += dropY;
        pelvis.x += shiftX; pelvis.y += dropY;
        lShoulder.x += shiftX; rShoulder.x += shiftX;

        if (skate > 0) {
          rKnee = { x: centerX + shiftX, y: centerY + 90 * scale + dropY };
          rAnkle = { x: centerX + shiftX, y: centerY + 160 * scale };
          lKnee = { x: centerX + shiftX - 45 * scale, y: centerY + 110 * scale };
          lAnkle = { x: centerX + shiftX - 85 * scale, y: centerY + 135 * scale };
          lHand = { x: centerX + shiftX + 45 * scale, y: centerY + 20 * scale };
          rHand = { x: centerX + shiftX - 60 * scale, y: centerY - 20 * scale };
        } else {
          lKnee = { x: centerX + shiftX, y: centerY + 90 * scale + dropY };
          lAnkle = { x: centerX + shiftX, y: centerY + 160 * scale };
          rKnee = { x: centerX + shiftX + 45 * scale, y: centerY + 110 * scale };
          rAnkle = { x: centerX + shiftX + 85 * scale, y: centerY + 135 * scale };
          rHand = { x: centerX + shiftX - 45 * scale, y: centerY + 20 * scale };
          lHand = { x: centerX + shiftX + 60 * scale, y: centerY - 20 * scale };
        }

        calculatedAngle = Math.round(95 + Math.abs(skate) * 45);
        angleJoint = { x: skate > 0 ? rKnee.x : lKnee.x, y: skate > 0 ? rKnee.y : lKnee.y };
        angleJointName = 'Lateral Push-Off';
        phaseLabel = skate > 0 ? 'Right Lateral Bound' : 'Left Lateral Bound';
      } else if (exId === 'high_knees') {
        // High Knee Sprint Drives
        const drive = Math.sin(t * 6);
        const hopY = Math.abs(Math.sin(t * 6)) * 12 * scale;
        head.y -= hopY; chest.y -= hopY; pelvis.y -= hopY;

        if (drive > 0) {
          lKnee = { x: centerX - 30 * scale, y: centerY + 20 * scale - hopY };
          lAnkle = { x: centerX - 30 * scale, y: centerY + 80 * scale - hopY };
          rKnee = { x: centerX + 30 * scale, y: centerY + 100 * scale };
          rAnkle = { x: centerX + 30 * scale, y: centerY + 160 * scale };
          lHand = { x: centerX - 45 * scale, y: centerY + 50 * scale };
          rHand = { x: centerX + 45 * scale, y: centerY - 40 * scale };
        } else {
          rKnee = { x: centerX + 30 * scale, y: centerY + 20 * scale - hopY };
          rAnkle = { x: centerX + 30 * scale, y: centerY + 80 * scale - hopY };
          lKnee = { x: centerX - 30 * scale, y: centerY + 100 * scale };
          lAnkle = { x: centerX - 30 * scale, y: centerY + 160 * scale };
          rHand = { x: centerX + 45 * scale, y: centerY + 50 * scale };
          lHand = { x: centerX - 45 * scale, y: centerY - 40 * scale };
        }
        calculatedAngle = Math.round(85 + Math.abs(drive) * 20);
        angleJoint = { x: drive > 0 ? lKnee.x : rKnee.x, y: drive > 0 ? lKnee.y : rKnee.y };
        angleJointName = 'Hip Drive Angle';
        phaseLabel = 'High Knee Turnover';
      } else if (exId === 'mountain_climber') {
        // High Plank Mountain Climbers
        const climbCycle = Math.sin(t * 5.5);
        const baseY = centerY + 30 * scale;

        head = { x: centerX + 110 * scale, y: baseY - 20 * scale };
        neck = { x: centerX + 85 * scale, y: baseY - 15 * scale };
        chest = { x: centerX + 45 * scale, y: baseY - 15 * scale };
        pelvis = { x: centerX - 35 * scale, y: baseY - 10 * scale };

        lShoulder = { x: centerX + 45 * scale, y: baseY - 15 * scale };
        rShoulder = { x: centerX + 45 * scale, y: baseY - 15 * scale };
        lElbow = { x: centerX + 45 * scale, y: baseY + 15 * scale };
        rElbow = { x: centerX + 45 * scale, y: baseY + 15 * scale };
        lHand = { x: centerX + 45 * scale, y: baseY + 45 * scale };
        rHand = { x: centerX + 45 * scale, y: baseY + 45 * scale };

        if (climbCycle > 0) {
          // Left knee drives to chest
          lKnee = { x: centerX + 10 * scale, y: baseY + 15 * scale };
          lAnkle = { x: centerX - 20 * scale, y: baseY + 30 * scale };
          rKnee = { x: centerX - 100 * scale, y: baseY + 15 * scale };
          rAnkle = { x: centerX - 160 * scale, y: baseY + 45 * scale };
        } else {
          // Right knee drives to chest
          rKnee = { x: centerX + 10 * scale, y: baseY + 15 * scale };
          rAnkle = { x: centerX - 20 * scale, y: baseY + 30 * scale };
          lKnee = { x: centerX - 100 * scale, y: baseY + 15 * scale };
          lAnkle = { x: centerX - 160 * scale, y: baseY + 45 * scale };
        }

        calculatedAngle = Math.round(55 + Math.abs(climbCycle) * 35);
        angleJoint = { x: climbCycle > 0 ? lKnee.x : rKnee.x, y: climbCycle > 0 ? lKnee.y : rKnee.y };
        angleJointName = 'Knee Drive';
        phaseLabel = climbCycle > 0 ? 'Left Knee Sprint Drive' : 'Right Knee Sprint Drive';
      } else if (exId === 'burpee') {
        // Dynamic Burpee 4-Phase Cycle
        const burpeeCycle = (t * 0.7) % 4; // 0 to 4
        if (burpeeCycle < 1) {
          // Phase 1: Standing / Squat drop
          const depth = burpeeCycle;
          head.y += depth * 80 * scale;
          chest.y += depth * 80 * scale;
          pelvis.y += depth * 80 * scale;
          lHand = { x: centerX - 30 * scale, y: centerY + 20 * scale + depth * 120 * scale };
          rHand = { x: centerX + 30 * scale, y: centerY + 20 * scale + depth * 120 * scale };
          calculatedAngle = Math.round(180 - depth * 90);
          angleJoint = { x: pelvis.x, y: pelvis.y };
          angleJointName = 'Squat Drop';
          phaseLabel = 'Drop to Plank';
        } else if (burpeeCycle < 2) {
          // Phase 2: Plank / Pushup
          const baseY = centerY + 35 * scale;
          head = { x: centerX + 110 * scale, y: baseY - 20 * scale };
          chest = { x: centerX + 45 * scale, y: baseY - 15 * scale };
          pelvis = { x: centerX - 35 * scale, y: baseY - 10 * scale };
          lHand = { x: centerX + 45 * scale, y: baseY + 45 * scale };
          rHand = { x: centerX + 45 * scale, y: baseY + 45 * scale };
          lAnkle = { x: centerX - 160 * scale, y: baseY + 45 * scale };
          rAnkle = { x: centerX - 160 * scale, y: baseY + 45 * scale };
          calculatedAngle = 180;
          angleJoint = { x: pelvis.x, y: pelvis.y };
          angleJointName = 'Plank Lockout';
          phaseLabel = 'Rigid Core Plank';
        } else if (burpeeCycle < 3) {
          // Phase 3: Snap feet in
          head.y = centerY + 20 * scale;
          chest.y = centerY + 40 * scale;
          pelvis.y = centerY + 60 * scale;
          lHand = { x: centerX - 30 * scale, y: centerY + 130 * scale };
          rHand = { x: centerX + 30 * scale, y: centerY + 130 * scale };
          lKnee = { x: centerX - 25 * scale, y: centerY + 90 * scale };
          rKnee = { x: centerX + 25 * scale, y: centerY + 90 * scale };
          calculatedAngle = 80;
          angleJoint = { x: lKnee.x, y: lKnee.y };
          angleJointName = 'Tuck Spring';
          phaseLabel = 'Feet Snap In';
        } else {
          // Phase 4: Explosive Jump with hands overhead
          const jumpT = burpeeCycle - 3;
          const jumpUp = Math.sin(jumpT * Math.PI) * 45 * scale;
          head.y -= jumpUp; chest.y -= jumpUp; pelvis.y -= jumpUp;
          lHand = { x: centerX - 40 * scale, y: centerY - 140 * scale - jumpUp };
          rHand = { x: centerX + 40 * scale, y: centerY - 140 * scale - jumpUp };
          lAnkle = { x: centerX - 20 * scale, y: centerY + 160 * scale - jumpUp * 0.4 };
          rAnkle = { x: centerX + 20 * scale, y: centerY + 160 * scale - jumpUp * 0.4 };
          calculatedAngle = 180;
          angleJoint = { x: rShoulder.x, y: rShoulder.y };
          angleJointName = 'Vertical Jump';
          phaseLabel = 'Explosive Jump Up';
        }
      } else if (exId === 'shadow_boxing') {
        // Boxer rhythm punches & slips
        const punchCycle = Math.sin(t * 4);
        const boxerBounce = Math.abs(Math.sin(t * 4)) * 6 * scale;
        head.y += boxerBounce; chest.y += boxerBounce;

        if (punchCycle > 0) {
          lElbow = { x: centerX - 40 * scale, y: centerY - 65 * scale };
          lHand = { x: centerX - 120 * scale, y: centerY - 70 * scale };
          rElbow = { x: centerX + 25 * scale, y: centerY - 40 * scale };
          rHand = { x: centerX + 20 * scale, y: centerY - 65 * scale };
        } else {
          rElbow = { x: centerX + 40 * scale, y: centerY - 65 * scale };
          rHand = { x: centerX - 120 * scale, y: centerY - 65 * scale };
          lElbow = { x: centerX - 25 * scale, y: centerY - 40 * scale };
          lHand = { x: centerX - 20 * scale, y: centerY - 65 * scale };
        }
        calculatedAngle = Math.round(165 - Math.abs(punchCycle) * 35);
        angleJoint = { x: punchCycle > 0 ? lElbow.x : rElbow.x, y: punchCycle > 0 ? lElbow.y : rElbow.y };
        angleJointName = 'Punch Extension';
        phaseLabel = punchCycle > 0 ? 'Lead Jab Strike' : 'Rear Cross Strike';
      } else if (exId === 'squat' || exId === 'senior_chair_stand') {
        // Deep Squat / Sit-to-Stand
        const isChair = exId === 'senior_chair_stand';
        const squatDepth = wave01; // 0 (top) to 1 (bottom)
        const dropY = squatDepth * 70 * scale;

        head.y += dropY;
        neck.y += dropY;
        chest.y += dropY + (squatDepth * 15) * scale;
        pelvis.y += dropY + squatDepth * 20 * scale;
        lShoulder.y += dropY; rShoulder.y += dropY;
        lHip.y += dropY + squatDepth * 20 * scale;
        rHip.y += dropY + squatDepth * 20 * scale;

        lKnee = { x: centerX - (35 + squatDepth * 25) * scale, y: centerY + 90 * scale + dropY * 0.25 };
        rKnee = { x: centerX + (35 + squatDepth * 25) * scale, y: centerY + 90 * scale + dropY * 0.25 };

        if (isChair && squatDepth > 0.8) {
          // Chair support hands resting near thighs
          lHand = { x: centerX - 25 * scale, y: centerY + 60 * scale + dropY * 0.3 };
          rHand = { x: centerX + 25 * scale, y: centerY + 60 * scale + dropY * 0.3 };
        } else {
          // Counterbalance arms forward
          lHand = { x: centerX - 30 * scale, y: centerY - 20 * scale + dropY * 0.4 };
          rHand = { x: centerX + 30 * scale, y: centerY - 20 * scale + dropY * 0.4 };
          lElbow = { x: centerX - 45 * scale, y: centerY - 40 * scale + dropY * 0.5 };
          rElbow = { x: centerX + 45 * scale, y: centerY - 40 * scale + dropY * 0.5 };
        }

        calculatedAngle = Math.round(175 - squatDepth * 85);
        angleJoint = { x: rKnee.x, y: rKnee.y };
        angleJointName = 'Knee Flexion';
        phaseLabel = squatDepth > 0.7 ? (isChair ? 'Chair Sit Contact' : 'Parallel Hole') : squatDepth > 0.3 ? 'Eccentric Descent' : 'Lockout Drive';
      } else if (exId === 'strength_romanian_deadlift') {
        // Romanian Deadlift Hinge
        const hinge = wave01;
        const hipsBack = hinge * 45 * scale;
        const torsoDrop = hinge * 60 * scale;

        pelvis = { x: centerX - hipsBack, y: centerY + 20 * scale };
        lHip = { x: centerX - hipsBack - 15 * scale, y: centerY + 25 * scale };
        rHip = { x: centerX - hipsBack + 15 * scale, y: centerY + 25 * scale };

        chest = { x: centerX + 20 * scale - hipsBack * 0.5, y: centerY - 10 * scale + torsoDrop * 0.6 };
        head = { x: centerX + 50 * scale - hipsBack * 0.5, y: centerY - 30 * scale + torsoDrop * 0.8 };
        neck = { x: centerX + 35 * scale - hipsBack * 0.5, y: centerY - 20 * scale + torsoDrop * 0.7 };
        lShoulder = { x: centerX + 20 * scale - hipsBack * 0.5, y: centerY - 10 * scale + torsoDrop * 0.6 };
        rShoulder = { x: centerX + 20 * scale - hipsBack * 0.5, y: centerY - 10 * scale + torsoDrop * 0.6 };

        lHand = { x: centerX - 10 * scale, y: centerY + 70 * scale + hinge * 40 * scale };
        rHand = { x: centerX + 10 * scale, y: centerY + 70 * scale + hinge * 40 * scale };
        lElbow = { x: centerX, y: centerY + 30 * scale + hinge * 20 * scale };
        rElbow = { x: centerX, y: centerY + 30 * scale + hinge * 20 * scale };

        lKnee = { x: centerX - 25 * scale, y: centerY + 95 * scale };
        rKnee = { x: centerX + 25 * scale, y: centerY + 95 * scale };

        calculatedAngle = Math.round(175 - hinge * 85);
        angleJoint = { x: pelvis.x, y: pelvis.y };
        angleJointName = 'Hip Hinge Angle';
        phaseLabel = hinge > 0.7 ? 'Hamstring Stretch' : hinge > 0.3 ? 'Hinging Back' : 'Glute Lockout';
      } else if (exId === 'lunge' || exId === 'health_hip_opener' || exId === 'worlds_greatest_stretch') {
        // Lunges / Hip Flexor Stretch / World's Greatest Stretch
        const lungeDepth = wave01;
        const dropY = lungeDepth * 40 * scale;

        pelvis = { x: centerX, y: centerY + 40 * scale + dropY };
        chest = { x: centerX, y: centerY - 20 * scale + dropY };
        head = { x: centerX, y: centerY - 90 * scale + dropY };
        neck = { x: centerX, y: centerY - 60 * scale + dropY };

        lKnee = { x: centerX - 55 * scale, y: centerY + 100 * scale + dropY * 0.5 };
        lAnkle = { x: centerX - 55 * scale, y: centerY + 160 * scale };
        rKnee = { x: centerX + 65 * scale, y: centerY + 130 * scale + dropY * 0.8 };
        rAnkle = { x: centerX + 115 * scale, y: centerY + 160 * scale };

        if (exId === 'worlds_greatest_stretch') {
          lHand = { x: centerX - 40 * scale, y: centerY + 150 * scale };
          rHand = { x: centerX + 20 * scale, y: centerY - 140 * scale + lungeDepth * 30 * scale };
        } else {
          lHand = { x: centerX - 25 * scale, y: centerY + 30 * scale + dropY };
          rHand = { x: centerX + 25 * scale, y: centerY + 30 * scale + dropY };
        }

        calculatedAngle = Math.round(160 - lungeDepth * 70);
        angleJoint = { x: lKnee.x, y: lKnee.y };
        angleJointName = 'Lead Knee Angle';
        phaseLabel = lungeDepth > 0.7 ? 'Deep Hip Stretch' : 'Lowering / Driving';
      } else if (exId === 'pushup' || exId === 'senior_wall_pushup') {
        // Push-ups / Wall Push-ups
        const isWall = exId === 'senior_wall_pushup';
        const pushDepth = wave01;
        const baseY = centerY + (isWall ? 10 : 40) * scale;
        const incline = isWall ? 0.6 : 0;

        head = { x: centerX + 105 * scale, y: baseY - (25 - pushDepth * (isWall ? 15 : 25)) * scale - incline * 40 * scale };
        neck = { x: centerX + 80 * scale, y: baseY - (20 - pushDepth * (isWall ? 15 : 25)) * scale - incline * 30 * scale };
        chest = { x: centerX + 40 * scale, y: baseY - (15 - pushDepth * (isWall ? 15 : 25)) * scale - incline * 15 * scale };
        pelvis = { x: centerX - 35 * scale, y: baseY - 10 * scale };
        lShoulder = { x: centerX + 40 * scale, y: baseY - 10 * scale - incline * 15 * scale };
        rShoulder = { x: centerX + 40 * scale, y: baseY - 10 * scale - incline * 15 * scale };

        lElbow = { x: centerX + 40 * scale, y: baseY + (20 + pushDepth * 20) * scale };
        rElbow = { x: centerX + 40 * scale, y: baseY + (20 + pushDepth * 20) * scale };
        lHand = { x: centerX + 40 * scale, y: baseY + 55 * scale };
        rHand = { x: centerX + 40 * scale, y: baseY + 55 * scale };

        lHip = { x: centerX - 35 * scale, y: baseY - 10 * scale };
        rHip = { x: centerX - 35 * scale, y: baseY - 10 * scale };
        lKnee = { x: centerX - 100 * scale, y: baseY };
        rKnee = { x: centerX - 100 * scale, y: baseY };
        lAnkle = { x: centerX - 160 * scale, y: baseY + 45 * scale };
        rAnkle = { x: centerX - 160 * scale, y: baseY + 45 * scale };

        calculatedAngle = Math.round(165 - pushDepth * 75);
        angleJoint = { x: lElbow.x, y: lElbow.y };
        angleJointName = 'Elbow Angle';
        phaseLabel = pushDepth > 0.7 ? 'Chest to Floor' : pushDepth > 0.3 ? 'Lowering' : 'Full Lockout';
      } else if (exId === 'plank' || exId === 'side_plank') {
        // Isometric Planks
        const isSide = exId === 'side_plank';
        const baseY = centerY + 35 * scale;
        const breath = Math.sin(t * 3) * 3 * scale;

        head = { x: centerX + 110 * scale, y: baseY - 20 * scale + breath };
        neck = { x: centerX + 85 * scale, y: baseY - 15 * scale + breath };
        chest = { x: centerX + 45 * scale, y: baseY - 15 * scale + breath };
        pelvis = { x: centerX - 35 * scale, y: baseY - 10 * scale };

        if (isSide) {
          rHand = { x: centerX + 45 * scale, y: baseY - 90 * scale };
          rElbow = { x: centerX + 45 * scale, y: baseY - 50 * scale };
          lElbow = { x: centerX + 45 * scale, y: baseY + 45 * scale };
          lHand = { x: centerX + 75 * scale, y: baseY + 45 * scale };
        } else {
          lElbow = { x: centerX + 45 * scale, y: baseY + 45 * scale };
          rElbow = { x: centerX + 45 * scale, y: baseY + 45 * scale };
          lHand = { x: centerX + 75 * scale, y: baseY + 45 * scale };
          rHand = { x: centerX + 75 * scale, y: baseY + 45 * scale };
        }

        lHip = { x: centerX - 35 * scale, y: baseY - 10 * scale };
        rHip = { x: centerX - 35 * scale, y: baseY - 10 * scale };
        lKnee = { x: centerX - 100 * scale, y: baseY };
        rKnee = { x: centerX - 100 * scale, y: baseY };
        lAnkle = { x: centerX - 160 * scale, y: baseY + 45 * scale };
        rAnkle = { x: centerX - 160 * scale, y: baseY + 45 * scale };

        calculatedAngle = 180;
        angleJoint = { x: pelvis.x, y: pelvis.y };
        angleJointName = 'Neutral Spine Alignment';
        phaseLabel = 'Pillar Isometric Hold';
      } else if (exId === 'glute_bridge') {
        // Supine Glute Bridges
        const bridgeLift = wave01;
        const baseY = centerY + 50 * scale;

        head = { x: centerX + 110 * scale, y: baseY + 20 * scale };
        neck = { x: centerX + 85 * scale, y: baseY + 20 * scale };
        chest = { x: centerX + 45 * scale, y: baseY + (20 - bridgeLift * 20) * scale };
        pelvis = { x: centerX - 25 * scale, y: baseY + (20 - bridgeLift * 50) * scale };
        lHip = { x: centerX - 25 * scale, y: baseY + (20 - bridgeLift * 50) * scale };
        rHip = { x: centerX - 25 * scale, y: baseY + (20 - bridgeLift * 50) * scale };

        lKnee = { x: centerX - 85 * scale, y: baseY - 10 * scale };
        rKnee = { x: centerX - 85 * scale, y: baseY - 10 * scale };
        lAnkle = { x: centerX - 130 * scale, y: baseY + 25 * scale };
        rAnkle = { x: centerX - 130 * scale, y: baseY + 25 * scale };

        lHand = { x: centerX + 20 * scale, y: baseY + 25 * scale };
        rHand = { x: centerX + 20 * scale, y: baseY + 25 * scale };

        calculatedAngle = Math.round(120 + bridgeLift * 60);
        angleJoint = { x: pelvis.x, y: pelvis.y };
        angleJointName = 'Hip Extension';
        phaseLabel = bridgeLift > 0.7 ? 'Glute Squeeze Peak' : bridgeLift > 0.3 ? 'Pelvic Drive' : 'Lowering';
      } else if (exId === 'dead_bug' || exId === 'core_hollow_body_hold') {
        // Supine Core Armor
        const isHollow = exId === 'core_hollow_body_hold';
        const alt = Math.sin(t * 2.5);
        const baseY = centerY + 50 * scale;

        head = { x: centerX + 95 * scale, y: baseY - (isHollow ? 15 : 0) * scale };
        neck = { x: centerX + 75 * scale, y: baseY };
        chest = { x: centerX + 40 * scale, y: baseY };
        pelvis = { x: centerX - 25 * scale, y: baseY };
        lHip = { x: centerX - 25 * scale, y: baseY };
        rHip = { x: centerX - 25 * scale, y: baseY };

        if (isHollow) {
          lHand = { x: centerX + 155 * scale, y: baseY - 25 * scale };
          rHand = { x: centerX + 155 * scale, y: baseY - 25 * scale };
          lAnkle = { x: centerX - 150 * scale, y: baseY - 25 * scale };
          rAnkle = { x: centerX - 150 * scale, y: baseY - 25 * scale };
          lKnee = { x: centerX - 90 * scale, y: baseY - 15 * scale };
          rKnee = { x: centerX - 90 * scale, y: baseY - 15 * scale };
        } else {
          if (alt > 0) {
            lHand = { x: centerX + 145 * scale, y: baseY - 10 * scale };
            rHand = { x: centerX + 40 * scale, y: baseY - 70 * scale };
            rAnkle = { x: centerX - 145 * scale, y: baseY - 10 * scale };
            lAnkle = { x: centerX - 85 * scale, y: baseY - 70 * scale };
            lKnee = { x: centerX - 65 * scale, y: baseY - 40 * scale };
            rKnee = { x: centerX - 90 * scale, y: baseY - 10 * scale };
          } else {
            rHand = { x: centerX + 145 * scale, y: baseY - 10 * scale };
            lHand = { x: centerX + 40 * scale, y: baseY - 70 * scale };
            lAnkle = { x: centerX - 145 * scale, y: baseY - 10 * scale };
            rAnkle = { x: centerX - 85 * scale, y: baseY - 70 * scale };
            rKnee = { x: centerX - 65 * scale, y: baseY - 40 * scale };
            lKnee = { x: centerX - 90 * scale, y: baseY - 10 * scale };
          }
        }

        calculatedAngle = isHollow ? 160 : Math.round(90 + Math.abs(alt) * 85);
        angleJoint = { x: lHip.x, y: lHip.y };
        angleJointName = isHollow ? 'Hollow Hold Angle' : 'Core Anti-Extension';
        phaseLabel = isHollow ? 'Hollow Body Tension' : alt > 0 ? 'Contralateral Extension A' : 'Contralateral Extension B';
      } else if (exId === 'cat_camel_flow') {
        // Tabletop Quadruped Cat-Cow / Cat-Camel Spinal Mobilization
        const spinalArch = Math.sin(t * 2.2) * 22 * scale;
        const baseY = centerY + 15 * scale;

        head = { x: centerX + 90 * scale, y: baseY - 30 * scale + spinalArch * 0.5 };
        neck = { x: centerX + 65 * scale, y: baseY - 18 * scale + spinalArch * 0.4 };
        chest = { x: centerX + 25 * scale, y: baseY - 18 * scale - spinalArch };
        pelvis = { x: centerX - 55 * scale, y: baseY - 15 * scale };

        lShoulder = { x: centerX + 30 * scale, y: baseY - 15 * scale };
        rShoulder = { x: centerX + 30 * scale, y: baseY - 15 * scale };
        lElbow = { x: centerX + 30 * scale, y: baseY + 20 * scale };
        rElbow = { x: centerX + 30 * scale, y: baseY + 20 * scale };
        lHand = { x: centerX + 30 * scale, y: baseY + 60 * scale };
        rHand = { x: centerX + 30 * scale, y: baseY + 60 * scale };

        lHip = { x: centerX - 55 * scale, y: baseY - 10 * scale };
        rHip = { x: centerX - 55 * scale, y: baseY - 10 * scale };
        lKnee = { x: centerX - 55 * scale, y: baseY + 60 * scale };
        rKnee = { x: centerX - 55 * scale, y: baseY + 60 * scale };
        lAnkle = { x: centerX - 105 * scale, y: baseY + 60 * scale };
        rAnkle = { x: centerX - 105 * scale, y: baseY + 60 * scale };

        calculatedAngle = Math.round(180 + spinalArch * 2.5);
        angleJoint = { x: chest.x, y: chest.y };
        angleJointName = 'Spinal Segmental Arc';
        phaseLabel = spinalArch > 0 ? 'Gentle Cat Curve (Exhale)' : 'Gentle Chest Open (Inhale)';
      } else if (exId === 'bird_dog') {
        // Tabletop Quadruped Bird-Dog Balance (Contralateral Reach)
        const baseY = centerY + 15 * scale;
        const birdCycle = Math.sin(t * 2.2); // -1 (Left Arm/Right Leg) to +1 (Right Arm/Left Leg)
        const reachA = Math.pow(Math.max(0, birdCycle), 1.2); // Right Arm + Left Leg
        const reachB = Math.pow(Math.max(0, -birdCycle), 1.2); // Left Arm + Right Leg

        head = { x: centerX + 85 * scale, y: baseY - 20 * scale };
        neck = { x: centerX + 60 * scale, y: baseY - 15 * scale };
        chest = { x: centerX + 20 * scale, y: baseY - 15 * scale };
        pelvis = { x: centerX - 55 * scale, y: baseY - 15 * scale };

        lShoulder = { x: centerX + 25 * scale, y: baseY - 15 * scale };
        rShoulder = { x: centerX + 25 * scale, y: baseY - 15 * scale };
        lHip = { x: centerX - 55 * scale, y: baseY - 15 * scale };
        rHip = { x: centerX - 55 * scale, y: baseY - 15 * scale };

        if (birdCycle >= 0) {
          // Right Arm Reaches Forward, Left Leg Extends Backward
          rElbow = { x: centerX + 80 * scale, y: baseY - 18 * scale };
          rHand = {
            x: (centerX + 25 * scale) * (1 - reachA) + (centerX + 135 * scale) * reachA,
            y: (baseY + 60 * scale) * (1 - reachA) + (baseY - 18 * scale) * reachA,
          };

          lElbow = { x: centerX + 25 * scale, y: baseY + 20 * scale };
          lHand = { x: centerX + 25 * scale, y: baseY + 60 * scale }; // Planted support

          // Left Leg extends back straight
          lKnee = {
            x: (centerX - 55 * scale) * (1 - reachA) + (centerX - 105 * scale) * reachA,
            y: (baseY + 60 * scale) * (1 - reachA) + (baseY - 15 * scale) * reachA,
          };
          lAnkle = {
            x: (centerX - 105 * scale) * (1 - reachA) + (centerX - 165 * scale) * reachA,
            y: (baseY + 60 * scale) * (1 - reachA) + (baseY - 15 * scale) * reachA,
          };

          // Right Leg planted support
          rKnee = { x: centerX - 55 * scale, y: baseY + 60 * scale };
          rAnkle = { x: centerX - 105 * scale, y: baseY + 60 * scale };

          calculatedAngle = Math.round(145 + reachA * 35);
          angleJoint = { x: lHip.x, y: lHip.y };
          angleJointName = 'Posterior Chain Alignment';
          phaseLabel = reachA > 0.4 ? 'Right Arm & Left Leg Reach (Glute & Core Hold)' : 'Stable Tabletop Transition';
        } else {
          // Left Arm Reaches Forward, Right Leg Extends Backward
          lElbow = { x: centerX + 80 * scale, y: baseY - 18 * scale };
          lHand = {
            x: (centerX + 25 * scale) * (1 - reachB) + (centerX + 135 * scale) * reachB,
            y: (baseY + 60 * scale) * (1 - reachB) + (baseY - 18 * scale) * reachB,
          };

          rElbow = { x: centerX + 25 * scale, y: baseY + 20 * scale };
          rHand = { x: centerX + 25 * scale, y: baseY + 60 * scale }; // Planted support

          // Right Leg extends back straight
          rKnee = {
            x: (centerX - 55 * scale) * (1 - reachB) + (centerX - 105 * scale) * reachB,
            y: (baseY + 60 * scale) * (1 - reachB) + (baseY - 15 * scale) * reachB,
          };
          rAnkle = {
            x: (centerX - 105 * scale) * (1 - reachB) + (centerX - 165 * scale) * reachB,
            y: (baseY + 60 * scale) * (1 - reachB) + (baseY - 15 * scale) * reachB,
          };

          // Left Leg planted support
          lKnee = { x: centerX - 55 * scale, y: baseY + 60 * scale };
          lAnkle = { x: centerX - 105 * scale, y: baseY + 60 * scale };

          calculatedAngle = Math.round(145 + reachB * 35);
          angleJoint = { x: rHip.x, y: rHip.y };
          angleJointName = 'Posterior Chain Alignment';
          phaseLabel = reachB > 0.4 ? 'Left Arm & Right Leg Reach (Glute & Core Hold)' : 'Stable Tabletop Transition';
        }
      } else if (exId === 'thoracic_windmill') {
        // Side-Lying Thoracic Windmill
        const baseY = centerY + 30 * scale;
        head = { x: centerX + 95 * scale, y: baseY - 10 * scale };
        neck = { x: centerX + 70 * scale, y: baseY };
        chest = { x: centerX + 35 * scale, y: baseY };
        pelvis = { x: centerX - 30 * scale, y: baseY };

        const sweepAngle = t * 2;
        rHand = { x: centerX + 35 * scale + Math.cos(sweepAngle) * 90 * scale, y: baseY - 10 * scale + Math.sin(sweepAngle) * 90 * scale };
        lHand = { x: centerX - 20 * scale, y: baseY + 10 * scale };
        lKnee = { x: centerX - 70 * scale, y: baseY + 20 * scale };
        rKnee = { x: centerX - 70 * scale, y: baseY + 20 * scale };

        calculatedAngle = Math.round(90 + Math.sin(sweepAngle) * 45);
        angleJoint = { x: chest.x, y: chest.y };
        angleJointName = 'Thoracic Mobility Arc';
        phaseLabel = 'Thoracic Arm Sweep';
      } else if (exId === 'senior_ankle_alphabet') {
        // Seated Ankle Pumps & Alphabet Tracing
        const pumpWave = Math.sin(t * 4);
        const baseY = centerY + 20 * scale;

        head = { x: centerX, y: baseY - 120 * scale };
        chest = { x: centerX, y: baseY - 40 * scale };
        pelvis = { x: centerX, y: baseY + 30 * scale };

        lKnee = { x: centerX - 40 * scale, y: baseY + 70 * scale };
        rKnee = { x: centerX + 40 * scale, y: baseY + 70 * scale };
        lAnkle = { x: centerX - 40 * scale, y: baseY + 140 * scale };
        rAnkle = { x: centerX + 40 * scale + pumpWave * 15 * scale, y: baseY + 140 * scale - Math.abs(pumpWave) * 10 * scale };

        calculatedAngle = Math.round(90 + pumpWave * 30);
        angleJoint = { x: rAnkle.x, y: rAnkle.y };
        angleJointName = 'Ankle Pump Plane';
        phaseLabel = pumpWave > 0 ? 'Dorsiflexion Pull' : 'Plantarflexion Point';
      } else if (exId === 'senior_seated_row') {
        // Seated Scapular Row
        const rowPinch = wave01;
        const baseY = centerY + 10 * scale;

        head = { x: centerX, y: baseY - 130 * scale };
        neck = { x: centerX, y: baseY - 90 * scale };
        chest = { x: centerX, y: baseY - 40 * scale };
        pelvis = { x: centerX, y: baseY + 30 * scale };

        lKnee = { x: centerX - 60 * scale, y: baseY + 70 * scale };
        rKnee = { x: centerX + 60 * scale, y: baseY + 70 * scale };
        lAnkle = { x: centerX - 60 * scale, y: baseY + 140 * scale };
        rAnkle = { x: centerX + 60 * scale, y: baseY + 140 * scale };

        lElbow = { x: centerX - (45 - rowPinch * 25) * scale, y: baseY - 20 * scale };
        rElbow = { x: centerX + (45 - rowPinch * 25) * scale, y: baseY - 20 * scale };
        lHand = { x: centerX - (30 + (1 - rowPinch) * 60) * scale, y: baseY - 20 * scale };
        rHand = { x: centerX + (30 + (1 - rowPinch) * 60) * scale, y: baseY - 20 * scale };

        calculatedAngle = Math.round(150 - rowPinch * 70);
        angleJoint = { x: rElbow.x, y: rElbow.y };
        angleJointName = 'Row Retraction';
        phaseLabel = rowPinch > 0.7 ? 'Scapular Squeeze' : 'Eccentric Reach';
      } else if (exId === 'senior_seated_leg_extension') {
        // Seated Knee Extension & Quad Lock
        const kick = wave01;
        const baseY = centerY + 10 * scale;

        head = { x: centerX, y: baseY - 130 * scale };
        chest = { x: centerX, y: baseY - 40 * scale };
        pelvis = { x: centerX, y: baseY + 30 * scale };

        lKnee = { x: centerX - 50 * scale, y: baseY + 70 * scale };
        rKnee = { x: centerX + 50 * scale, y: baseY + 70 * scale };
        lAnkle = { x: centerX - 50 * scale, y: baseY + 140 * scale };
        rAnkle = { x: centerX + (50 + kick * 65) * scale, y: baseY + (140 - kick * 65) * scale };

        calculatedAngle = Math.round(90 + kick * 90);
        angleJoint = { x: rKnee.x, y: rKnee.y };
        angleJointName = 'Knee Extension';
        phaseLabel = kick > 0.8 ? 'Quadriceps Lockout' : 'Controlled Lowering';
      } else if (exId === 'senior_neck_rolls') {
        // Senior Slow Gentle Cervical Neck Rolls
        const rollAngle = t * 2;
        const rollX = Math.cos(rollAngle) * 12 * scale;
        const rollY = Math.sin(rollAngle) * 8 * scale;

        head = { x: centerX + rollX, y: centerY - 140 * scale + rollY };
        calculatedAngle = Math.round(85 + Math.sin(rollAngle) * 20);
        angleJoint = { x: head.x, y: head.y };
        angleJointName = 'Cervical Rotation';
        phaseLabel = 'Slow Decompression Arc';
      } else if (exId === 'kids_flamingo_balance' || exId === 'senior_tandem_balance' || exId === 'senior_tightrope_walk') {
        // Balance Equilibrium Stance
        const sway = Math.sin(t * 2) * 8 * scale;
        head.x += sway; chest.x += sway * 0.5;

        lHand = { x: centerX - 120 * scale, y: centerY - 80 * scale + sway * 2 };
        rHand = { x: centerX + 120 * scale, y: centerY - 80 * scale - sway * 2 };
        lElbow = { x: centerX - 75 * scale, y: centerY - 80 * scale };
        rElbow = { x: centerX + 75 * scale, y: centerY - 80 * scale };

        if (exId === 'kids_flamingo_balance') {
          rKnee = { x: centerX + 35 * scale, y: centerY + 65 * scale };
          rAnkle = { x: centerX - 15 * scale, y: centerY + 90 * scale };
        } else {
          const stepWalk = Math.sin(t * 2);
          lAnkle = { x: centerX, y: centerY + (150 - stepWalk * 15) * scale };
          rAnkle = { x: centerX, y: centerY + (150 + stepWalk * 15) * scale };
        }

        calculatedAngle = Math.round(180 - Math.abs(sway) * 3);
        angleJoint = { x: head.x, y: head.y };
        angleJointName = 'Center of Mass';
        phaseLabel = 'Equilibrium Balance';
      } else if (exId === 'health_standing_calf_raise') {
        // Standing Calf Raises
        const calfPeak = wave01;
        const liftY = -calfPeak * 35 * scale;

        head.y += liftY; neck.y += liftY; chest.y += liftY; pelvis.y += liftY;
        lShoulder.y += liftY; rShoulder.y += liftY; lHip.y += liftY; rHip.y += liftY;
        lKnee.y += liftY; rKnee.y += liftY;

        calculatedAngle = Math.round(90 + calfPeak * 35);
        angleJoint = { x: rAnkle.x, y: rAnkle.y };
        angleJointName = 'Ankle Plantarflexion';
        phaseLabel = calfPeak > 0.8 ? 'Peak Toe Extension' : 'Heel Lowering';
      } else if (exId === 'health_desk_chest_opener' || exId === 'health_doorframe_pec_stretch') {
        // Chest & Pec Stretch
        const open = wave01;
        if (exId === 'health_doorframe_pec_stretch') {
          lElbow = { x: centerX - 90 * scale, y: centerY - 80 * scale };
          rElbow = { x: centerX + 90 * scale, y: centerY - 80 * scale };
          lHand = { x: centerX - 90 * scale, y: centerY - 140 * scale };
          rHand = { x: centerX + 90 * scale, y: centerY - 140 * scale };
        } else {
          lHand = { x: centerX - 10 * scale, y: centerY + 20 * scale - open * 15 * scale };
          rHand = { x: centerX + 10 * scale, y: centerY + 20 * scale - open * 15 * scale };
        }
        calculatedAngle = Math.round(135 + open * 35);
        angleJoint = { x: chest.x, y: chest.y };
        angleJointName = 'Thoracic Opening';
        phaseLabel = open > 0.7 ? 'Pectoral Expansion' : 'Gentle Inhale';
      } else if (exId === 'health_morning_flow') {
        // Sun Salutation Flow: Reach overhead to forward fold
        const flowT = (t * 0.8) % 4; // 4-second flow
        if (flowT < 2) {
          // Reaching overhead
          const reach = flowT / 2;
          lHand = { x: centerX - 30 * scale, y: centerY - 140 * scale - reach * 40 * scale };
          rHand = { x: centerX + 30 * scale, y: centerY - 140 * scale - reach * 40 * scale };
          calculatedAngle = Math.round(120 + reach * 60);
          angleJoint = { x: chest.x, y: chest.y };
          angleJointName = 'Overhead Reach';
          phaseLabel = 'Sun Salute Inhale';
        } else {
          // Hinging into forward fold
          const fold = (flowT - 2) / 2;
          head.y += fold * 120 * scale;
          chest.y += fold * 100 * scale;
          lHand = { x: centerX - 25 * scale, y: centerY + 140 * scale };
          rHand = { x: centerX + 25 * scale, y: centerY + 140 * scale };
          calculatedAngle = Math.round(180 - fold * 110);
          angleJoint = { x: pelvis.x, y: pelvis.y };
          angleJointName = 'Forward Hinge';
          phaseLabel = 'Standing Forward Fold';
        }
      } else if (exId === 'health_diaphragmatic_breath') {
        // 360 Diaphragmatic Breath Expansion
        const breathWave = (Math.sin(t * 2) + 1) / 2;
        lHand = { x: centerX - 20 * scale - breathWave * 10 * scale, y: centerY - 40 * scale };
        rHand = { x: centerX + 20 * scale + breathWave * 10 * scale, y: centerY + 10 * scale };
        calculatedAngle = Math.round(90 + breathWave * 30);
        angleJoint = { x: chest.x, y: chest.y };
        angleJointName = 'Ribcage 360° Expansion';
        phaseLabel = breathWave > 0.5 ? 'Diaphragmatic Inhale (Expand)' : 'Slow Exhale (Relax)';
      } else if (exId === 'health_seated_spinal_twist') {
        // Seated Spinal Twist
        const twistAngle = Math.sin(t * 2);
        const shiftX = twistAngle * 25 * scale;
        head.x += shiftX;
        chest.x += shiftX * 0.7;
        lHand = { x: centerX + shiftX - 30 * scale, y: centerY - 20 * scale };
        rHand = { x: centerX + shiftX + 45 * scale, y: centerY + 10 * scale };
        calculatedAngle = Math.round(90 + Math.abs(twistAngle) * 45);
        angleJoint = { x: chest.x, y: chest.y };
        angleJointName = 'Thoracic Rotation';
        phaseLabel = twistAngle > 0 ? 'Right Torso Twist' : 'Left Torso Twist';
      } else if (exId === 'hip_90_90') {
        // Seated 90/90 Hip Mobility Switches
        const hipSwitch = Math.sin(t * 2);
        const baseY = centerY + 30 * scale;

        head = { x: centerX, y: baseY - 120 * scale };
        chest = { x: centerX, y: baseY - 40 * scale };
        pelvis = { x: centerX, y: baseY + 30 * scale };

        if (hipSwitch > 0) {
          lKnee = { x: centerX - 70 * scale, y: baseY + 50 * scale };
          lAnkle = { x: centerX - 30 * scale, y: baseY + 85 * scale };
          rKnee = { x: centerX + 60 * scale, y: baseY + 60 * scale };
          rAnkle = { x: centerX + 110 * scale, y: baseY + 50 * scale };
        } else {
          rKnee = { x: centerX + 70 * scale, y: baseY + 50 * scale };
          rAnkle = { x: centerX + 30 * scale, y: baseY + 85 * scale };
          lKnee = { x: centerX - 60 * scale, y: baseY + 60 * scale };
          lAnkle = { x: centerX - 110 * scale, y: baseY + 50 * scale };
        }

        calculatedAngle = Math.round(90 + Math.abs(hipSwitch) * 15);
        angleJoint = { x: lKnee.x, y: lKnee.y };
        angleJointName = '90/90 Shinbox';
        phaseLabel = hipSwitch > 0 ? 'Right Internal / Left External' : 'Left Internal / Right External';
      } else if (exId === 'health_chin_tuck_cervical') {
        // Cervical Retraction
        const tuck = wave01;
        head = { x: centerX - tuck * 15 * scale, y: centerY - 140 * scale };
        calculatedAngle = Math.round(90 - tuck * 20);
        angleJoint = { x: neck.x, y: neck.y };
        angleJointName = 'Cervical Retraction';
        phaseLabel = tuck > 0.7 ? 'Axial Retraction (Hold)' : 'Neutral Alignment';
      } else if (exId === 'mobility_scapular_wall_slides') {
        // Scapular Wall Slides (W to Y reach)
        const slide = wave01;
        lElbow = { x: centerX - (65 - slide * 25) * scale, y: centerY - (50 + slide * 70) * scale };
        rElbow = { x: centerX + (65 - slide * 25) * scale, y: centerY - (50 + slide * 70) * scale };
        lHand = { x: centerX - (75 - slide * 35) * scale, y: centerY - (100 + slide * 70) * scale };
        rHand = { x: centerX + (75 - slide * 35) * scale, y: centerY - (100 + slide * 70) * scale };

        calculatedAngle = Math.round(75 + slide * 95);
        angleJoint = { x: rShoulder.x, y: rShoulder.y };
        angleJointName = 'Scapular Upward Rotation';
        phaseLabel = slide > 0.8 ? 'Peak Overhead Y-Reach' : 'W-Position Scapular Retract';
      } else {
        // General Dynamic Movement Flow
        const sway = Math.sin(t * 2.5) * 15 * scale;
        const armReach = wave01;

        head.x += sway * 0.4;
        chest.x += sway * 0.2;
        lHand = { x: centerX - 70 * scale - sway, y: centerY - (10 + armReach * 60) * scale };
        rHand = { x: centerX + 70 * scale + sway, y: centerY - (10 + armReach * 60) * scale };
        calculatedAngle = Math.round(110 + armReach * 60);
        angleJoint = { x: rShoulder.x, y: rShoulder.y };
        angleJointName = 'Range of Motion';
        phaseLabel = armReach > 0.5 ? 'Full Extension' : 'Controlled Recovery';
      }

      setLiveAngle(calculatedAngle);
      setCurrentPhase(phaseLabel);

      /* =========================================================================
         1. TARGET MUSCLE ACTIVATION GLOWS
         ========================================================================= */
      if (showMuscles) {
        ctx.save();
        const muscleColor = categoryDef.color || '#c5a059';
        const pulse = (Math.sin(t * 5) + 1) / 2;

        const drawMuscleGlow = (p1: { x: number; y: number }, p2: { x: number; y: number }, radius: number) => {
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const grad = ctx.createRadialGradient(midX, midY, 2, midX, midY, radius);
          grad.addColorStop(0, `${muscleColor}${Math.round(180 + pulse * 75).toString(16).padStart(2, '0')}`);
          grad.addColorStop(0.5, `${muscleColor}66`);
          grad.addColorStop(1, `${muscleColor}00`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(midX, midY, radius, 0, Math.PI * 2);
          ctx.fill();
        };

        // Core / Abdominal glow
        drawMuscleGlow(chest, pelvis, 38 * scale);
        // Leg muscles
        drawMuscleGlow(lHip, lKnee, 26 * scale);
        drawMuscleGlow(rHip, rKnee, 26 * scale);
        // Shoulder / Deltoids
        drawMuscleGlow(lShoulder, lElbow, 22 * scale);
        drawMuscleGlow(rShoulder, rElbow, 22 * scale);

        ctx.restore();
      }

      /* =========================================================================
         2. DRAW VECTOR BONE SEGMENTS (Biomechanical Kinetic Skeleton)
         ========================================================================= */
      const drawBone = (p1: { x: number; y: number }, p2: { x: number; y: number }, color = '#ffffff', width = 4) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      };

      // Spine & Torso
      drawBone(head, neck, '#e4e4e7', 6);
      drawBone(neck, chest, '#e4e4e7', 7);
      drawBone(chest, pelvis, '#c5a059', 8);

      // Shoulders & Collarbone
      drawBone(neck, lShoulder, '#a1a1aa', 5);
      drawBone(neck, rShoulder, '#a1a1aa', 5);

      // Arms
      drawBone(lShoulder, lElbow, '#38bdf8', 5);
      drawBone(lElbow, lHand, '#38bdf8', 4);
      drawBone(rShoulder, rElbow, '#38bdf8', 5);
      drawBone(rElbow, rHand, '#38bdf8', 4);

      // Pelvis & Legs
      drawBone(pelvis, lHip, '#c5a059', 6);
      drawBone(pelvis, rHip, '#c5a059', 6);
      drawBone(lHip, lKnee, '#34d399', 6);
      drawBone(lKnee, lAnkle, '#34d399', 5);
      drawBone(rHip, rKnee, '#34d399', 6);
      drawBone(rKnee, rAnkle, '#34d399', 5);

      /* =========================================================================
         3. DRAW JOINT NODES
         ========================================================================= */
      const joints = [
        head, neck, chest, pelvis,
        lShoulder, rShoulder, lElbow, rElbow, lHand, rHand,
        lHip, rHip, lKnee, rKnee, lAnkle, rAnkle,
      ];

      joints.forEach((joint, idx) => {
        const isHead = idx === 0;
        const radius = (isHead ? 16 : 5.5) * scale;

        ctx.fillStyle = isHead ? '#ffffff' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(joint.x, joint.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#09090e';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
      });

      /* =========================================================================
         4. BIOMECHANICAL ANGLE OVERLAY PROTRACTOR
         ========================================================================= */
      if (showAngles) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(angleJoint.x, angleJoint.y, 28 * scale, 0, Math.PI * 0.7);
        ctx.stroke();
        ctx.setLineDash([]);

        // Angle Badge Callout
        ctx.fillStyle = 'rgba(14, 14, 22, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        const badgeW = 95 * scale;
        const badgeH = 24 * scale;
        const badgeX = angleJoint.x + 18 * scale;
        const badgeY = angleJoint.y - 12 * scale;

        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = `bold ${Math.round(11 * scale)}px "JetBrains Mono", monospace`;
        ctx.fillText(`∠ ${calculatedAngle}° (${angleJointName.split(' ')[0]})`, badgeX + 6 * scale, badgeY + 16 * scale);
        ctx.restore();
      }

      /* =========================================================================
         5. HUD ON-CANVAS EXERCISE TITLE TAG
         ========================================================================= */
      ctx.save();
      ctx.fillStyle = 'rgba(10, 10, 18, 0.75)';
      ctx.strokeStyle = '#28283c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20 * scale, height - 48 * scale, 280 * scale, 34 * scale, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c5a059';
      ctx.font = `bold ${Math.round(12 * scale)}px system-ui, sans-serif`;
      ctx.fillText(exercise.name, 32 * scale, height - 26 * scale);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [exercise, isPlaying, playbackSpeed, showAngles, showGrid, showMuscles, categoryDef.color]);

  return (
    <div className="relative w-full rounded-md overflow-hidden bg-[#09090f] border border-[#222230] shadow-xl flex flex-col select-none">
      {/* Simulation Top Bar - Clearly showing matched Exercise Name */}
      <div className="px-3.5 py-2.5 bg-[#12121c] border-b border-[#20202c] flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold tracking-wide">
              {exercise.name}
            </span>
            <span className="text-[#888] hidden md:inline">|</span>
            <span className="px-1.5 py-0.5 rounded-xs bg-[#1f1f2e] border border-[#333] text-[10px] text-[#c5a059] hidden sm:inline">
              {categoryDef.shortLabel} Kinematics
            </span>
          </div>
        </div>

        {/* Real-time Telemetry Cues */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
          <div className="flex items-center gap-1 text-[#38bdf8]">
            <Compass className="w-3.5 h-3.5" />
            <span>Angle: <strong>{liveAngle}°</strong></span>
          </div>

          <div className="flex items-center gap-1 text-[#34d399] hidden sm:flex">
            <Activity className="w-3.5 h-3.5" />
            <span>Phase: <strong>{currentPhase}</strong></span>
          </div>

          <div className="flex items-center gap-1 text-[#fbbf24]">
            <Flame className="w-3.5 h-3.5" />
            <span>Reps: <strong>{repCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full max-h-[480px]">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          className="w-full h-full object-contain"
        />

        {/* Live Form Safety Badge Overlay */}
        <div className="absolute top-3 left-3 bg-[#0e0e18]/90 border border-[#2a2a3c] backdrop-blur-md p-2.5 rounded-sm shadow-lg max-w-[260px] hidden sm:block">
          <div className="text-[10px] font-mono text-[#c5a059] uppercase font-bold flex items-center gap-1 mb-0.5">
            <Sparkles className="w-3 h-3 text-[#c5a059]" />
            Target Biomechanics
          </div>
          <p className="text-[11px] text-[#d4d4d8] font-sans leading-tight">
            {exercise.biomechanicsAngle || 'Controlled tempo, neutral spine alignment.'}
          </p>
        </div>

        {/* Muscle Focus Overlay Tag */}
        <div className="absolute top-3 right-3 bg-[#0e0e18]/90 border border-[#2a2a3c] backdrop-blur-md px-2.5 py-1.5 rounded-sm shadow-lg text-right">
          <div className="text-[9px] font-mono text-[#888]">TARGET MUSCLES</div>
          <div className="text-xs font-mono font-bold text-[#c5a059]">
            {exercise.primaryMuscles.slice(0, 3).join(' • ')}
          </div>
        </div>

        {/* Play/Pause Center Indicator on Click */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 group"
          aria-label={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
        >
          <div className="w-14 h-14 rounded-full bg-[#0c0c14]/90 border border-[#c5a059]/60 flex items-center justify-center text-[#c5a059] shadow-2xl group-hover:scale-110 transition-transform">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </div>
        </button>
      </div>

      {/* Video-Style Player Controls & Scrubber */}
      <div className="p-3 bg-[#101018] border-t border-[#20202c] space-y-2">
        {/* Scrubber Progress Bar & Timestamp */}
        <div className="space-y-1">
          <div
            ref={scrubberRef}
            onMouseDown={handleMouseDownScrub}
            className="w-full bg-[#1c1c28] hover:bg-[#252538] h-2.5 rounded-full overflow-hidden relative cursor-pointer group transition-all"
            title="Click or drag to seek anywhere in the exercise simulation"
          >
            <div
              className="h-full bg-gradient-to-r from-[#c5a059] via-[#fbbf24] to-[#f59e0b] transition-all duration-75 relative"
              style={{ width: `${(scrubberTime / 4) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-[#c5a059] scale-0 group-hover:scale-100 transition-transform" />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#777]">
            <span className="text-[#c5a059] font-bold">
              0:0{Math.floor(scrubberTime)} / 0:04s
            </span>
            <span className="text-[#888]">
              {scrubberTime < 1.0 ? 'Phase 1: Setup' : scrubberTime < 2.5 ? 'Phase 2: Execution' : 'Phase 3: Recovery'}
            </span>
          </div>
        </div>

        {/* Control Buttons Row */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="px-3 py-1.5 rounded-xs bg-[#c5a059] hover:bg-[#d4b069] text-black font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                elapsedRef.current = 0;
                setScrubberTime(0);
                setRepCount(0);
              }}
              className="p-1.5 rounded-xs bg-[#1a1a26] hover:bg-[#222234] border border-[#2e2e40] text-[#aaa] hover:text-white transition-colors cursor-pointer"
              title="Reset animation to start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-[#151522] border border-[#262638] rounded-xs p-0.5">
              {[0.5, 1.0, 1.5, 2.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-1.5 py-0.5 text-[10px] rounded-xs transition-colors cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-[#c5a059] text-black font-bold'
                      : 'text-[#888] hover:text-white'
                  }`}
                  title={`${speed}x playback speed`}
                >
                  {speed === 2.5 ? '⚡ 2.5x' : `${speed}x`}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches: Angle overlay, Grid, Muscle Glow */}
          <div className="flex items-center gap-2 text-[11px]">
            <button
              onClick={() => setShowAngles(!showAngles)}
              className={`px-2 py-1 rounded-xs border transition-colors flex items-center gap-1 cursor-pointer ${
                showAngles
                  ? 'bg-[#182030] border-[#38bdf8] text-[#38bdf8]'
                  : 'bg-[#14141e] border-[#262636] text-[#666]'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>Angles</span>
            </button>

            <button
              onClick={() => setShowMuscles(!showMuscles)}
              className={`px-2 py-1 rounded-xs border transition-colors flex items-center gap-1 cursor-pointer ${
                showMuscles
                  ? 'bg-[#282018] border-[#c5a059] text-[#c5a059]'
                  : 'bg-[#14141e] border-[#262636] text-[#666]'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Muscles</span>
            </button>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-1 rounded-xs border transition-colors flex items-center gap-1 hidden sm:flex cursor-pointer ${
                showGrid
                  ? 'bg-[#18241e] border-[#34d399] text-[#34d399]'
                  : 'bg-[#14141e] border-[#262636] text-[#666]'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
