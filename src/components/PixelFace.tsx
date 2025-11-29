import { motion } from 'framer-motion';
import { EmotionState } from '@/contexts/VoiceContext';
import { useEffect, useState } from 'react';

interface PixelFaceProps {
  emotion: EmotionState;
}

export const PixelFace = ({ emotion }: PixelFaceProps) => {
  const [blink, setBlink] = useState(false);

  // Blink animation for NEUTRAL state
  useEffect(() => {
    if (emotion !== 'NEUTRAL') return;
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
      d: "M 100,100 m -28,0 a 28,28 0 1,0 56,0 a 28,28 0 1,0 -56,0",
      scale: 1.1,
    },
    LISTENING: {
      d: "M 80,80 Q 80,70 90,70 L 110,70 Q 120,70 120,80 L 120,120 Q 120,130 110,130 L 90,130 Q 80,130 80,120 Z",
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
      d: "M 200,100 m -28,0 a 28,28 0 1,0 56,0 a 28,28 0 1,0 -56,0",
      scale: 1.1,
    },
    LISTENING: {
      d: "M 180,80 Q 180,70 190,70 L 210,70 Q 220,70 220,80 L 220,120 Q 220,130 210,130 L 190,130 Q 180,130 180,120 Z",
      scale: 1,
    },
    TALKING: {
      d: "M 180,80 Q 180,70 190,70 L 210,70 Q 220,70 220,80 L 220,120 Q 220,130 210,130 L 190,130 Q 180,130 180,120 Z",
      scale: 1,
    },
  };

  const renderEyes = () => {
    return (
      <>
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
        {emotion === 'LISTENING' && (
          <motion.g
            animate={{
              opacity: [0.6, 1, 0.6],
              y: [-2, 4, -2]
            }}
            transition={{
              duration: 2.7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <circle cx="150" cy="35" r="18" fill="hsl(var(--primary))" filter="url(#glow)" />
            <rect x="145" y="50" width="10" height="8" fill="hsl(var(--primary))" />
          </motion.g>
        )}
      </>
    );
  };
  const mouthVariants = {
    NEUTRAL: {
      d: "M 120,200 L 180,200",
    },
    HAPPY: {
      d: "M 100,190 Q 150,220 200,190",
    },
    SAD: {
      d: "M 100,210 Q 150,180 200,210",
    },
    CONFUSED: {
      d: "M 100,200 L 130,190 L 160,200 L 190,195",
    },
    INTERESTED: {
      d: "M 140,200 Q 150,195 160,200",
    },
    LISTENING: {
      d: "M 100,190 Q 150,215 200,190",
    },
    TALKING: {
      d: "M 120,200 L 180,200",
    },
  };

  const renderMouth = () => {
    if (emotion === 'TALKING') {
      const bars = [-20, -10, 0, 10, 20];
      return (
        <g>
          {bars.map((offset, i) => (
            <motion.rect
              key={i}
              x={150 + offset - 5}
              y="180"
              width="10"
              height="40"
              fill="hsl(var(--primary))"
              animate={{
                height: [40, 60, 30, 70, 40]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                times: [0, 0.25, 0.5, 0.75, 1],
                delay: i * 0.1,
                ease: "easeInOut"
              }}
              filter="url(#glow)"
            />
          ))}
        </g>
      );
    }

    return (
      <motion.path
        variants={mouthVariants}
        animate={emotion}
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transition={springTransition}
        filter="url(#glow)"
      />
    );
  };
  return (
    <motion.div
      className="flex items-center justify-center"
      animate={emotion === 'LISTENING' ? { scale: 1.08 } : { scale: 1 }}
      transition={springTransition}
    >
      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        className="border-none"
        style={{
          backgroundColor: 'hsl(var(--background))',
          borderRadius: '20px',
          boxShadow: 'inset 0 0 20px rgba(255, 176, 0, 0.15), 0 0 30px rgba(0,0,0,0.5)',
        }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
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
          {renderMouth()}
        </motion.g>
      </svg>
    </motion.div>
  );
};