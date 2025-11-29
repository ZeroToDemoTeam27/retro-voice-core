import { Button } from '@/components/ui/button';
import { EmotionState, useVoice } from '@/contexts/VoiceContext';
import { useState } from 'react';

export const DebugTerminal = () => {
  const { emotion, setEmotion } = useVoice();
  const [isRunningDemo, setIsRunningDemo] = useState(false);

  const emotions: EmotionState[] = [
    'NEUTRAL',
    'HAPPY',
    'SAD',
    'CONFUSED',
    'INTERESTED',
    'ENGAGED',
    'LISTENING'
  ];

  const runDemoLoop = async () => {
    if (isRunningDemo) return;
    setIsRunningDemo(true);

    const sequence: Array<{ state: EmotionState; duration: number }> = [
      { state: 'LISTENING', duration: 3000 },
      { state: 'ENGAGED', duration: 2000 },
      { state: 'HAPPY', duration: 3000 },
      { state: 'NEUTRAL', duration: 1000 },
    ];

    for (const step of sequence) {
      setEmotion(step.state);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    setIsRunningDemo(false);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-secondary border-2 border-primary p-4 retro-glow">
      <div className="text-primary font-retro text-xl mb-3">
        {'> DEBUG_TERMINAL'}
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
        onClick={runDemoLoop}
        disabled={isRunningDemo}
        className="w-full font-retro"
        variant="default"
      >
        {isRunningDemo ? 'RUNNING...' : 'DEMO LOOP'}
      </Button>
    </div>
  );
};
