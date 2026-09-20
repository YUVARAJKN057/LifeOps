import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface WealthVault3DProps {
  size?: number;
  savingsRate?: number;
  totalWealthINR?: number;
  className?: string;
}

export const WealthVault3D: React.FC<WealthVault3DProps> = ({
  size = 280,
  savingsRate = 65,
  totalWealthINR = 2450000,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || size;
    const height = container.clientHeight || size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 5.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const vaultGroup = new THREE.Group();
    scene.add(vaultGroup);

    // 1. Stack of 3D Gold Bullion Bars
    const barWidth = 1.4;
    const barHeight = 0.35;
    const barDepth = 0.7;

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      emissive: 0x997736,
      emissiveIntensity: 0.25,
      metalness: 0.95,
      roughness: 0.18,
    });

    const platinumMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      metalness: 0.9,
      roughness: 0.15,
    });

    // Pyramid bar stack: 3 on bottom, 2 in middle, 1 on top
    const barGeo = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
    const bars: THREE.Mesh[] = [];

    // Base row (2 bars)
    for (let i = -0.5; i <= 0.5; i += 1) {
      const bar = new THREE.Mesh(barGeo, goldMaterial);
      bar.position.set(i * (barWidth * 0.9), -0.5, 0);
      vaultGroup.add(bar);
      bars.push(bar);
    }

    // Middle row (cross-laid 2 bars)
    for (let i = -0.4; i <= 0.4; i += 0.8) {
      const bar = new THREE.Mesh(barGeo, goldMaterial);
      bar.rotation.y = Math.PI / 2;
      bar.position.set(0, -0.15, i * (barDepth * 1.1));
      vaultGroup.add(bar);
      bars.push(bar);
    }

    // Top Crown Ingot (Platinum-Gold Hybrid)
    const topBar = new THREE.Mesh(barGeo, platinumMaterial);
    topBar.position.set(0, 0.22, 0);
    vaultGroup.add(topBar);
    bars.push(topBar);

    // 2. Orbital Currency & Yield Rings (INR Ring)
    const ringGeo1 = new THREE.TorusGeometry(1.9, 0.018, 16, 80);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    vaultGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.3, 0.012, 16, 80);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xe5c178,
      transparent: true,
      opacity: 0.6,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    vaultGroup.add(ring2);

    // 3. Floating Golden Sparks / Wealth Sparkles
    const sparkCount = 35;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      const r = 1.2 + Math.random() * 1.5;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      sparkPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      sparkPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      sparkPos[i * 3 + 2] = r * Math.cos(ph);
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffe29a,
      transparent: true,
      opacity: 0.85,
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    vaultGroup.add(sparks);

    // Lights
    const goldLight = new THREE.PointLight(0xc5a059, 3.5, 12);
    goldLight.position.set(3, 4, 3);
    scene.add(goldLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(0, 5, 2);
    scene.add(topLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // Mouse Tracking
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;
      targetX = x * 1.5;
      targetY = y * 0.8;
    };

    container.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const nw = container.clientWidth || size;
      const nh = container.clientHeight || size;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      vaultGroup.rotation.y = time * 0.35 + currentX;
      vaultGroup.rotation.x = Math.sin(time * 0.2) * 0.15 + currentY * 0.5;

      ring1.rotation.z = time * 0.6;
      ring2.rotation.z = -time * 0.45;
      ring2.rotation.y = time * 0.3;

      sparks.rotation.y = time * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [size, savingsRate, totalWealthINR]);

  return (
    <div
      ref={containerRef}
      id="wealth-vault-3d"
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: '100%', height: '100%', minHeight: size }}
    />
  );
};
