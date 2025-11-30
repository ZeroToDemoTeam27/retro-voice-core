import { motion } from 'framer-motion';
import { EmotionState } from '@/contexts/VoiceContext';
import { useEffect, useState } from 'react';

interface PixelFaceProps {
  emotion: EmotionState;
}

export const PixelFace = ({ emotion }: PixelFaceProps) => {
  const [blink, setBlink] = useState(false);

  // Blink animation for NEUTRAL state only
  useEffect(() => {
    if (emotion !== 'NEUTRAL') {
      setBlink(false); // Reset blink when changing states
      return;
    }
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, [emotion]);

  // Spring transition for natural movement
  const springTransition = {
    type: "spring" as const,
    stiffness: 150,
    damping: 18
  };
  // Left eye path variants with morphing - scaled up for prominence
  const leftEyeVariants = {
    NEUTRAL: {
      d: blink 
        ? "M 60,100 L 140,100 L 140,105 L 60,105 Z"
        : "M 60,70 Q 60,50 80,50 L 120,50 Q 140,50 140,70 L 140,130 Q 140,150 120,150 L 80,150 Q 60,150 60,130 Z",
      scale: 1,
    },
    HAPPY: {
      d: "M 60,120 Q 100,70 140,120 L 140,130 Q 100,80 60,130 Z",
      scale: 1.05,
    },
    SAD: {
      d: "M 60,90 Q 60,70 80,70 L 120,70 Q 140,70 140,90 L 140,160 Q 140,180 120,180 L 80,180 Q 60,180 60,160 Z",
      scale: 1,
    },
    CONFUSED: {
      d: "M 55,75 Q 55,55 75,55 L 115,55 Q 135,55 135,75 L 135,125 Q 135,145 115,145 L 75,145 Q 55,145 55,125 Z",
      scale: 0.9,
    },
    LISTENING: {
      d: "M 60,70 L 120,70 L 120,150 L 60,150 Z",
      scale: 1,
    },
    TALKING: {
      d: "M 60,70 Q 60,50 80,50 L 120,50 Q 140,50 140,70 L 140,130 Q 140,150 120,150 L 80,150 Q 60,150 60,130 Z",
      scale: 1,
    },
  };

  // Right eye with asymmetric behavior for personality - scaled up
  const rightEyeVariants = {
    NEUTRAL: {
      d: blink 
        ? "M 160,100 L 240,100 L 240,105 L 160,105 Z"
        : "M 160,70 Q 160,50 180,50 L 220,50 Q 240,50 240,70 L 240,130 Q 240,150 220,150 L 180,150 Q 160,150 160,130 Z",
      scale: 1,
    },
    HAPPY: {
      d: "M 160,120 Q 200,70 240,120 L 240,130 Q 200,80 160,130 Z",
      scale: 1.05,
    },
    SAD: {
      d: "M 160,90 Q 160,70 180,70 L 220,70 Q 240,70 240,90 L 240,160 Q 240,180 220,180 L 180,180 Q 160,180 160,160 Z",
      scale: 1,
    },
    CONFUSED: {
      // Asymmetry: right eye stays wider when confused
      d: "M 165,65 Q 165,45 190,45 L 235,45 Q 260,45 260,65 L 260,135 Q 260,155 235,155 L 190,155 Q 165,155 165,135 Z",
      scale: 1.15,
    },
    LISTENING: {
      d: "M 170,70 L 240,70 L 240,150 L 170,150 Z",
      scale: 1,
    },
    TALKING: {
      d: "M 160,70 Q 160,50 180,50 L 220,50 Q 240,50 240,70 L 240,130 Q 240,150 220,150 L 180,150 Q 160,150 160,130 Z",
      scale: 1,
    },
  };

  // Eyebrow variants for LISTENING state - adjusted for larger eyes
  const leftEyebrowVariants = {
    LISTENING: {
      d: "M 50,30 L 130,25 L 130,32 L 50,37 Z",
    }
  };

  const rightEyebrowVariants = {
    LISTENING: {
      d: "M 170,25 L 250,20 L 250,27 L 170,32 Z",
    }
  };

  const renderEyes = () => {
    return (
      <>
        {/* Eyebrows for LISTENING state */}
        {emotion === 'LISTENING' && (
          <>
            <motion.path
              d={leftEyebrowVariants.LISTENING.d}
              fill="hsl(var(--primary))"
              filter="url(#glow)"
              animate={{
                y: [0, -0.5, 0, 0.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.path
              d={rightEyebrowVariants.LISTENING.d}
              fill="hsl(var(--primary))"
              filter="url(#glow)"
              animate={{
                y: [0, 0.5, 0, -0.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4
              }}
            />
          </>
        )}
        
        <motion.path
          variants={leftEyeVariants}
          animate={{
            ...leftEyeVariants[emotion],
            y: [-1, 1, -1],
            x: [-0.5, 0.5, -0.5]
          }}
          transition={{
            ...springTransition,
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            x: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
          }}
          fill="hsl(var(--primary))"
          filter="url(#glow)"
        />
        <motion.path
          variants={rightEyeVariants}
          animate={{
            ...rightEyeVariants[emotion],
            y: [-0.5, 1.5, -0.5],
            x: [0.5, -0.5, 0.5]
          }}
          transition={{
            ...springTransition,
            y: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
            x: { duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }
          }}
          fill="hsl(var(--primary))"
          filter="url(#glow)"
        />
        
        {/* Thought bubble for LISTENING state - adjusted for larger eyes */}
        {emotion === 'LISTENING' && (
          <motion.g>
            {/* Small dot near eyebrow */}
            <motion.circle 
              cx="255" 
              cy="45" 
              r="4" 
              fill="hsl(var(--primary))" 
              filter="url(#glow)"
              animate={{
                opacity: [0, 1, 1, 1, 1],
                scale: [0, 1, 1, 1, 1]
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                times: [0, 0.15, 0.6, 0.8, 1],
                ease: "easeOut"
              }}
            />
            {/* Three dots in a row (ellipsis/loading) - animate one by one */}
            <motion.circle 
              cx="268" 
              cy="30" 
              r="5" 
              fill="hsl(var(--primary))" 
              filter="url(#glow)"
              animate={{
                opacity: [0, 0, 1, 1, 1],
                scale: [0, 0, 1.2, 1, 1]
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                times: [0, 0.2, 0.35, 0.5, 1],
                ease: "easeOut"
              }}
            />
            <motion.circle 
              cx="280" 
              cy="30" 
              r="5" 
              fill="hsl(var(--primary))" 
              filter="url(#glow)"
              animate={{
                opacity: [0, 0, 0, 1, 1],
                scale: [0, 0, 0, 1.2, 1]
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                times: [0, 0.35, 0.45, 0.6, 1],
                ease: "easeOut"
              }}
            />
            <motion.circle 
              cx="292" 
              cy="30" 
              r="5" 
              fill="hsl(var(--primary))" 
              filter="url(#glow)"
              animate={{
                opacity: [0, 0, 0, 0, 1],
                scale: [0, 0, 0, 0, 1.2]
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                times: [0, 0.5, 0.6, 0.7, 0.85],
                ease: "easeOut"
              }}
            />
          </motion.g>
        )}
      </>
    );
  };

  return (
    <motion.div
      className="flex items-center justify-center"
      animate={emotion === 'LISTENING' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={
        emotion === 'LISTENING'
          ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
          : springTransition
      }
    >
      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.g
          animate={
            emotion === 'LISTENING'
              ? { y: [-3, 3, -3] }
              : emotion === 'HAPPY'
              ? { y: [-2, 2, -2] }
              : {}
          }
          transition={{
            duration: emotion === 'HAPPY' ? 2.5 : 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {renderEyes()}
        </motion.g>
      </svg>
    </motion.div>
  );
};