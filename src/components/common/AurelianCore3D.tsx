import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AurelianCore3DProps {
  size?: number;
  interactive?: boolean;
  intensity?: 'ambient' | 'hero';
  className?: string;
  showLabels?: boolean;
}

export const AurelianCore3D: React.FC<AurelianCore3DProps> = ({
  size = 360,
  interactive = true,
  intensity = 'hero',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || size;
    const height = container.clientHeight || size;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = intensity === 'hero' ? 6.5 : 7.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Root Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 1. Central Golden Icosahedron Core
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      emissive: 0x997736,
      emissiveIntensity: 0.35,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: false,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Wireframe overlay on Core
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const wireMesh = new THREE.Mesh(coreGeo, wireframeMat);
    wireMesh.scale.setScalar(1.02);
    coreGroup.add(wireMesh);

    // 2. Gyroscope Outer Rings (Aurelian Gimbal)
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      metalness: 0.95,
      roughness: 0.2,
    });
    const ringGeo1 = new THREE.TorusGeometry(2.0, 0.022, 16, 100);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    coreGroup.add(ring1);

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xe5c178,
      metalness: 0.9,
      roughness: 0.3,
    });
    const ringGeo2 = new THREE.TorusGeometry(2.4, 0.018, 16, 100);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 6;
    coreGroup.add(ring2);

    const ringMat3 = new THREE.MeshStandardMaterial({
      color: 0xd1d1d1,
      metalness: 0.8,
      roughness: 0.4,
    });
    const ringGeo3 = new THREE.TorusGeometry(2.8, 0.015, 16, 100);
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.x = -Math.PI / 4;
    ring3.rotation.z = Math.PI / 3;
    coreGroup.add(ring3);

    // 3. Orbiting Satellite Nodes (Directives, Goals, Rituals, Treasury, Intelligence)
    const satelliteGroup = new THREE.Group();
    coreGroup.add(satelliteGroup);

    const satCount = 5;
    const satellites: THREE.Mesh[] = [];
    const satColors = [0xc5a059, 0xe5c178, 0xd1d1d1, 0xffe29a, 0x997736];

    for (let i = 0; i < satCount; i++) {
      const satGeo = new THREE.OctahedronGeometry(0.18, 0);
      const satMat = new THREE.MeshStandardMaterial({
        color: satColors[i],
        emissive: satColors[i],
        emissiveIntensity: 0.6,
        metalness: 0.8,
        roughness: 0.2,
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      satellites.push(sat);
      satelliteGroup.add(sat);
    }

    // 4. Background Particle Constellation
    const particleCount = intensity === 'hero' ? 220 : 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const pColor1 = new THREE.Color(0xc5a059);
    const pColor2 = new THREE.Color(0xd1d1d1);

    for (let i = 0; i < particleCount; i++) {
      const radius = 3.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePos[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = pColor1.clone().lerp(pColor2, Math.random());
      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const goldPointLight = new THREE.PointLight(0xc5a059, 2.8, 15);
    goldPointLight.position.set(3, 4, 4);
    scene.add(goldPointLight);

    const coolPointLight = new THREE.PointLight(0xffffff, 1.2, 15);
    coolPointLight.position.set(-4, -3, 3);
    scene.add(coolPointLight);

    // Mouse Tracking / Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      targetX = (clientX / width - 0.5) * 2;
      targetY = (clientY / height - 0.5) * 2;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const newWidth = container.clientWidth || size;
      const newHeight = container.clientHeight || size;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Rotate group with mouse tracking and continuous drift
      coreGroup.rotation.y = elapsedTime * 0.35 + mouseX * 0.8;
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.25) * 0.2 + mouseY * 0.5;

      // Independent Gimbal Ring Rotations
      ring1.rotation.z = elapsedTime * 0.5;
      ring2.rotation.x = elapsedTime * 0.4 + Math.PI / 3;
      ring2.rotation.y = elapsedTime * 0.3;
      ring3.rotation.z = -elapsedTime * 0.45;
      ring3.rotation.y = elapsedTime * 0.25;

      // Inner Core Pulse & Spin
      coreMesh.rotation.y = -elapsedTime * 0.6;
      coreMesh.rotation.x = elapsedTime * 0.3;
      const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.04;
      coreMesh.scale.setScalar(pulse);
      wireMesh.scale.setScalar(pulse * 1.03);

      // Orbit Satellites
      satellites.forEach((sat, idx) => {
        const angle = elapsedTime * 0.8 + (idx / satCount) * Math.PI * 2;
        const orbitRadius = 2.4 + Math.sin(elapsedTime * 1.5 + idx) * 0.2;
        sat.position.x = Math.cos(angle) * orbitRadius;
        sat.position.z = Math.sin(angle) * orbitRadius;
        sat.position.y = Math.sin(angle * 2) * 0.6;
        sat.rotation.x = elapsedTime * 2;
        sat.rotation.y = elapsedTime * 1.5;
      });

      // Subtle cosmic particle drift
      particles.rotation.y = elapsedTime * 0.05;
      particles.rotation.x = Math.sin(elapsedTime * 0.03) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [size, interactive, intensity]);

  return (
    <div
      ref={containerRef}
      id="aurelian-core-3d"
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ width: '100%', height: '100%', minHeight: size }}
    />
  );
};
