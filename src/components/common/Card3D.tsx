import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
  depth?: number;
  glare?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  id,
  onClick,
  depth = 15,
  glare = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [depth, -depth]), {
    stiffness: 260,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-depth, depth]), {
    stiffness: 260,
    damping: 24,
  });

  const glareX = useTransform(x, [0, 1], [0, 100]);
  const glareY = useTransform(y, [0, 1], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const normalizedX = Math.max(0, Math.min(1, clientX / rect.width));
    const normalizedY = Math.max(0, Math.min(1, clientY / rect.height));

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div
      style={{ perspective: 1100 }}
      className="w-full relative select-none"
    >
      <motion.div
        id={id}
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={`relative overflow-hidden rounded-sm transition-shadow duration-300 ${
          isHovered
            ? 'shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(197,160,89,0.15)] border-[#c5a059]/40'
            : 'shadow-lg border-[#1a1a1a]'
        } ${className}`}
      >
        {/* Dynamic Specular Glare Reflection Overlay */}
        {glare && (
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-sm opacity-0 transition-opacity duration-300 z-30"
            style={{
              opacity: isHovered ? 0.35 : 0,
              background: `radial-gradient(circle 280px at ${glareX.get()}% ${glareY.get()}%, rgba(197,160,89,0.35), transparent 70%)`,
            }}
          />
        )}

        {/* Inner Content with 3D Z-translation */}
        <div style={{ transform: 'translateZ(10px)' }}>{children}</div>
      </motion.div>
    </div>
  );
};
