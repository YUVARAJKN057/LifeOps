import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Maximize2,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  Compass,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Zap,
  Video,
  FastForward,
  Flame,
} from 'lucide-react';
import { ExerciseGuide } from '../../types';

interface Exercise3DCanvasProps {
  exercise: ExerciseGuide;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  speed?: number;
  highlightMuscles?: boolean;
}

export const Exercise3DCanvas: React.FC<Exercise3DCanvasProps> = ({
  exercise,
  isPlaying = true,
  onTogglePlay,
  speed = 1,
  highlightMuscles = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrubberTrackRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const timeAccumulatorRef = useRef<number>(0);

  // Model & FX references
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const particlePointsRef = useRef<THREE.Points | null>(null);
  const pulseRingRef = useRef<THREE.Mesh | null>(null);
  const underGlowLightRef = useRef<THREE.PointLight | null>(null);

  const jointsRef = useRef<{
    torso?: THREE.Mesh;
    chest?: THREE.Mesh;
    head?: THREE.Mesh;
    leftUpperArm?: THREE.Group;
    leftForearm?: THREE.Group;
    rightUpperArm?: THREE.Group;
    rightForearm?: THREE.Group;
    leftThigh?: THREE.Group;
    leftShin?: THREE.Group;
    rightThigh?: THREE.Group;
    rightShin?: THREE.Group;
    pelvis?: THREE.Mesh;
    floorGrid?: THREE.GridHelper;
  }>({});

  // View & Camera angles
  const [cameraPreset, setCameraPreset] = useState<'perspective' | 'front' | 'side' | 'top'>('perspective');
  const [isOrbiting, setIsOrbiting] = useState<boolean>(false);
  const [isAutoOrbiting, setIsAutoOrbiting] = useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(speed || 1);
  const [scrubberTime, setScrubberTime] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [turboFX, setTurboFX] = useState<boolean>(true);

  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationEulerRef = useRef<{ x: number; y: number }>({ x: 0.2, y: -0.4 });
  const zoomDistanceRef = useRef<number>(6.5);

  // Seek logic for 3D simulation
  const handleSeek3D = (clientX: number) => {
    if (!scrubberTrackRef.current) return;
    const rect = scrubberTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetSeconds = ratio * 4.0;
    timeAccumulatorRef.current = targetSeconds;
    setScrubberTime(targetSeconds);
  };

  const handleMouseDownScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleSeek3D(e.clientX);
  };

  useEffect(() => {
    const handleMouseMoveWindow = (e: MouseEvent) => {
      if (isScrubbing) {
        handleSeek3D(e.clientX);
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
  const [currentCadenceBeat, setCurrentCadenceBeat] = useState<string>('Moving');

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c);
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.04);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.8, 2.2, 5.5);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xe8d090, 2.2);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    const underGlow = new THREE.PointLight(0xc5a059, 1.8, 8);
    underGlow.position.set(0, 0.2, 0);
    scene.add(underGlow);
    underGlowLightRef.current = underGlow;

    // Grid Floor
    const grid = new THREE.GridHelper(10, 20, 0xc5a059, 0x222226);
    grid.position.y = 0;
    scene.add(grid);

    // Pedestal Ring
    const ringGeo = new THREE.RingGeometry(1.6, 1.64, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc5a059, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    // Dynamic Expanding Rep Pulse Wave Ring
    const pulseRingGeo = new THREE.RingGeometry(0.3, 0.36, 48);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRing.rotation.x = Math.PI / 2;
    pulseRing.position.y = 0.02;
    scene.add(pulseRing);
    pulseRingRef.current = pulseRing;

    // 3D Kinetic Aura Particle System (Glowing Energy Constellation)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.5 + Math.random() * 1.5;
      const angle = Math.random() * Math.PI * 2;
      const y = Math.random() * 2.2;
      posArray[i * 3] = Math.cos(angle) * radius;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = Math.sin(angle) * radius;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);
    particlePointsRef.current = particlePoints;

    // Build 3D Mannequin Character Model
    const charGroup = new THREE.Group();
    scene.add(charGroup);
    characterGroupRef.current = charGroup;

    // Materials
    const jointColor = 0xd4af37;
    const bodyColor = 0x242730;
    const muscleGlowColor = 0xf59e0b;

    const jointMat = new THREE.MeshStandardMaterial({
      color: jointColor,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x443311,
      emissiveIntensity: 0.3,
    });

    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      metalness: 0.3,
      roughness: 0.5,
    });

    const muscleMat = new THREE.MeshStandardMaterial({
      color: muscleGlowColor,
      metalness: 0.5,
      roughness: 0.2,
      emissive: muscleGlowColor,
      emissiveIntensity: 0.6,
    });

    // Helper: Create capsule/cylinder bone
    const createBone = (radiusTop: number, radiusBottom: number, height: number, mat: THREE.Material = bodyMat) => {
      const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 16);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      return mesh;
    };

    const createJointSphere = (radius: number, mat: THREE.Material = jointMat) => {
      const geo = new THREE.SphereGeometry(radius, 16, 16);
      return new THREE.Mesh(geo, mat);
    };

    // PELVIS & ROOT
    const pelvis = createJointSphere(0.18, jointMat);
    pelvis.position.y = 1.05;
    charGroup.add(pelvis);

    // TORSO & CHEST
    const spineBone = createBone(0.16, 0.14, 0.45, highlightMuscles ? muscleMat : bodyMat);
    spineBone.position.y = 0.25;
    pelvis.add(spineBone);

    const chestJoint = createJointSphere(0.2, jointMat);
    chestJoint.position.y = 0.5;
    pelvis.add(chestJoint);

    // HEAD & NECK
    const neck = createBone(0.06, 0.06, 0.12, bodyMat);
    neck.position.y = 0.18;
    chestJoint.add(neck);

    const headGeo = new THREE.SphereGeometry(0.16, 20, 20);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 0.32;
    chestJoint.add(head);

    // Visor eye band for 3D model
    const visorGeo = new THREE.BoxGeometry(0.24, 0.06, 0.18);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.33, 0.08);
    chestJoint.add(visor);

    // LEFT ARM
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.28, 0.08, 0);
    chestJoint.add(leftShoulder);
    leftShoulder.add(createJointSphere(0.1, jointMat));

    const leftUpperArmBone = createBone(0.08, 0.07, 0.32, highlightMuscles ? muscleMat : bodyMat);
    leftUpperArmBone.position.y = -0.18;
    leftShoulder.add(leftUpperArmBone);

    const leftElbow = new THREE.Group();
    leftElbow.position.y = -0.34;
    leftShoulder.add(leftElbow);
    leftElbow.add(createJointSphere(0.08, jointMat));

    const leftForearmBone = createBone(0.065, 0.05, 0.3, bodyMat);
    leftForearmBone.position.y = -0.16;
    leftElbow.add(leftForearmBone);

    // RIGHT ARM
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.28, 0.08, 0);
    chestJoint.add(rightShoulder);
    rightShoulder.add(createJointSphere(0.1, jointMat));

    const rightUpperArmBone = createBone(0.08, 0.07, 0.32, highlightMuscles ? muscleMat : bodyMat);
    rightUpperArmBone.position.y = -0.18;
    rightShoulder.add(rightUpperArmBone);

    const rightElbow = new THREE.Group();
    rightElbow.position.y = -0.34;
    rightShoulder.add(rightElbow);
    rightElbow.add(createJointSphere(0.08, jointMat));

    const rightForearmBone = createBone(0.065, 0.05, 0.3, bodyMat);
    rightForearmBone.position.y = -0.16;
    rightElbow.add(rightForearmBone);

    // LEFT LEG
    const leftHip = new THREE.Group();
    leftHip.position.set(-0.16, -0.05, 0);
    pelvis.add(leftHip);
    leftHip.add(createJointSphere(0.11, jointMat));

    const leftThighBone = createBone(0.1, 0.08, 0.44, highlightMuscles ? muscleMat : bodyMat);
    leftThighBone.position.y = -0.24;
    leftHip.add(leftThighBone);

    const leftKnee = new THREE.Group();
    leftKnee.position.y = -0.48;
    leftHip.add(leftKnee);
    leftKnee.add(createJointSphere(0.09, jointMat));

    const leftShinBone = createBone(0.075, 0.06, 0.44, bodyMat);
    leftShinBone.position.y = -0.24;
    leftKnee.add(leftShinBone);

    // RIGHT LEG
    const rightHip = new THREE.Group();
    rightHip.position.set(0.16, -0.05, 0);
    pelvis.add(rightHip);
    rightHip.add(createJointSphere(0.11, jointMat));

    const rightThighBone = createBone(0.1, 0.08, 0.44, highlightMuscles ? muscleMat : bodyMat);
    rightThighBone.position.y = -0.24;
    rightHip.add(rightThighBone);

    const rightKnee = new THREE.Group();
    rightKnee.position.y = -0.48;
    rightHip.add(rightKnee);
    rightKnee.add(createJointSphere(0.09, jointMat));

    const rightShinBone = createBone(0.075, 0.06, 0.44, bodyMat);
    rightShinBone.position.y = -0.24;
    rightKnee.add(rightShinBone);

    jointsRef.current = {
      torso: spineBone,
      chest: chestJoint,
      head,
      pelvis,
      leftUpperArm: leftShoulder,
      leftForearm: leftElbow,
      rightUpperArm: rightShoulder,
      rightForearm: rightElbow,
      leftThigh: leftHip,
      leftShin: leftKnee,
      rightThigh: rightHip,
      rightShin: rightKnee,
    };

    // Resize listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
    };
  }, [exercise.id, highlightMuscles]);

  // Main 3D Animation Engine Loop
  useEffect(() => {
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const activeSpeed = currentSpeed;
      if (isPlaying && !isScrubbing) {
        timeAccumulatorRef.current += delta * activeSpeed;
        setScrubberTime(timeAccumulatorRef.current % 4.0);
      }

      const t = timeAccumulatorRef.current;
      const j = jointsRef.current;
      const charGroup = characterGroupRef.current;

      // 1. Dynamic Kinetic Aura Particles
      if (particlePointsRef.current && turboFX) {
        const pPositions = particlePointsRef.current.geometry.attributes.position;
        const pArr = pPositions.array as Float32Array;
        const spinRate = delta * (currentSpeed >= 2.0 ? 3.5 : 1.5);
        for (let i = 0; i < pArr.length; i += 3) {
          const px = pArr[i];
          const pz = pArr[i + 2];
          pArr[i] = px * Math.cos(spinRate) - pz * Math.sin(spinRate);
          pArr[i + 2] = px * Math.sin(spinRate) + pz * Math.cos(spinRate);
          pArr[i + 1] += delta * 0.45 * currentSpeed;
          if (pArr[i + 1] > 2.4) {
            pArr[i + 1] = 0.05;
          }
        }
        pPositions.needsUpdate = true;
      }

      // 2. Dynamic Expanding Rep Pulse Ring
      if (pulseRingRef.current) {
        const pulseCycle = (t * 2.8) % (Math.PI * 2);
        const waveProgress = (Math.sin(pulseCycle) + 1) / 2;
        const scaleVal = 1.0 + waveProgress * 2.6;
        pulseRingRef.current.scale.set(scaleVal, scaleVal, 1);
        (pulseRingRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0.1, 0.8 - waveProgress * 0.65);
      }

      // 3. Dynamic Underglow Light Pulse
      if (underGlowLightRef.current) {
        underGlowLightRef.current.intensity = 1.2 + Math.sin(t * 3.5) * 0.6;
      }

      // 4. Auto-Orbit Cinematic Sweep
      if (isAutoOrbiting && cameraPreset === 'perspective') {
        rotationEulerRef.current.y += delta * 0.45 * Math.min(1.5, currentSpeed);
      }

      if (j.pelvis && charGroup) {
        // Compute cyclic motion curves (0 to 1)
        const cycle = (Math.sin(t * 2.8) + 1) / 2; // 0 to 1 to 0
        const rapidCycle = (Math.sin(t * 6) + 1) / 2;
        const sineWave = Math.sin(t * 3);

        // Baseline neutral posture reset before calculating instantaneous kinematics
        charGroup.position.set(0, 0, 0);
        charGroup.rotation.set(0, 0, 0);
        if (j.chest) j.chest.rotation.set(0, 0, 0);
        if (j.head) j.head.rotation.set(0, 0, 0);
        if (j.leftUpperArm) j.leftUpperArm.rotation.set(0, 0, 0);
        if (j.leftForearm) j.leftForearm.rotation.set(0, 0, 0);
        if (j.rightUpperArm) j.rightUpperArm.rotation.set(0, 0, 0);
        if (j.rightForearm) j.rightForearm.rotation.set(0, 0, 0);
        if (j.leftThigh) j.leftThigh.rotation.set(0, 0, 0);
        if (j.leftShin) j.leftShin.rotation.set(0, 0, 0);
        if (j.rightThigh) j.rightThigh.rotation.set(0, 0, 0);
        if (j.rightShin) j.rightShin.rotation.set(0, 0, 0);

        // Movement Kinematics per Exercise Type
        switch (exercise.id) {
          /* -----------------------------------------------------------------
             1. SKIPPING & ROPE DYNAMICS
             ----------------------------------------------------------------- */
          case 'skipping':
          case 'boxer_skipping': {
            const isBoxer = exercise.id === 'boxer_skipping';
            const jumpY = Math.abs(Math.sin(t * (isBoxer ? 7 : 8))) * 0.22;
            const footSway = isBoxer ? Math.sin(t * 3.5) * 0.15 : 0;
            charGroup.position.set(footSway, jumpY, 0);

            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(0.3, 0, -0.4);
              j.rightUpperArm.rotation.set(0.3, 0, 0.4);
            }
            if (j.leftForearm && j.rightForearm) {
              j.leftForearm.rotation.set(-1.1 + Math.sin(t * 8) * 0.3, 0, Math.cos(t * 8) * 0.3);
              j.rightForearm.rotation.set(-1.1 + Math.sin(t * 8) * 0.3, 0, -Math.cos(t * 8) * 0.3);
            }
            if (j.leftThigh && j.rightThigh) {
              if (isBoxer) {
                j.leftThigh.rotation.set(0.1 + Math.sin(t * 3.5) * 0.2, 0, 0);
                j.rightThigh.rotation.set(0.1 - Math.sin(t * 3.5) * 0.2, 0, 0);
              } else {
                j.leftThigh.rotation.set(0.1, 0, 0);
                j.rightThigh.rotation.set(0.1, 0, 0);
              }
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(0.25 - jumpY * 0.8, 0, 0);
              j.rightShin.rotation.set(0.25 - jumpY * 0.8, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             2. JUMPING JACKS & STAR JUMPS
             ----------------------------------------------------------------- */
          case 'kids_star_jumps':
          case 'jumping_jack': {
            const jumpY = Math.abs(Math.sin(t * 3.5)) * 0.35;
            charGroup.position.set(0, jumpY, 0);
            const spread = (Math.sin(t * 3.5) + 1) / 2; // 0 to 1

            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.z = -0.3 - spread * 2.5; // reaches overhead
              j.rightUpperArm.rotation.z = 0.3 + spread * 2.5;
            }
            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.z = -spread * 0.45;
              j.rightThigh.rotation.z = spread * 0.45;
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set((1 - spread) * 0.35, 0, 0);
              j.rightShin.rotation.set((1 - spread) * 0.35, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             3. FROG HOPS (Kids explosive agility)
             ----------------------------------------------------------------- */
          case 'kids_frog_hops': {
            const frogPhase = (Math.sin(t * 2.5) + 1) / 2; // 0 (crouch) to 1 (leap peak)
            const jumpY = frogPhase > 0.4 ? (frogPhase - 0.4) * 0.8 : 0;
            const crouchY = frogPhase <= 0.4 ? (0.4 - frogPhase) * -0.6 : 0;
            charGroup.position.set(0, jumpY + crouchY, 0);

            if (frogPhase < 0.4) {
              // Deep crouch: hands touch floor
              if (j.leftThigh && j.rightThigh) {
                j.leftThigh.rotation.set(-1.6, 0, -0.4);
                j.rightThigh.rotation.set(-1.6, 0, 0.4);
              }
              if (j.leftShin && j.rightShin) {
                j.leftShin.rotation.set(1.8, 0, 0);
                j.rightShin.rotation.set(1.8, 0, 0);
              }
              if (j.leftUpperArm && j.rightUpperArm) {
                j.leftUpperArm.rotation.set(-0.8, 0, -0.2);
                j.rightUpperArm.rotation.set(-0.8, 0, 0.2);
              }
            } else {
              // Explosive leap: arms overhead
              if (j.leftThigh && j.rightThigh) {
                j.leftThigh.rotation.set(0.1, 0, -0.2);
                j.rightThigh.rotation.set(0.1, 0, 0.2);
              }
              if (j.leftShin && j.rightShin) {
                j.leftShin.rotation.set(0.1, 0, 0);
                j.rightShin.rotation.set(0.1, 0, 0);
              }
              if (j.leftUpperArm && j.rightUpperArm) {
                j.leftUpperArm.rotation.set(-2.5, 0, -0.3);
                j.rightUpperArm.rotation.set(-2.5, 0, 0.3);
              }
            }
            break;
          }

          /* -----------------------------------------------------------------
             4. NINJA CRAB TOE KICKS (Kids reverse tabletop agility)
             ----------------------------------------------------------------- */
          case 'kids_crab_kicks': {
            const crabFreq = 2.4;
            const kickCycle = Math.sin(t * crabFreq); // -1 (left kick/right tap) to +1 (right kick/left tap)
            const absCycle = Math.abs(kickCycle);
            const kickProgress = Math.sin(absCycle * Math.PI * 0.5);

            charGroup.position.set(0, -0.42, 0);
            charGroup.rotation.set(-Math.PI / 3.4, 0, 0); // Reverse tabletop bridge tilt

            if (kickCycle >= 0) {
              // Right Leg kicks high & Left Arm reaches up to tap
              if (j.leftThigh && j.rightThigh) {
                j.leftThigh.rotation.set(1.4, 0, -0.15); // Supporting bent leg
                j.rightThigh.rotation.set(1.4 * (1 - kickProgress) + -0.8 * kickProgress, 0, 0.1); // Kicking leg
              }
              if (j.leftShin && j.rightShin) {
                j.leftShin.rotation.set(-1.45, 0, 0); // Planted foot
                j.rightShin.rotation.set(-1.45 * (1 - kickProgress) + -0.1 * kickProgress, 0, 0); // Extended kick
              }
              if (j.leftUpperArm && j.rightUpperArm) {
                j.rightUpperArm.rotation.set(-0.85, 0, 0.2); // Supporting arm planted back
                j.leftUpperArm.rotation.set(-0.85 * (1 - kickProgress) + 1.25 * kickProgress, 0, -0.35 * kickProgress); // Reaching arm
              }
              if (j.leftForearm && j.rightForearm) {
                j.rightForearm.rotation.set(0, 0, 0);
                j.leftForearm.rotation.set(-0.4 * kickProgress, 0, 0);
              }
            } else {
              // Left Leg kicks high & Right Arm reaches up to tap
              if (j.leftThigh && j.rightThigh) {
                j.rightThigh.rotation.set(1.4, 0, 0.15); // Supporting bent leg
                j.leftThigh.rotation.set(1.4 * (1 - kickProgress) + -0.8 * kickProgress, 0, -0.1); // Kicking leg
              }
              if (j.leftShin && j.rightShin) {
                j.rightShin.rotation.set(-1.45, 0, 0);
                j.leftShin.rotation.set(-1.45 * (1 - kickProgress) + -0.1 * kickProgress, 0, 0);
              }
              if (j.leftUpperArm && j.rightUpperArm) {
                j.leftUpperArm.rotation.set(-0.85, 0, -0.2);
                j.rightUpperArm.rotation.set(-0.85 * (1 - kickProgress) + 1.25 * kickProgress, 0, 0.35 * kickProgress);
              }
              if (j.leftForearm && j.rightForearm) {
                j.leftForearm.rotation.set(0, 0, 0);
                j.rightForearm.rotation.set(-0.4 * kickProgress, 0, 0);
              }
            }
            break;
          }

          /* -----------------------------------------------------------------
             5. FLAMINGO & TANDEM BALANCE
             ----------------------------------------------------------------- */
          case 'kids_flamingo_balance':
          case 'senior_tandem_balance': {
            const isTandem = exercise.id === 'senior_tandem_balance';
            charGroup.position.set(0, 0, 0);
            charGroup.rotation.set(0, 0, Math.sin(t * 1.5) * 0.025);

            if (isTandem) {
              // Heel-to-toe stance
              if (j.leftThigh && j.rightThigh) {
                j.leftThigh.rotation.set(-0.15, 0, 0);
                j.rightThigh.rotation.set(0.2, 0, 0);
              }
              if (j.leftUpperArm && j.rightUpperArm) {
                j.leftUpperArm.rotation.z = -0.8 + Math.sin(t * 2) * 0.05;
                j.rightUpperArm.rotation.z = 0.8 - Math.sin(t * 2) * 0.05;
              }
            } else {
              // High flamingo lifted knee
              if (j.rightThigh) {
                j.rightThigh.rotation.set(-1.2, 0, 0.3);
              }
              if (j.rightShin) {
                j.rightShin.rotation.set(1.5, 0, 0);
              }
              if (j.leftUpperArm && j.rightUpperArm) {
                j.leftUpperArm.rotation.z = -1.3 + Math.sin(t * 2) * 0.08;
                j.rightUpperArm.rotation.z = 1.3 - Math.sin(t * 2) * 0.08;
              }
            }
            break;
          }

          /* -----------------------------------------------------------------
             6. CAT-COW & CAT-CAMEL SPINAL MOBILITY
             ----------------------------------------------------------------- */
          case 'cat_camel_flow': {
            charGroup.position.set(0, -0.45, 0);
            charGroup.rotation.set(Math.PI / 2.15, 0, 0); // Quadruped table

            const wave = Math.sin(t * 2); // -1 (cat arch) to +1 (cow dip)
            if (j.chest) {
              j.chest.rotation.x = wave * 0.3;
            }
            if (j.head) {
              j.head.rotation.x = wave * 0.35;
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-1.55, 0, 0);
              j.rightUpperArm.rotation.set(-1.55, 0, 0);
            }
            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-1.5, 0, 0.2);
              j.rightThigh.rotation.set(-1.5, 0, -0.2);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(1.5, 0, 0);
              j.rightShin.rotation.set(1.5, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             7. SQUATS
             ----------------------------------------------------------------- */
          case 'squat': {
            const squatDepth = cycle; // 0 to 1
            charGroup.position.set(0, -squatDepth * 0.45, 0);
            charGroup.rotation.set(squatDepth * 0.25, 0, 0);

            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-squatDepth * 1.5, 0, -0.2);
              j.rightThigh.rotation.set(-squatDepth * 1.5, 0, 0.2);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(squatDepth * 1.7, 0, 0);
              j.rightShin.rotation.set(squatDepth * 1.7, 0, 0);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-squatDepth * 1.4, 0, 0);
              j.rightUpperArm.rotation.set(-squatDepth * 1.4, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             8. ANKLE ALPHABET
             ----------------------------------------------------------------- */
          case 'senior_ankle_alphabet': {
            charGroup.position.set(0, -0.4, 0); // seated chair
            charGroup.rotation.set(0, 0, 0);

            const pump = Math.sin(t * 4);
            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-1.4, 0, 0);
              j.rightThigh.rotation.set(-1.2, 0, 0);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(1.4, 0, 0);
              j.rightShin.rotation.set(0.8 + pump * 0.2, Math.sin(t * 2) * 0.2, 0); // active foot articulation
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-0.4, 0, 0);
              j.rightUpperArm.rotation.set(-0.4, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             9. SENIOR CHAIR STAND (Sit to Stand)
             ----------------------------------------------------------------- */
          case 'senior_chair_stand': {
            const standCycle = (Math.sin(t * 2.2) + 1) / 2; // 0 (sit) to 1 (stand)
            charGroup.position.set(0, (standCycle - 1) * 0.38, 0);
            charGroup.rotation.set((1 - standCycle) * 0.4, 0, 0);

            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-(1 - standCycle) * 1.5, 0, 0);
              j.rightThigh.rotation.set(-(1 - standCycle) * 1.5, 0, 0);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set((1 - standCycle) * 1.5, 0, 0);
              j.rightShin.rotation.set((1 - standCycle) * 1.5, 0, 0);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-(1 - standCycle) * 0.8, 0, 0);
              j.rightUpperArm.rotation.set(-(1 - standCycle) * 0.8, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             10. SENIOR WALL PUSHUPS
             ----------------------------------------------------------------- */
          case 'senior_wall_pushup': {
            const pushDepth = (Math.sin(t * 2.5) + 1) / 2; // 0 to 1
            charGroup.position.set(0, 0, pushDepth * 0.25);
            charGroup.rotation.set(-0.18, 0, 0); // slight forward lean

            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-1.4 + pushDepth * 0.6, 0, -0.4 * pushDepth);
              j.rightUpperArm.rotation.set(-1.4 + pushDepth * 0.6, 0, 0.4 * pushDepth);
            }
            if (j.leftForearm && j.rightForearm) {
              j.leftForearm.rotation.set(-pushDepth * 1.2, 0, 0);
              j.rightForearm.rotation.set(-pushDepth * 1.2, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             14. SENIOR NECK ROLLS & POSTURE
             ----------------------------------------------------------------- */
          case 'senior_neck_rolls': {
            charGroup.position.set(0, 0, 0);
            if (j.head) {
              j.head.rotation.set(Math.sin(t * 1.8) * 0.35, Math.cos(t * 1.8) * 0.4, Math.sin(t * 1.8) * 0.2);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(0.1, 0, -0.1);
              j.rightUpperArm.rotation.set(0.1, 0, 0.1);
            }
            break;
          }

          /* -----------------------------------------------------------------
             15. SENIOR SEATED LEG EXTENSION
             ----------------------------------------------------------------- */
          case 'senior_seated_leg_extension': {
            charGroup.position.set(0, -0.4, 0); // seated
            const extCycle = (Math.sin(t * 2.2) + 1) / 2; // 0 to 1

            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-1.4, 0, 0);
              j.rightThigh.rotation.set(-1.4, 0, 0);
            }
            if (j.leftShin) {
              j.leftShin.rotation.set(1.4, 0, 0);
            }
            if (j.rightShin) {
              j.rightShin.rotation.set(1.4 - extCycle * 1.35, 0, 0); // full straight extension
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-0.3, 0, 0);
              j.rightUpperArm.rotation.set(-0.3, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             16. DESK CHEST OPENER
             ----------------------------------------------------------------- */
          case 'health_desk_chest_opener': {
            const chestExpand = (Math.sin(t * 2) + 1) / 2;
            charGroup.position.set(0, 0, 0);

            if (j.chest) {
              j.chest.rotation.x = -chestExpand * 0.25; // opening arch
            }
            if (j.head) {
              j.head.rotation.x = -chestExpand * 0.2;
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(chestExpand * 0.6, 0, -chestExpand * 0.8);
              j.rightUpperArm.rotation.set(chestExpand * 0.6, 0, chestExpand * 0.8);
            }
            if (j.leftForearm && j.rightForearm) {
              j.leftForearm.rotation.set(-0.6, 0, 0);
              j.rightForearm.rotation.set(-0.6, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             17. HIP FLEXOR OPENER & LUNGE
             ----------------------------------------------------------------- */
          case 'health_hip_opener':
          case 'lunge': {
            const lungeDepth = cycle; // 0 to 1
            charGroup.position.set(0, -lungeDepth * 0.35, 0);

            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-lungeDepth * 1.5, 0, 0); // front leg 90 deg
              j.rightThigh.rotation.set(lungeDepth * 0.6, 0, 0); // trailing leg extended back
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(lungeDepth * 1.5, 0, 0);
              j.rightShin.rotation.set(lungeDepth * 1.5, 0, 0);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-lungeDepth * 1.2, 0, 0);
              j.rightUpperArm.rotation.set(-lungeDepth * 1.2, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             18. MORNING SPINAL FLOW (Sun Salutation wave)
             ----------------------------------------------------------------- */
          case 'health_morning_flow': {
            const flowWave = Math.sin(t * 1.8); // -1 (forward fold) to +1 (overhead reach)
            if (flowWave > 0) {
              // Overhead reach & back arch
              charGroup.rotation.x = -flowWave * 0.2;
              if (j.leftUpperArm && j.rightUpperArm) {
                j.leftUpperArm.rotation.set(-flowWave * 2.8, 0, -0.3);
                j.rightUpperArm.rotation.set(-flowWave * 2.8, 0, 0.3);
              }
            } else {
              // Forward fold down to toes
              const fold = Math.abs(flowWave);
              charGroup.rotation.x = fold * 1.2;
              if (j.leftUpperArm && j.rightUpperArm) {
                j.leftUpperArm.rotation.set(-fold * 0.8, 0, 0);
                j.rightUpperArm.rotation.set(-fold * 0.8, 0, 0);
              }
              if (j.leftThigh && j.rightThigh) {
                j.leftThigh.rotation.set(fold * 0.3, 0, 0);
                j.rightThigh.rotation.set(fold * 0.3, 0, 0);
              }
            }
            break;
          }

          /* -----------------------------------------------------------------
             19. DIAPHRAGMATIC BREATHING
             ----------------------------------------------------------------- */
          case 'health_diaphragmatic_breath': {
            charGroup.position.set(0, -0.85, 0);
            charGroup.rotation.set(Math.PI / 2.05, 0, 0); // supine flat on back

            const breathWave = (Math.sin(t * 1.5) + 1) / 2; // deep slow breathing
            if (j.chest) {
              j.chest.scale.set(1 + breathWave * 0.15, 1 + breathWave * 0.15, 1 + breathWave * 0.15);
            }
            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-1.2, 0, -0.2);
              j.rightThigh.rotation.set(-1.2, 0, 0.2);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(1.4, 0, 0);
              j.rightShin.rotation.set(1.4, 0, 0);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-0.4, 0, -0.3);
              j.rightUpperArm.rotation.set(-0.4, 0, 0.3);
            }
            if (j.leftForearm && j.rightForearm) {
              j.leftForearm.rotation.set(-0.6, 0, 0.6); // hands over belly
              j.rightForearm.rotation.set(-0.6, 0, -0.6);
            }
            break;
          }

          /* -----------------------------------------------------------------
             20. SEATED SPINAL TWIST
             ----------------------------------------------------------------- */
          case 'health_seated_spinal_twist': {
            charGroup.position.set(0, -0.4, 0); // seated
            const twistPhase = Math.sin(t * 1.8); // rotate left/right
            charGroup.rotation.y = twistPhase * 0.55;

            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-1.4, 0, 0);
              j.rightThigh.rotation.set(-1.4, 0, 0);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(1.4, 0, 0);
              j.rightShin.rotation.set(1.4, 0, 0);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-0.6 + twistPhase * 0.3, 0, -0.4);
              j.rightUpperArm.rotation.set(-0.6 - twistPhase * 0.3, 0, 0.4);
            }
            break;
          }

          /* -----------------------------------------------------------------
             21. STANDING CALF RAISES
             ----------------------------------------------------------------- */
          case 'health_standing_calf_raise': {
            const calfPeak = (Math.sin(t * 3) + 1) / 2; // 0 to 1
            charGroup.position.set(0, calfPeak * 0.18, 0); // rises high on toes

            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(-calfPeak * 0.3, 0, 0);
              j.rightShin.rotation.set(-calfPeak * 0.3, 0, 0);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-0.4, 0, -0.2);
              j.rightUpperArm.rotation.set(-0.4, 0, 0.2);
            }
            break;
          }

          /* -----------------------------------------------------------------
             21B. DOORFRAME PECTORAL STRETCH
             ----------------------------------------------------------------- */
          case 'health_doorframe_pec_stretch': {
            const pecStretch = (Math.sin(t * 2) + 1) / 2;
            charGroup.position.set(0, 0, pecStretch * 0.15); // lunging gently forward through door
            if (j.chest) {
              j.chest.rotation.x = -0.15;
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-1.4, 0, -1.2); // 90/90 cactus arm pinned to doorframe
              j.rightUpperArm.rotation.set(-1.4, 0, 1.2);
            }
            if (j.leftForearm && j.rightForearm) {
              j.leftForearm.rotation.set(-0.8, 0, 0);
              j.rightForearm.rotation.set(-0.8, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             21C. CERVICAL CHIN TUCKS
             ----------------------------------------------------------------- */
          case 'health_chin_tuck_cervical': {
            const tuck = (Math.sin(t * 2.5) + 1) / 2;
            if (j.head) {
              j.head.position.set(0, 0.65, -tuck * 0.08); // axial cervical retraction backward
              j.head.rotation.x = tuck * 0.2; // slight nodding chin tuck
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-0.3, 0, -0.2);
              j.rightUpperArm.rotation.set(-0.3, 0, 0.2);
            }
            break;
          }

          /* -----------------------------------------------------------------
             22. PUSH-UPS
             ----------------------------------------------------------------- */
          case 'pushup': {
            const pushDepth = (Math.sin(t * 2.8) + 1) / 2; // 0 (top) to 1 (bottom)
            charGroup.position.set(0, -0.5 - pushDepth * 0.28, 0);
            charGroup.rotation.set(Math.PI / 2.05, 0, 0); // prone plank

            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-0.8 - pushDepth * 0.9, 0, -0.5);
              j.rightUpperArm.rotation.set(-0.8 - pushDepth * 0.9, 0, 0.5);
            }
            if (j.leftForearm && j.rightForearm) {
              j.leftForearm.rotation.set(-pushDepth * 1.3, 0, 0);
              j.rightForearm.rotation.set(-pushDepth * 1.3, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             23. PLANK
             ----------------------------------------------------------------- */
          case 'plank': {
            charGroup.position.set(0, -0.5, 0);
            charGroup.rotation.set(Math.PI / 2.05, 0, 0); // prone rigid plank

            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-1.5, 0, 0);
              j.rightUpperArm.rotation.set(-1.5, 0, 0);
            }
            if (j.leftForearm && j.rightForearm) {
              j.leftForearm.rotation.set(-0.8, 0, 0.3);
              j.rightForearm.rotation.set(-0.8, 0, -0.3);
            }
            break;
          }

          /* -----------------------------------------------------------------
             24. SIDE PLANK
             ----------------------------------------------------------------- */
          case 'side_plank': {
            charGroup.position.set(0, -0.45, 0);
            charGroup.rotation.set(0, 0, Math.PI / 2.05); // lateral side stack

            if (j.leftUpperArm) {
              j.leftUpperArm.rotation.set(-1.55, 0, 0); // supporting arm
            }
            if (j.rightUpperArm) {
              j.rightUpperArm.rotation.set(Math.PI / 2, 0, 0); // top arm straight up to sky
            }
            break;
          }

          /* -----------------------------------------------------------------
             25. GLUTE BRIDGE
             ----------------------------------------------------------------- */
          case 'glute_bridge': {
            charGroup.position.set(0, -0.85, 0);
            charGroup.rotation.set(Math.PI / 2.05, 0, 0); // supine

            const bridgeUp = (Math.sin(t * 2.8) + 1) / 2; // 0 to 1
            if (j.pelvis) {
              j.pelvis.position.y = 1.05 + bridgeUp * 0.35; // hips drive up
            }
            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-1.4 + bridgeUp * 0.6, 0, -0.15);
              j.rightThigh.rotation.set(-1.4 + bridgeUp * 0.6, 0, 0.15);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(1.6 - bridgeUp * 0.4, 0, 0);
              j.rightShin.rotation.set(1.6 - bridgeUp * 0.4, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             26. DEAD BUG
             ----------------------------------------------------------------- */
          case 'dead_bug': {
            charGroup.position.set(0, -0.85, 0);
            charGroup.rotation.set(Math.PI / 2.05, 0, 0); // supine

            const limbDrive = Math.sin(t * 2.5); // alternating contralateral
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-1.55 - Math.max(0, limbDrive) * 0.9, 0, 0); // reaches overhead
              j.rightUpperArm.rotation.set(-1.55 - Math.max(0, -limbDrive) * 0.9, 0, 0);
            }
            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-1.4 + Math.max(0, -limbDrive) * 0.8, 0, 0);
              j.rightThigh.rotation.set(-1.4 + Math.max(0, limbDrive) * 0.8, 0, 0);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(1.4, 0, 0);
              j.rightShin.rotation.set(1.4, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             27. BIRD DOG (Core & Spinal Stabilizer)
             ----------------------------------------------------------------- */
          case 'bird_dog': {
            charGroup.position.set(0, -0.45, 0);
            charGroup.rotation.set(Math.PI / 2.15, 0, 0); // stable quadruped tabletop

            const birdWave = Math.sin(t * 2.2);
            // Smooth hold at peak extension
            const reachA = Math.pow(Math.max(0, birdWave), 1.2); // Right Arm + Left Leg reach
            const reachB = Math.pow(Math.max(0, -birdWave), 1.2); // Left Arm + Right Leg reach

            if (j.chest) {
              j.chest.rotation.x = 0; // maintain neutral flat spine
            }
            if (j.head) {
              j.head.rotation.x = -0.15; // neutral cervical alignment looking at mat
            }

            if (j.rightUpperArm && j.leftUpperArm) {
              // Reaching arm reaches parallel forward to 180 deg horizontal
              j.rightUpperArm.rotation.set(-1.55 - reachA * 1.45, 0, 0.05);
              j.leftUpperArm.rotation.set(-1.55 - reachB * 1.45, 0, -0.05);
            }
            if (j.rightForearm && j.leftForearm) {
              j.rightForearm.rotation.set(0, 0, 0);
              j.leftForearm.rotation.set(0, 0, 0);
            }

            if (j.leftThigh && j.rightThigh) {
              // Extending leg kicks straight back parallel
              j.leftThigh.rotation.set(-1.5 + reachA * 1.5, 0, -0.2);
              j.rightThigh.rotation.set(-1.5 + reachB * 1.5, 0, 0.2);
            }
            if (j.leftShin && j.rightShin) {
              // Knee extends straight when kicked back
              j.leftShin.rotation.set(1.4 - reachA * 1.4, 0, 0);
              j.rightShin.rotation.set(1.4 - reachB * 1.4, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             28. HIGH KNEES
             ----------------------------------------------------------------- */
          case 'high_knees': {
            const sprintCadence = Math.sin(t * 9);
            const hopY = Math.abs(Math.sin(t * 9)) * 0.15;
            charGroup.position.set(0, hopY, 0);

            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-sprintCadence * 1.4, 0, 0);
              j.rightThigh.rotation.set(sprintCadence * 1.4, 0, 0);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(Math.max(0, sprintCadence) * 1.4, 0, 0);
              j.rightShin.rotation.set(Math.max(0, -sprintCadence) * 1.4, 0, 0);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(sprintCadence * 1.2, 0, 0);
              j.rightUpperArm.rotation.set(-sprintCadence * 1.2, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             29. MOUNTAIN CLIMBERS
             ----------------------------------------------------------------- */
          case 'mountain_climber': {
            charGroup.position.set(0, -0.5, 0);
            charGroup.rotation.set(Math.PI / 2.05, 0, 0); // prone plank

            const legDrive = Math.sin(t * 8);
            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-legDrive * 0.9, 0, 0);
              j.rightThigh.rotation.set(legDrive * 0.9, 0, 0);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(Math.max(0, legDrive) * 1.2, 0, 0);
              j.rightShin.rotation.set(Math.max(0, -legDrive) * 1.2, 0, 0);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-1.5, 0, 0);
              j.rightUpperArm.rotation.set(-1.5, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             30. BURPEES
             ----------------------------------------------------------------- */
          case 'burpee': {
            const bPhase = (t * 1.8) % 4; // 4 discrete phases
            if (bPhase < 1) {
              // Phase 1: Squat drop
              charGroup.position.set(0, -0.4, 0);
              charGroup.rotation.set(0.6, 0, 0);
              if (j.leftThigh && j.rightThigh) {
                j.leftThigh.rotation.set(-1.6, 0, 0);
                j.rightThigh.rotation.set(-1.6, 0, 0);
              }
            } else if (bPhase < 2) {
              // Phase 2: Kick back into plank/pushup
              charGroup.position.set(0, -0.55, 0);
              charGroup.rotation.set(Math.PI / 2.05, 0, 0);
            } else if (bPhase < 3) {
              // Phase 3: Snap feet back in
              charGroup.position.set(0, -0.35, 0);
              charGroup.rotation.set(0.4, 0, 0);
            } else {
              // Phase 4: Vertical explosive jump
              const jumpPeak = Math.sin((bPhase - 3) * Math.PI) * 0.45;
              charGroup.position.set(0, jumpPeak, 0);
              if (j.leftUpperArm && j.rightUpperArm) {
                j.leftUpperArm.rotation.set(-2.8, 0, -0.3);
                j.rightUpperArm.rotation.set(-2.8, 0, 0.3);
              }
            }
            break;
          }

          /* -----------------------------------------------------------------
             31. SHADOW BOXING
             ----------------------------------------------------------------- */
          case 'shadow_boxing': {
            const punchPhase = Math.sin(t * 5.5);
            charGroup.rotation.y = punchPhase * 0.45;

            if (j.leftUpperArm && j.rightUpperArm) {
              if (punchPhase > 0) {
                j.leftUpperArm.rotation.set(-1.45, 0, 0); // jab
                j.rightUpperArm.rotation.set(-0.7, 0, 0.4); // chin guard
              } else {
                j.leftUpperArm.rotation.set(-0.7, 0, -0.4);
                j.rightUpperArm.rotation.set(-1.45, 0, 0); // cross
              }
            }
            break;
          }

          /* -----------------------------------------------------------------
             32. WORLD'S GREATEST STRETCH
             ----------------------------------------------------------------- */
          case 'worlds_greatest_stretch': {
            const stretchPhase = Math.sin(t * 2);
            charGroup.position.set(0, -0.4, 0);

            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-1.5, 0, -0.2); // deep lead lunge
              j.rightThigh.rotation.set(0.5, 0, 0.2); // trailing leg
            }
            if (stretchPhase > 0) {
              // Reach arm skyward with thoracic rotation
              charGroup.rotation.y = stretchPhase * 0.6;
              if (j.leftUpperArm) {
                j.leftUpperArm.rotation.set(-Math.PI / 1.5, 0, 0); // straight up
              }
            } else {
              // Dip elbow to instep
              if (j.leftUpperArm) {
                j.leftUpperArm.rotation.set(-0.5, 0, 0);
              }
            }
            break;
          }

          /* -----------------------------------------------------------------
             33. HIP 90/90 FLOW
             ----------------------------------------------------------------- */
          case 'hip_90_90': {
            charGroup.position.set(0, -0.85, 0); // seated
            const wipe = Math.sin(t * 1.8); // windshield wipe left to right

            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-0.8, wipe * 0.8, -0.8);
              j.rightThigh.rotation.set(-0.8, wipe * 0.8, 0.8);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(1.5, 0, 0);
              j.rightShin.rotation.set(1.5, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             34. THORACIC WINDMILL
             ----------------------------------------------------------------- */
          case 'thoracic_windmill': {
            const mill = Math.sin(t * 2); // hinge and rotate
            charGroup.rotation.z = mill * 0.45;
            charGroup.rotation.x = Math.abs(mill) * 0.4;

            if (j.leftUpperArm) {
              j.leftUpperArm.rotation.set(-2.8, 0, 0); // vertical skyward
            }
            if (j.rightUpperArm) {
              j.rightUpperArm.rotation.set(0.5, 0, 0); // sliding down shin
            }
            break;
          }

          /* -----------------------------------------------------------------
             35. CHEETAH FAST-FEET SPRINT (Kids standing speed sprint)
             ----------------------------------------------------------------- */
          case 'kids_cheetah_dash': {
            const sprintFreq = 7.0;
            const cycle = Math.sin(t * sprintFreq);
            const bob = Math.abs(Math.cos(t * sprintFreq)) * 0.05;

            charGroup.position.set(0, bob, 0);
            charGroup.rotation.set(0.1, 0, 0); // Slight athletic forward sprint lean

            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-cycle * 0.9, 0, -0.08);
              j.rightThigh.rotation.set(cycle * 0.9, 0, 0.08);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(cycle > 0 ? 0.95 * cycle : 0.1, 0, 0);
              j.rightShin.rotation.set(cycle < 0 ? -0.95 * cycle : 0.1, 0, 0);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(cycle * 0.85, 0, -0.2);
              j.rightUpperArm.rotation.set(-cycle * 0.85, 0, 0.2);
            }
            if (j.leftForearm && j.rightForearm) {
              j.leftForearm.rotation.set(-1.3, 0, 0); // 90 deg bent running arms
              j.rightForearm.rotation.set(-1.3, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             36. KANGAROO BOUNDS
             ----------------------------------------------------------------- */
          case 'kids_kangaroo_bounds': {
            const bounce = Math.abs(Math.sin(t * 6)) * 0.35;
            charGroup.position.set(0, bounce, 0);
            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-0.5 + bounce * 0.5, 0, -0.2);
              j.rightThigh.rotation.set(-0.5 + bounce * 0.5, 0, 0.2);
            }
            if (j.leftShin && j.rightShin) {
              j.leftShin.rotation.set(0.7 - bounce * 0.7, 0, 0);
              j.rightShin.rotation.set(0.7 - bounce * 0.7, 0, 0);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-0.8, 0, -0.3); // paws up
              j.rightUpperArm.rotation.set(-0.8, 0, 0.3);
            }
            if (j.leftForearm && j.rightForearm) {
              j.leftForearm.rotation.set(-1.2, 0, 0.4);
              j.rightForearm.rotation.set(-1.2, 0, -0.4);
            }
            break;
          }

          /* -----------------------------------------------------------------
             37. SENIOR TIGHTROPE WALK
             ----------------------------------------------------------------- */
          case 'senior_tightrope_walk': {
            const stepWalk = Math.sin(t * 2.2);
            charGroup.position.set(0, 0, 0);
            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(stepWalk * 0.45, 0, 0);
              j.rightThigh.rotation.set(-stepWalk * 0.45, 0, 0);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(0, 0, -1.1); // arms out wide like airplane wings for balance
              j.rightUpperArm.rotation.set(0, 0, 1.1);
            }
            break;
          }

          /* -----------------------------------------------------------------
             40. SENIOR SEATED ROW
             ----------------------------------------------------------------- */
          case 'senior_seated_row': {
            charGroup.position.set(0, -0.75, 0);
            const rowPinch = (Math.sin(t * 2.5) + 1) / 2; // 0 to 1
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-0.3 - (1 - rowPinch) * 0.9, 0, -rowPinch * 0.3);
              j.rightUpperArm.rotation.set(-0.3 - (1 - rowPinch) * 0.9, 0, rowPinch * 0.3);
            }
            if (j.leftForearm && j.rightForearm) {
              j.leftForearm.rotation.set(-1.4, 0, 0);
              j.rightForearm.rotation.set(-1.4, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             41. SPEED SKATER BOUNDS
             ----------------------------------------------------------------- */
          case 'cardio_skater_bounds': {
            const skate = Math.sin(t * 4.5);
            charGroup.position.set(skate * 0.4, -0.15, 0);
            charGroup.rotation.z = -skate * 0.25;

            if (j.leftThigh && j.rightThigh) {
              if (skate > 0) {
                j.leftThigh.rotation.set(-1.1, 0, -0.3);
                j.rightThigh.rotation.set(0.4, 0, 0.4);
              } else {
                j.leftThigh.rotation.set(0.4, 0, -0.4);
                j.rightThigh.rotation.set(-1.1, 0, 0.3);
              }
            }
            break;
          }

          /* -----------------------------------------------------------------
             42. ROMANIAN DEADLIFT HINGE
             ----------------------------------------------------------------- */
          case 'strength_romanian_deadlift': {
            const hinge = (Math.sin(t * 2.2) + 1) / 2; // 0 to 1
            charGroup.position.set(0, 0, -hinge * 0.2); // hips push back
            charGroup.rotation.x = hinge * 1.1; // flat back torso bends forward 80 deg

            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(-hinge * 0.25, 0, -0.1);
              j.rightThigh.rotation.set(-hinge * 0.25, 0, 0.1);
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(0, 0, 0); // arms hang straight down
              j.rightUpperArm.rotation.set(0, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             43. HOLLOW BODY HOLD
             ----------------------------------------------------------------- */
          case 'core_hollow_body_hold': {
            charGroup.position.set(0, -0.8, 0);
            charGroup.rotation.set(Math.PI / 2.05, 0, 0); // supine
            if (j.chest) {
              j.chest.rotation.x = -0.3; // head and shoulders curved up
            }
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-2.8, 0, -0.2);
              j.rightUpperArm.rotation.set(-2.8, 0, 0.2);
            }
            if (j.leftThigh && j.rightThigh) {
              j.leftThigh.rotation.set(0.3, 0, -0.1); // straight legs hovering 4 inches
              j.rightThigh.rotation.set(0.3, 0, 0.1);
            }
            break;
          }

          /* -----------------------------------------------------------------
             44. SCAPULAR WALL SLIDES
             ----------------------------------------------------------------- */
          case 'mobility_scapular_wall_slides': {
            const slide = (Math.sin(t * 2.5) + 1) / 2; // W to Y slide
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(-1.4 - slide * 1.2, 0, -0.8 + slide * 0.4);
              j.rightUpperArm.rotation.set(-1.4 - slide * 1.2, 0, 0.8 - slide * 0.4);
            }
            if (j.leftForearm && j.rightForearm) {
              j.leftForearm.rotation.set(-1.1, 0, 0);
              j.rightForearm.rotation.set(-1.1, 0, 0);
            }
            break;
          }

          /* -----------------------------------------------------------------
             DEFAULT RHYTHMIC KINEMATIC WAVE
             ----------------------------------------------------------------- */
          default: {
            const subtleY = Math.sin(t * 2) * 0.06;
            charGroup.position.set(0, subtleY, 0);
            if (j.leftUpperArm && j.rightUpperArm) {
              j.leftUpperArm.rotation.set(Math.sin(t * 2) * 0.3, 0, -0.2);
              j.rightUpperArm.rotation.set(-Math.sin(t * 2) * 0.3, 0, 0.2);
            }
            break;
          }
        }
      }

      // Smooth Camera Positioning
      if (cameraRef.current) {
        const cam = cameraRef.current;
        const dist = zoomDistanceRef.current;

        if (cameraPreset === 'perspective') {
          const rotY = rotationEulerRef.current.y;
          const rotX = rotationEulerRef.current.x;
          cam.position.x = Math.sin(rotY) * Math.cos(rotX) * dist;
          cam.position.y = Math.sin(rotX) * dist + 1.2;
          cam.position.z = Math.cos(rotY) * Math.cos(rotX) * dist;
        } else if (cameraPreset === 'front') {
          cam.position.set(0, 1.2, dist);
        } else if (cameraPreset === 'side') {
          cam.position.set(dist, 1.2, 0);
        } else if (cameraPreset === 'top') {
          cam.position.set(0, dist + 1, 0.1);
        }
        cam.lookAt(0, 1.0, 0);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [isPlaying, speed, exercise.id, cameraPreset]);

  // Orbit drag controls for interactive 360 degree 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    setCameraPreset('perspective');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    rotationEulerRef.current.y += deltaX * 0.008;
    rotationEulerRef.current.x = Math.max(-0.5, Math.min(1.2, rotationEulerRef.current.x + deltaY * 0.008));

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    zoomDistanceRef.current = Math.max(3.5, Math.min(12, zoomDistanceRef.current + e.deltaY * 0.005));
  };

  const resetView = () => {
    rotationEulerRef.current = { x: 0.2, y: -0.4 };
    zoomDistanceRef.current = 6.5;
    setCameraPreset('perspective');
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] bg-[#0a0a0c] border border-[#222] rounded-md overflow-hidden select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Top Left: 3D Movement Indicator & Target Muscles */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="bg-[#121216]/90 backdrop-blur-md border border-[#c5a059]/40 px-3 py-1.5 rounded-sm flex items-center gap-2 text-xs font-mono text-[#e5e5e5] shadow-lg">
          <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-ping" />
          <span className="font-semibold text-white">3D Biomechanical Visualizer</span>
          <span className="text-[#888]">|</span>
          <span className="text-[#c5a059]">{exercise.name}</span>
        </div>
        <div className="bg-[#121216]/80 backdrop-blur-md border border-[#2a2a30] px-2.5 py-1 rounded-sm text-[11px] font-mono text-[#a3a3a3] flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#fbbf24]" />
          <span>Active: {exercise.primaryMuscles.slice(0, 2).join(' & ')}</span>
        </div>
      </div>

      {/* Top Right: Camera Angle Switcher */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#121216]/90 backdrop-blur-md border border-[#2a2a30] p-1 rounded-sm text-xs font-mono text-[#a3a3a3] shadow-md">
        <button
          onClick={() => { setCameraPreset('perspective'); }}
          className={`px-2 py-1 rounded-xs transition-all ${
            cameraPreset === 'perspective' ? 'bg-[#c5a059] text-black font-semibold' : 'hover:text-white'
          }`}
          title="3D Orbit Perspective"
        >
          3D Orbit
        </button>
        <button
          onClick={() => { setCameraPreset('front'); }}
          className={`px-2 py-1 rounded-xs transition-all ${
            cameraPreset === 'front' ? 'bg-[#c5a059] text-black font-semibold' : 'hover:text-white'
          }`}
          title="Front View"
        >
          Front
        </button>
        <button
          onClick={() => { setCameraPreset('side'); }}
          className={`px-2 py-1 rounded-xs transition-all ${
            cameraPreset === 'side' ? 'bg-[#c5a059] text-black font-semibold' : 'hover:text-white'
          }`}
          title="Side Profile"
        >
          Side (90°)
        </button>
        <button
          onClick={() => { setCameraPreset('top'); }}
          className={`px-2 py-1 rounded-xs transition-all ${
            cameraPreset === 'top' ? 'bg-[#c5a059] text-black font-semibold' : 'hover:text-white'
          }`}
          title="Top Down Angle"
        >
          Top
        </button>
      </div>

      {/* Bottom Control Bar with 3D Scrubber and Fast Simulation Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-3 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent space-y-2">
        {/* Interactive 3D Simulation Scrubber */}
        <div className="space-y-1">
          <div
            ref={scrubberTrackRef}
            onMouseDown={handleMouseDownScrub}
            className="w-full bg-[#181822]/90 hover:bg-[#202030] h-2 rounded-full overflow-hidden relative cursor-pointer group transition-all border border-[#2a2a38]"
            title="Click or drag to seek to any point in the 3D movement cycle"
          >
            <div
              className="h-full bg-gradient-to-r from-[#c5a059] via-[#fbbf24] to-[#f59e0b] relative transition-all duration-75"
              style={{ width: `${(scrubberTime / 4.0) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#c5a059] shadow-md scale-0 group-hover:scale-100 transition-transform" />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#888] px-1">
            <span className="text-[#c5a059] font-bold">
              3D Time: 0:0{Math.floor(scrubberTime)}s / 0:04s
            </span>
            <span className="text-[#aaa] flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#c5a059]" />
              <span>Drag canvas for 360° orbit</span>
            </span>
          </div>
        </div>

        {/* 3D Action Controls Row */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            {onTogglePlay && (
              <button
                onClick={onTogglePlay}
                className="px-2.5 py-1.5 rounded-xs bg-[#c5a059] hover:bg-[#d4b069] text-black font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title={isPlaying ? 'Pause 3D simulation' : 'Play 3D simulation'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            )}

            {/* Fast Simulation & Speed Selectors */}
            <div className="flex items-center gap-1 bg-[#14141e]/90 border border-[#2a2a38] rounded-xs p-0.5">
              {[1.0, 1.5, 2.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setCurrentSpeed(spd)}
                  className={`px-2 py-1 text-[10px] rounded-xs transition-all cursor-pointer ${
                    currentSpeed === spd
                      ? 'bg-[#c5a059] text-black font-bold shadow-xs'
                      : 'text-[#888] hover:text-white'
                  }`}
                  title={`${spd}x simulation speed`}
                >
                  {spd === 2.5 ? '⚡ 2.5x Turbo' : `${spd}x`}
                </button>
              ))}
            </div>

            {/* Cinematic Auto-Orbit Video Mode */}
            <button
              onClick={() => setIsAutoOrbiting(!isAutoOrbiting)}
              className={`px-2 py-1 rounded-xs border text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                isAutoOrbiting
                  ? 'bg-[#1e1b2e] border-[#a855f7] text-[#c084fc] font-bold'
                  : 'bg-[#14141e]/90 border-[#2a2a38] text-[#888] hover:text-white'
              }`}
              title="Toggle 360° Cinematic Orbit Camera Video"
            >
              <Video className="w-3 h-3" />
              <span>360° Video</span>
            </button>

            {/* Kinetic FX Toggle */}
            <button
              onClick={() => setTurboFX(!turboFX)}
              className={`px-2 py-1 rounded-xs border text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                turboFX
                  ? 'bg-[#221c14] border-[#f59e0b] text-[#fbbf24]'
                  : 'bg-[#14141e]/90 border-[#2a2a38] text-[#666]'
              }`}
              title="Toggle glowing kinetic aura particles"
            >
              <Sparkles className="w-3 h-3" />
              <span>FX Aura</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Zoom Controls */}
            <button
              onClick={() => { zoomDistanceRef.current = Math.max(3.5, zoomDistanceRef.current - 0.8); }}
              className="p-1.5 rounded-xs bg-[#14141e]/90 border border-[#2a2a38] text-[#aaa] hover:text-white transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>

            <button
              onClick={() => { zoomDistanceRef.current = Math.min(12, zoomDistanceRef.current + 0.8); }}
              className="p-1.5 rounded-xs bg-[#14141e]/90 border border-[#2a2a38] text-[#aaa] hover:text-white transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>

            <button
              onClick={resetView}
              className="p-1.5 rounded-xs bg-[#14141e]/90 border border-[#2a2a38] text-[#aaa] hover:text-white transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
              title="Reset 3D camera"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
