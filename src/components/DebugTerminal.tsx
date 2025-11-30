import { Button } from "@/components/ui/button";
import { EmotionState, useVoice } from "@/contexts/VoiceContext";
import { useState, useEffect, useRef } from "react";

export const DebugTerminal = () => {
  const { emotion, setEmotion } = useVoice();
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const loopRef = useRef<boolean>(false);

  const emotions: EmotionState[] = [
    "NEUTRAL",
    "HAPPY",
    "SAD",
    "CONFUSED",
    "THINKING",
    "LISTENING",
    "TALKING",
  ];

  const sequence: Array<{ state: EmotionState; duration: number }> = [
    { state: "TALKING", duration: 3000 },
    { state: "LISTENING", duration: 2000 },
    { state: "HAPPY", duration: 3000 },
    { state: "NEUTRAL", duration: 1000 },
  ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runLoop = async () => {
      if (!loopRef.current) return;

      for (const step of sequence) {
        if (!loopRef.current) break;
        setEmotion(step.state);
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, step.duration);
        });
      }

      if (loopRef.current) {
        runLoop();
      }
    };

    if (isRunningDemo) {
      loopRef.current = true;
      runLoop();
    }

    return () => {
      loopRef.current = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRunningDemo]);

  const toggleDemoLoop = () => {
    setIsRunningDemo(!isRunningDemo);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-secondary border-2 border-primary p-4 retro-glow">
      <div className="text-primary font-retro text-xl mb-3">
        {"> DEBUG_TERMINAL"}
      </div>

      <div className="text-primary font-retro text-sm mb-2">
        CURRENT: {emotion}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {emotions.map((emo) => (
          <Button
            key={emo}
            onClick={() => setEmotion(emo)}
            variant={emotion === emo ? "default" : "secondary"}
            className="font-retro text-xs h-8"
          >
            {emo}
          </Button>
        ))}
      </div>

      <Button
        onClick={toggleDemoLoop}
        className="w-full font-retro"
        variant="default"
      >
        {isRunningDemo ? "STOP LOOP" : "START LOOP"}
      </Button>
    </div>
  );
};
