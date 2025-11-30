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
  // Left eye path variants with morphing
  const leftEyeVariants = {
    NEUTRAL: {
      d: blink 
        ? "M 80,100 L 120,100 L 120,102 L 80,102 Z"
        : "M 80,80 Q 80,70 90,70 L 110,70 Q 120,70 120,80 L 120,120 Q 120,130 110,130 L 90,130 Q 80,130 80,120 Z",
      scale: 1,
    },
    HAPPY: {
      d: "M 80,110 Q 100,80 120,110 L 120,115 Q 100,85 80,115 Z",
      scale: 1.05,
    },
    SAD: {
      d: "M 80,95 Q 80,85 90,85 L 110,85 Q 120,85 120,95 L 120,145 Q 120,155 110,155 L 90,155 Q 80,155 80,145 Z",
      scale: 1,
    },
    CONFUSED: {
      d: "M 85,85 Q 85,75 95,75 L 115,75 Q 125,75 125,85 L 125,115 Q 125,125 115,125 L 95,125 Q 85,125 85,115 Z",
      scale: 0.9,
    },
    INTERESTED: {
      d: "M 72,100 a 28,28 0 1,1 56,0 a 28,28 0 1,1 -56,0",
      scale: 1,
    },
    LISTENING: {
      d: "M 80,80 L 110,80 L 110,130 L 80,130 Z",
      scale: 1,
    },
    TALKING: {
      d: "M 80,80 Q 80,70 90,70 L 110,70 Q 120,70 120,80 L 120,120 Q 120,130 110,130 L 90,130 Q 80,130 80,120 Z",
      scale: 1,
    },
  };

  // Right eye with asymmetric behavior for personality
  const rightEyeVariants = {
    NEUTRAL: {
      d: blink 
        ? "M 180,100 L 220,100 L 220,102 L 180,102 Z"
        : "M 180,80 Q 180,70 190,70 L 210,70 Q 220,70 220,80 L 220,120 Q 220,130 210,130 L 190,130 Q 180,130 180,120 Z",
      scale: 1,
    },
    HAPPY: {
      d: "M 180,110 Q 200,80 220,110 L 220,115 Q 200,85 180,115 Z",
      scale: 1.05,
    },
    SAD: {
      d: "M 180,95 Q 180,85 190,85 L 210,85 Q 220,85 220,95 L 220,145 Q 220,155 210,155 L 190,155 Q 180,155 180,145 Z",
      scale: 1,
    },
    CONFUSED: {
      // Asymmetry: right eye stays wider when confused
      d: "M 175,75 Q 175,65 190,65 L 215,65 Q 230,65 230,75 L 230,125 Q 230,135 215,135 L 190,135 Q 175,135 175,125 Z",
      scale: 1.15,
    },
    INTERESTED: {
      d: "M 172,100 a 28,28 0 1,1 56,0 a 28,28 0 1,1 -56,0",
      scale: 1,
    },
    LISTENING: {
      d: "M 190,80 L 220,80 L 220,130 L 190,130 Z",
      scale: 1,
    },
    TALKING: {
      d: "M 180,80 Q 180,70 190,70 L 210,70 Q 220,70 220,80 L 220,120 Q 220,130 210,130 L 190,130 Q 180,130 180,120 Z",
      scale: 1,
    },
  };

  // Eyebrow variants for LISTENING state
  const leftEyebrowVariants = {
    LISTENING: {
      d: "M 65,50 L 115,45 L 115,50 L 65,55 Z",
    }
  };

  const rightEyebrowVariants = {
    LISTENING: {
      d: "M 185,45 L 235,40 L 235,45 L 185,50 Z",
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
          animate={emotion}
          transition={springTransition}
          fill="hsl(var(--primary))"
          filter="url(#glow)"
        />
        <motion.path
          variants={rightEyeVariants}
          animate={emotion}
          transition={springTransition}
          fill="hsl(var(--primary))"
          filter="url(#glow)"
        />
        
        {/* Thought bubble for LISTENING state */}
        {emotion === 'LISTENING' && (
          <motion.g>
            {/* Small dot near eyebrow */}
            <motion.circle 
              cx="235" 
              cy="65" 
              r="3" 
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
              cx="245" 
              cy="50" 
              r="4" 
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
              cx="255" 
              cy="50" 
              r="4" 
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
              cx="265" 
              cy="50" 
              r="4" 
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
              : emotion === 'INTERESTED'
              ? { x: [-1, 1, -1] }
              : {}
          }
          transition={{
            duration: emotion === 'HAPPY' ? 2.5 : emotion === 'INTERESTED' ? 3 : 2,
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