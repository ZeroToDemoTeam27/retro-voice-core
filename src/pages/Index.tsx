import { VoiceProvider, useVoice } from '@/contexts/VoiceContext';
import { CRTOverlay } from '@/components/CRTOverlay';
import { OrientationLock } from '@/components/OrientationLock';
import { PixelFace } from '@/components/PixelFace';
import { DebugTerminal } from '@/components/DebugTerminal';

const VoiceAgentContent = () => {
  const { emotion } = useVoice();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
      <CRTOverlay />
      <OrientationLock />
      
      <div className="flex flex-col items-center justify-center gap-8 z-10">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-retro text-primary retro-glow mb-2">
            ANALOG_VOICE_AGENT
          </h1>
          <div className="text-2xl font-retro text-primary opacity-60">
            {'[RETRO_FUTURISM_SYSTEM_v1.0]'}
          </div>
        </div>

        <PixelFace emotion={emotion} />

        <div className="text-center mt-4">
          <div className="text-xl font-retro text-primary">
            STATUS: {emotion}
          </div>
        </div>
      </div>

      <DebugTerminal />
    </div>
  );
};

const Index = () => {
  return (
    <VoiceProvider>
      <VoiceAgentContent />
    </VoiceProvider>
  );
};

export default Index;
