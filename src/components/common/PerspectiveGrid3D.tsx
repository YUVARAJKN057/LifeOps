import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PerspectiveGrid3DProps {
  height?: number;
  className?: string;
  intensity?: 'subtle' | 'vibrant';
  interactive?: boolean;
}

export const PerspectiveGrid3D: React.FC<PerspectiveGrid3DProps> = ({
  height = 180,
  className = '',
  intensity = 'subtle',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const h = container.clientHeight || height;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.08);

    const camera = new THREE.PerspectiveCamera(60, width / h, 0.1, 100);
    camera.position.set(0, 1.8, 4.5);
    camera.rotation.x = -0.32;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3D Plane Mesh with Undulating Wireframe
    const gridWidth = 24;
    const gridDepth = 24;
    const segmentsX = 40;
    const segmentsY = 40;

    const geometry = new THREE.PlaneGeometry(gridWidth, gridDepth, segmentsX, segmentsY);
    geometry.rotateX(-Math.PI / 2);

    const positionAttribute = geometry.attributes.position;
    const originalPositions = new Float32Array(positionAttribute.array);

    // Material with golden glow
    const material = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      emissive: 0x997736,
      emissiveIntensity: intensity === 'vibrant' ? 0.6 : 0.25,
      wireframe: true,
      transparent: true,
      opacity: intensity === 'vibrant' ? 0.45 : 0.22,
    });

    const terrainMesh = new THREE.Mesh(geometry, material);
    terrainMesh.position.y = -0.8;
    scene.add(terrainMesh);

    // Subtle horizon light
    const pointLight = new THREE.PointLight(0xc5a059, 2.0, 20);
    pointLight.position.set(0, 3, -4);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Mouse Tracking
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / h - 0.5;
      targetX = x * 0.8;
      targetY = y * 0.4;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const nw = container.clientWidth || 800;
      const nh = container.clientHeight || height;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth mouse interpolation
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      camera.position.x = currentX * 1.5;
      camera.position.y = 1.8 + currentY * 0.5;
      camera.lookAt(0, 0, -5);

      // Undulate terrain vertices
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = originalPositions[i * 3];
        const w = originalPositions[i * 3 + 2];
        const wave1 = Math.sin(u * 0.4 + time * 1.2 + w * 0.3) * 0.22;
        const wave2 = Math.cos(w * 0.5 - time * 0.8 + u * 0.2) * 0.15;
        pos.setY(i, wave1 + wave2);
      }
      pos.needsUpdate = true;

      // Slowly drift the whole grid along Z to give forward motion
      terrainMesh.position.z = (time * 0.4) % 2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      scene.clear();
    };
  }, [height, intensity, interactive]);

  return (
    <div
      ref={containerRef}
      id="perspective-grid-3d"
      className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`}
      style={{ height }}
    />
  );
};
