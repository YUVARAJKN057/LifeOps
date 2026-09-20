import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SpatialFloatingPrism3DProps {
  size?: number;
  color?: string;
  type?: 'octahedron' | 'tetrahedron' | 'dodecahedron';
  className?: string;
  interactive?: boolean;
  pulseSpeed?: number;
}

export const SpatialFloatingPrism3D: React.FC<SpatialFloatingPrism3DProps> = ({
  size = 120,
  color = '#c5a059',
  type = 'octahedron',
  className = '',
  interactive = true,
  pulseSpeed = 1,
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
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const group = new THREE.Group();
    scene.add(group);

    // Geometry based on type
    let geometry: THREE.BufferGeometry;
    if (type === 'octahedron') {
      geometry = new THREE.OctahedronGeometry(1.2, 0);
    } else if (type === 'dodecahedron') {
      geometry = new THREE.DodecahedronGeometry(1.1, 0);
    } else {
      geometry = new THREE.TetrahedronGeometry(1.3, 0);
    }

    const threeColor = new THREE.Color(color);

    // Faceted solid crystal
    const solidMaterial = new THREE.MeshStandardMaterial({
      color: threeColor,
      emissive: threeColor,
      emissiveIntensity: 0.35,
      metalness: 0.85,
      roughness: 0.15,
      flatShading: true,
    });
    const solidMesh = new THREE.Mesh(geometry, solidMaterial);
    group.add(solidMesh);

    // Outer wireframe halo
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const wireMesh = new THREE.Mesh(geometry, wireframeMaterial);
    wireMesh.scale.setScalar(1.08);
    group.add(wireMesh);

    // Orbital ring
    const ringGeo = new THREE.TorusGeometry(1.8, 0.015, 12, 60);
    const ringMat = new THREE.MeshBasicMaterial({
      color: threeColor,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    group.add(ring);

    // Lights
    const light1 = new THREE.PointLight(threeColor.getHex(), 2.5, 10);
    light1.position.set(2, 3, 3);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xffffff, 1.2, 10);
    light2.position.set(-2, -2, 2);
    scene.add(light2);

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
      targetX = x * 2;
      targetY = y * 2;
    };

    if (interactive) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime() * pulseSpeed;

      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      group.rotation.y = time * 0.8 + currentX * 1.2;
      group.rotation.x = Math.sin(time * 0.6) * 0.3 + currentY * 0.8;
      group.rotation.z = Math.cos(time * 0.4) * 0.2;

      ring.rotation.z = -time * 1.2;

      const scale = 1 + Math.sin(time * 2) * 0.04;
      solidMesh.scale.setScalar(scale);
      wireMesh.scale.setScalar(scale * 1.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (interactive) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      solidMaterial.dispose();
      wireframeMaterial.dispose();
      scene.clear();
    };
  }, [size, color, type, interactive, pulseSpeed]);

  return (
    <div
      ref={containerRef}
      id="spatial-floating-prism-3d"
      className={`relative flex items-center justify-center pointer-events-auto cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
