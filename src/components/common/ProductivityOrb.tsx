import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Sparkles, Zap } from 'lucide-react';

interface ProductivityOrbProps {
  score: number;
  grade: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const ProductivityOrb: React.FC<ProductivityOrbProps> = ({
  score,
  grade,
  size = 'md',
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const dimensions = {
    sm: { w: 'w-24', h: 'h-24', text: 'text-xl', badge: 'text-[9px]' },
    md: { w: 'w-36', h: 'h-36', text: 'text-3xl', badge: 'text-[10px]' },
    lg: { w: 'w-48', h: 'h-48', text: 'text-4xl', badge: 'text-xs' },
  }[size];

  // 3D Motion calculations for gyro tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [25, -25]), {
    stiffness: 240,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-25, 25]), {
    stiffness: 240,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const getGlowColor = () => {
    if (score >= 85) return 'from-[#c5a059] via-[#e5c178] to-[#997736] shadow-[0_0_35px_rgba(197,160,89,0.5)]';
    if (score >= 70) return 'from-[#c5a059]/80 via-[#a38038] to-[#6b5020] shadow-[0_0_25px_rgba(197,160,89,0.35)]';
    if (score >= 50) return 'from-[#a38038] via-[#7a5c28] to-[#403010] shadow-[0_0_18px_rgba(163,128,56,0.25)]';
    return 'from-[#7a3b3b] via-[#4d1f1f] to-[#261010] shadow-rose-900/30';
  };

  return (
    <div
      style={{ perspective: 900 }}
      className="relative flex items-center justify-center select-none"
    >
      <motion.div
        id="lifeops-productivity-orb"
        ref={containerRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.2 }}
        className={`relative ${dimensions.w} ${dimensions.h} flex items-center justify-center cursor-pointer group`}
      >
        {/* Ambient 3D Gold Glow */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${getGlowColor()} opacity-40 blur-xl group-hover:opacity-75 transition-opacity duration-700`}
        />

        {/* 3D Orbit Gimbal Ring 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          style={{ transform: 'translateZ(15px)' }}
          className="absolute -inset-1 border border-[#c5a059]/40 rounded-full border-dashed pointer-events-none shadow-[0_0_10px_rgba(197,160,89,0.2)]"
        />

        {/* 3D Orbit Gimbal Ring 2 (Cross Tilt) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          style={{ transform: 'translateZ(25px) rotateX(45deg)' }}
          className="absolute inset-0.5 border border-[#c5a059]/25 rounded-full border-t-[#c5a059] pointer-events-none"
        />

        {/* 3D Orbit Gimbal Ring 3 (Z-axis angle) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          style={{ transform: 'translateZ(-15px) rotateY(60deg)' }}
          className="absolute inset-1.5 border border-white/20 rounded-full border-b-[#c5a059]/80 pointer-events-none"
        />

        {/* Core Multi-layered 3D Sphere */}
        <div
          style={{ transform: 'translateZ(30px)' }}
          className={`relative z-10 w-[86%] h-[86%] rounded-full bg-gradient-to-br from-[#1c1a14] via-[#0d0d0d] to-[#040404] border border-[#c5a059]/50 backdrop-blur-md shadow-[inset_0_0_15px_rgba(197,160,89,0.25),0_10px_25px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center p-2 text-center transition-all duration-300`}
        >
          {/* Subtle 3D glossy highlight */}
          <div className="absolute top-1 left-3 w-8 h-4 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none -rotate-45" />

          <div className="flex items-center gap-1 text-[#c5a059] text-[9px] font-mono tracking-widest uppercase opacity-95 drop-shadow">
            <Zap className="w-2.5 h-2.5 fill-[#c5a059]" />
            <span>EFFICIENCY</span>
          </div>

          <span className={`font-serif italic font-bold tracking-tight text-white ${dimensions.text} drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]`}>
            {score}
          </span>

          <span
            className={`mt-0.5 px-2 py-0.5 rounded-sm bg-[#c5a059]/15 text-[#c5a059] font-mono uppercase tracking-wider ${dimensions.badge} border border-[#c5a059]/40 shadow-sm`}
          >
            {grade}
          </span>
        </div>

        {/* 3D Floating Sparkle Badge */}
        <motion.div
          animate={{ y: [-3, 3, -3], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'translateZ(45px)' }}
          className="absolute -top-1 -right-1 z-20 bg-[#c5a059] text-black p-1 rounded-full shadow-[0_0_12px_rgba(197,160,89,0.6)] border border-white/40"
        >
          <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
        </motion.div>
      </motion.div>
    </div>
  );
};
