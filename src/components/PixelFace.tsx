import { motion } from "framer-motion";
import { EmotionState } from "@/contexts/VoiceContext";
import { useEffect, useState, useMemo } from "react";

interface PixelFaceProps {
  emotion: EmotionState;
}

// --- 1. Custom Hook for Natural Blinking ---
const useNaturalBlink = (emotion: EmotionState) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    // Only blink for THINKING state
    const shouldBlink = emotion === "THINKING";

    if (!shouldBlink) {
      setIsBlinking(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const triggerBlink = () => {
      // Randomize the closed-eye duration (fast blink vs sleepy blink)
      const duration = 150 + Math.random() * 50;

      setIsBlinking(true);

      setTimeout(() => {
        setIsBlinking(false);
        // Randomize time between blinks (2s to 6s)
        const nextDelay = Math.random() * 4000 + 2000;
        timeoutId = setTimeout(triggerBlink, nextDelay);
      }, duration);
    };

    // Start the loop
    timeoutId = setTimeout(triggerBlink, Math.random() * 2000);

    return () => clearTimeout(timeoutId);
  }, [emotion]);

  return isBlinking;
};

export const PixelFace = ({ emotion }: PixelFaceProps) => {
  const isBlinking = useNaturalBlink(emotion);

  // --- 2. Eyebrow State Logic ---
  // Show eyebrows only for THINKING state (not CONFUSED)
  // Once they appear, they stay visible while in THINKING state
  const [hasShownEyebrows, setHasShownEyebrows] = useState(false);

  useEffect(() => {
    if (emotion === "THINKING") {
      // Mark that eyebrows have been shown
      setHasShownEyebrows(true);
    } else {
      // Hide eyebrows when switching to any other emotion (including CONFUSED)
      setHasShownEyebrows(false);
    }
  }, [emotion]);

  // --- 3. TALKING State Logic (Squeeze/Smile) ---
  // We use a simple toggle to create a rhythmic bounce when talking
  const [isTalkingBounce, setIsTalkingBounce] = useState(false);

  useEffect(() => {
    if (emotion !== "TALKING") return;

    const interval = setInterval(() => {
      setIsTalkingBounce((prev) => !prev);
    }, 200); // Speed of talking bounce

    return () => clearInterval(interval);
  }, [emotion]);

  // --- 3. Path Definitions (Your Original Shapes) ---
  const leftEyePaths = {
    NEUTRAL:
      "M 60,70 Q 60,50 80,50 L 120,50 Q 140,50 140,70 L 140,130 Q 140,150 120,150 L 80,150 Q 60,150 60,130 Z",
    HAPPY: "M 60,120 Q 100,70 140,120 L 140,130 Q 100,80 60,130 Z",
    SAD: "M 60,90 Q 60,70 80,70 L 120,70 Q 140,70 140,90 L 140,160 Q 140,180 120,180 L 80,180 Q 60,180 60,160 Z",
    CONFUSED:
      "M 55,75 Q 55,55 75,55 L 115,55 Q 135,55 135,75 L 135,125 Q 135,145 115,145 L 75,145 Q 55,145 55,125 Z",
    THINKING:
      "M 55,75 Q 55,55 75,55 L 115,55 Q 135,55 135,75 L 135,125 Q 135,145 115,145 L 75,145 Q 55,145 55,125 Z",
    LISTENING:
      "M 60,70 Q 60,50 80,50 L 120,50 Q 140,50 140,70 L 140,130 Q 140,150 120,150 L 80,150 Q 60,150 60,130 Z", // Same as NEUTRAL for smooth transition
    TALKING:
      "M 60,75 Q 60,55 80,55 L 120,55 Q 140,55 140,75 L 140,125 Q 140,145 120,145 L 80,145 Q 60,145 60,125 Z",
  };

  const rightEyePaths = {
    NEUTRAL:
      "M 160,70 Q 160,50 180,50 L 220,50 Q 240,50 240,70 L 240,130 Q 240,150 220,150 L 180,150 Q 160,150 160,130 Z",
    HAPPY: "M 160,120 Q 200,70 240,120 L 240,130 Q 200,80 160,130 Z",
    SAD: "M 160,90 Q 160,70 180,70 L 220,70 Q 240,70 240,90 L 240,160 Q 240,180 220,180 L 180,180 Q 160,180 160,160 Z",
    CONFUSED:
      "M 165,65 Q 165,45 190,45 L 235,45 Q 260,45 260,65 L 260,135 Q 260,155 235,155 L 190,155 Q 165,155 165,135 Z",
    THINKING:
      "M 165,65 Q 165,45 190,45 L 235,45 Q 260,45 260,65 L 260,135 Q 260,155 235,155 L 190,155 Q 165,155 165,135 Z",
    LISTENING:
      "M 160,70 Q 160,50 180,50 L 220,50 Q 240,50 240,70 L 240,130 Q 240,150 220,150 L 180,150 Q 160,150 160,130 Z", // Same as NEUTRAL for smooth transition
    TALKING:
      "M 160,75 Q 160,55 180,55 L 220,55 Q 240,55 240,75 L 240,125 Q 240,145 220,145 L 180,145 Q 160,145 160,125 Z",
  };

  const leftEyebrow = "M 50,30 L 130,25 L 130,32 L 50,37 Z";
  const rightEyebrow = "M 170,25 L 250,20 L 250,27 L 170,32 Z";

  // --- 4. Transition Logic ---
  // This is key: Blinks must be fast (easeOut), Shape changes must be springy.
  // LISTENING uses same shape as NEUTRAL, so transitions are instant and smooth
  const getTransition = (prop: string) => {
    if (prop === "d") {
      // Instant transition for LISTENING since it uses same shape as NEUTRAL
      if (emotion === "LISTENING" || previousEmotion === "LISTENING") {
        return {
          duration: 0.3,
          ease: "easeInOut" as const,
        };
      }
      return {
        type: "spring" as const,
        stiffness: 120,
        damping: 20,
        mass: 1.2,
      }; // Smooth morph
    }
    if (prop === "scaleY") {
      return isBlinking
        ? { duration: 0.1, ease: "easeOut" as const } // Fast blink shut
        : { type: "spring" as const, stiffness: 300, damping: 25 }; // Snap open
    }
    if (prop === "y") {
      // Smooth float transition for LISTENING
      if (emotion === "LISTENING") {
        return {
          type: "spring" as const,
          stiffness: 100,
          damping: 20,
          mass: 1.3,
        };
      }
    }
    return { type: "spring" as const, stiffness: 150, damping: 18 };
  };

  // Track previous emotion to detect transitions
  const [previousEmotion, setPreviousEmotion] = useState<EmotionState>(emotion);

  useEffect(() => {
    setPreviousEmotion(emotion);
  }, [emotion]);

  // --- 5. State Calculation ---
  // Calculate target visual state based on priority: Blink > Talk > Emotion
  const getEyeState = (side: "left" | "right") => {
    const isLeft = side === "left";
    const currentPath = isLeft
      ? leftEyePaths[emotion] || leftEyePaths.NEUTRAL
      : rightEyePaths[emotion] || rightEyePaths.NEUTRAL;

    let scaleY = 1;
    let scaleX = 1;
    let translateY = 0;

    // A. Handle Blink (Highest Priority)
    if (isBlinking) {
      scaleY = 0.1;
    }
    // B. Handle Talking Bounce
    else if (emotion === "TALKING") {
      if (isTalkingBounce) {
        scaleY = 0.9;
        scaleX = 1.05;
      } else {
        scaleY = 1.02;
        scaleX = 0.98;
      }
    }
    // C. Handle Emotion specifics
    else if (emotion === "HAPPY") {
      scaleX = 1.05;
    } else if ((emotion === "CONFUSED" || emotion === "THINKING") && !isLeft) {
      scaleX = 1.15; // Asymmetric confused/thinking eye
    }

    // LISTENING: Subtle float animation (same eye shape as NEUTRAL, just animated)
    if (emotion === "LISTENING") {
      translateY = -2; // Subtle float
    }

    return {
      d: currentPath,
      scaleY,
      scaleX,
      y: translateY,
    };
  };

  return (
    <motion.div
      className="flex items-center justify-center"
      // Container breathing animation for listening - smooth fade-in
      animate={
        emotion === "LISTENING"
          ? { scale: [1, 1.03, 1], opacity: [0.95, 1, 0.95] }
          : { scale: 1, opacity: 1 }
      }
      transition={{
        scale: {
          duration: emotion === "LISTENING" ? 3.5 : 0.4,
          repeat: emotion === "LISTENING" ? Infinity : 0,
          ease: "easeInOut",
        },
        opacity: {
          duration: emotion === "LISTENING" ? 0.5 : 0.3,
          ease: "easeInOut",
        },
      }}
    >
      <svg width="300" height="300" viewBox="0 -50 300 300">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Render Eyes --- */}
        <motion.g
          animate={emotion === "HAPPY" ? { y: [-2, 2, -2] } : { y: 0 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* THINKING EYEBROWS (THINKING state only, not CONFUSED) */}
          <motion.path
            d={leftEyebrow}
            fill="hsl(var(--primary))"
            filter="url(#glow)"
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: hasShownEyebrows ? 1 : 0,
              y: hasShownEyebrows ? [0, -2, 0] : -10,
            }}
            transition={{
              opacity: { duration: 0.3, ease: "easeInOut" },
              y: hasShownEyebrows
                ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 },
            }}
          />
          <motion.path
            d={rightEyebrow}
            fill="hsl(var(--primary))"
            filter="url(#glow)"
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: hasShownEyebrows ? 1 : 0,
              y: hasShownEyebrows ? [0, -2, 0] : -10,
            }}
            transition={{
              opacity: { duration: 0.3, ease: "easeInOut" },
              y: hasShownEyebrows
                ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }
                : { duration: 0.3 },
            }}
          />

          {/* LEFT EYE */}
          <motion.path
            fill="hsl(var(--primary))"
            filter="url(#glow)"
            transformOrigin="100 100" // Pivot point for blinking
            initial={false}
            animate={getEyeState("left")}
            transition={{
              d: getTransition("d"),
              scaleY: getTransition("scaleY"),
              scaleX: getTransition("scaleX"),
              y: getTransition("y"),
            }}
          />

          {/* RIGHT EYE */}
          <motion.path
            fill="hsl(var(--primary))"
            filter="url(#glow)"
            transformOrigin="200 100" // Pivot point for blinking
            initial={false}
            animate={getEyeState("right")}
            transition={{
              d: getTransition("d"),
              scaleY: getTransition("scaleY"),
              scaleX: getTransition("scaleX"),
              y: getTransition("y"),
            }}
          />

          {/* SAD FACE - Circles covering top of eyes to create sad look */}
          {emotion === "SAD" && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Left eye top cover - ellipse that covers the top portion of the eye */}
              <motion.ellipse
                cx="100"
                cy="75"
                rx="50"
                ry="35"
                fill="hsl(var(--background))"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
              {/* Right eye top cover */}
              <motion.ellipse
                cx="200"
                cy="75"
                rx="50"
                ry="35"
                fill="hsl(var(--background))"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </motion.g>
          )}

          {/* LISTENING DOTS (LISTENING STATE) - Smooth fade-in */}
          <motion.g
            animate={{ opacity: emotion === "LISTENING" ? 1 : 0 }}
            transition={{
              opacity: {
                duration: emotion === "LISTENING" ? 0.5 : 0.3,
                ease: "easeInOut",
                delay: emotion === "LISTENING" ? 0.1 : 0,
              },
            }}
          >
            {/* Animated dots to indicate listening */}
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={268 + i * 12}
                cy="30"
                r="5"
                fill="hsl(var(--primary))"
                filter="url(#glow)"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={
                  emotion === "LISTENING"
                    ? {
                        opacity: [0.4, 1, 0.4],
                        scale: [0.9, 1.2, 0.9],
                      }
                    : { opacity: 0, scale: 0.5 }
                }
                transition={{
                  opacity: {
                    duration: emotion === "LISTENING" ? 1.2 : 0.3,
                    repeat: emotion === "LISTENING" ? Infinity : 0,
                    delay: emotion === "LISTENING" ? i * 0.25 : 0,
                    ease: "easeInOut",
                  },
                  scale: {
                    duration: emotion === "LISTENING" ? 1.2 : 0.3,
                    repeat: emotion === "LISTENING" ? Infinity : 0,
                    delay: emotion === "LISTENING" ? i * 0.25 : 0,
                    ease: "easeInOut",
                  },
                }}
              />
            ))}
          </motion.g>
        </motion.g>
      </svg>
    </motion.div>
  );
};
