import { useState, useEffect } from 'react';
import { RotateCw } from 'lucide-react';

export const OrientationLock = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center gap-8">
      <RotateCw className="w-24 h-24 text-primary animate-pulse" style={{ imageRendering: 'pixelated' }} />
      <div className="text-center px-8">
        <h1 className="text-4xl font-retro text-primary mb-4 retro-glow">
          ROTATE DEVICE
        </h1>
        <p className="text-2xl font-retro text-primary opacity-70">
          This application requires landscape orientation
        </p>
      </div>
    </div>
  );
};
