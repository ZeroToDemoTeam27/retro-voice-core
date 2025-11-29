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

  const renderEyes = () => {
    const baseTransition = { type: "tween" as const, duration: 0.15 };

    switch (emotion) {
      case 'NEUTRAL':
        return (
          <>
            <motion.rect
              x="80" y="80"
              width="40" height={blink ? "2" : "40"}
              fill="hsl(var(--primary))"
              transition={baseTransition}
            />
            <motion.rect
              x="180" y="80"
              width="40" height={blink ? "2" : "40"}
              fill="hsl(var(--primary))"
              transition={baseTransition}
            />
          </>
        );

      case 'HAPPY':
        return (
          <>
            <motion.path
              d="M 80 100 L 100 80 L 120 100 Z"
              fill="hsl(var(--primary))"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={baseTransition}
            />
            <motion.path
              d="M 180 100 L 200 80 L 220 100 Z"
              fill="hsl(var(--primary))"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={baseTransition}
            />
          </>
        );

      case 'SAD':
        return (
          <>
            <motion.rect
              x="80" y="90"
              width="40" height="60"
              fill="hsl(var(--primary))"
              transition={baseTransition}
            />
            <motion.rect
              x="180" y="90"
              width="40" height="60"
              fill="hsl(var(--primary))"
              transition={baseTransition}
            />
          </>
        );

      case 'CONFUSED':
        return (
          <>
            <motion.rect
              x="80" y="70"
              width="50" height="50"
              fill="hsl(var(--primary))"
              transition={baseTransition}
            />
            <motion.rect
              x="190" y="100"
              width="30" height="30"
              fill="hsl(var(--primary))"
              transition={baseTransition}
            />
          </>
        );

      case 'INTERESTED':
        return (
          <>
            <motion.circle
              cx="100" cy="100"
              r="25"
              fill="hsl(var(--primary))"
              transition={baseTransition}
            />
            <motion.circle
              cx="200" cy="100"
              r="25"
              fill="hsl(var(--primary))"
              transition={baseTransition}
            />
          </>
        );

      case 'ENGAGED':
        return (
          <>
            <motion.rect
              x="80" y="80"
              width="40" height="40"
              fill="hsl(var(--primary))"
            />
            <motion.rect
              x="180" y="80"
              width="40" height="40"
              fill="hsl(var(--primary))"
            />
            <motion.rect
              x="135" y="30"
              width="30" height="30"
              fill="hsl(var(--primary))"
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </>
        );

      case 'LISTENING':
        return (
          <>
            <motion.rect
              x="80" y="80"
              width="40" height="40"
              fill="hsl(var(--primary))"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.rect
              x="180" y="80"
              width="40" height="40"
              fill="hsl(var(--primary))"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </>
        );
    }
  };

  const renderMouth = () => {
    const baseTransition = { type: "tween" as const, duration: 0.15 };

    if (emotion === 'LISTENING') {
      const bars = [40, 60, 80, 100, 120];
      return (
        <g>
          {bars.map((x, i) => (
            <motion.rect
              key={i}
              x={100 + x}
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
                delay: i * 0.1
              }}
            />
          ))}
        </g>
      );
    }

    switch (emotion) {
      case 'NEUTRAL':
        return (
          <motion.line
            x1="120" y1="200"
            x2="180" y2="200"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            transition={baseTransition}
          />
        );

      case 'HAPPY':
      case 'ENGAGED':
        return (
          <motion.path
            d="M 100 190 Q 150 220 200 190"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            fill="none"
            transition={baseTransition}
          />
        );

      case 'SAD':
        return (
          <motion.path
            d="M 100 210 Q 150 180 200 210"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            fill="none"
            transition={baseTransition}
          />
        );

      case 'CONFUSED':
        return (
          <motion.path
            d="M 100 200 L 130 190 L 160 200 L 190 195"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            fill="none"
            transition={baseTransition}
          />
        );

      case 'INTERESTED':
        return (
          <motion.ellipse
            cx="150" cy="200"
            rx="15" ry="20"
            fill="hsl(var(--primary))"
            transition={baseTransition}
          />
        );
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center"
      animate={emotion === 'ENGAGED' ? { scale: 1.1 } : { scale: 1 }}
      transition={{ type: "tween", duration: 0.15 }}
    >
      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        className="retro-glow"
        style={{ filter: 'drop-shadow(0 0 15px rgba(255, 176, 0, 0.4))' }}
      >
        {renderEyes()}
        {renderMouth()}
      </svg>
    </motion.div>
  );
};
