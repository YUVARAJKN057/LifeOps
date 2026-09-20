import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface NeuralVisualizer3DProps {
  isThinking?: boolean;
  intensity?: number;
  size?: number;
  className?: string;
}

export const NeuralVisualizer3D: React.FC<NeuralVisualizer3DProps> = ({
  isThinking = false,
  intensity = 1.0,
  size = 200,
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
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const neuralGroup = new THREE.Group();
    scene.add(neuralGroup);

    // 1. Geodesic Sphere Nodes & Lines
    const sphereGeo = new THREE.IcosahedronGeometry(1.3, 2);
    const posAttribute = sphereGeo.getAttribute('position');
    const vertexCount = posAttribute.count;

    // Store original positions for deformation / pulsing waves
    const origPositions = new Float32Array(vertexCount * 3);
    for (let i = 0; i < vertexCount * 3; i++) {
      origPositions[i] = posAttribute.array[i];
    }

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc5a059,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const wireMesh = new THREE.Mesh(sphereGeo, wireMat);
    neuralGroup.add(wireMesh);

    // 2. Vertex Points (Synapses)
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', posAttribute.clone());

    const pointsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
      transparent: true,
      opacity: 0.9,
    });
    const pointsMesh = new THREE.Points(pointsGeo, pointsMat);
    neuralGroup.add(pointsMesh);

    // 3. Inner Pulsing Core
    const innerGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      emissive: 0xe5c178,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.2,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    neuralGroup.add(innerCore);

    // Lights
    const light = new THREE.PointLight(0xc5a059, 2, 10);
    light.position.set(2, 3, 4);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      mouseX = (cx / width - 0.5) * 1.5;
      mouseY = (cy / height - 0.5) * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const nw = container.clientWidth || size;
      const nh = container.clientHeight || size;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const speed = isThinking ? 2.5 : 1.0;

      // Group Rotation
      neuralGroup.rotation.y = time * 0.4 * speed + mouseX * 0.4;
      neuralGroup.rotation.x = Math.sin(time * 0.3) * 0.2 + mouseY * 0.3;

      // Synapse wave deformation
      const positions = posAttribute.array as Float32Array;
      const pPositions = pointsGeo.getAttribute('position').array as Float32Array;

      for (let i = 0; i < vertexCount; i++) {
        const ox = origPositions[i * 3];
        const oy = origPositions[i * 3 + 1];
        const oz = origPositions[i * 3 + 2];

        const wave =
          Math.sin(time * 3 * speed + ox * 2 + oy * 2 + oz * 2) *
          (isThinking ? 0.12 : 0.04);
        const scale = 1 + wave;

        positions[i * 3] = ox * scale;
        positions[i * 3 + 1] = oy * scale;
        positions[i * 3 + 2] = oz * scale;

        pPositions[i * 3] = positions[i * 3];
        pPositions[i * 3 + 1] = positions[i * 3 + 1];
        pPositions[i * 3 + 2] = positions[i * 3 + 2];
      }

      posAttribute.needsUpdate = true;
      pointsGeo.getAttribute('position').needsUpdate = true;

      // Inner Core Pulse
      const corePulse = 0.7 + Math.sin(time * 4 * speed) * (isThinking ? 0.15 : 0.05);
      innerCore.scale.setScalar(corePulse);
      wireMat.opacity = isThinking ? 0.75 : 0.45;
      pointsMat.size = isThinking ? 0.09 : 0.06;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [isThinking, intensity, size]);

  return (
    <div
      ref={containerRef}
      id="neural-visualizer-3d"
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ width: '100%', height: '100%', minHeight: size }}
    />
  );
};
