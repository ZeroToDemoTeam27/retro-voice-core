import { VoiceProvider, useVoice } from '@/contexts/VoiceContext';
import { useAuth } from '@/contexts/AuthContext';
import { CRTOverlay } from '@/components/CRTOverlay';
import { OrientationLock } from '@/components/OrientationLock';
import { PixelFace } from '@/components/PixelFace';
import { DebugTerminal } from '@/components/DebugTerminal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const VoiceAgentContent = () => {
  const { emotion } = useVoice();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
      <CRTOverlay />
      <OrientationLock />
      
      {/* Top Navigation */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/profile')}
          className="font-retro"
        >
          <User className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          onClick={signOut}
          className="font-retro"
        >
          Sign Out
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 z-10">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-retro text-primary retro-glow mb-2">RUMMI</h1>
          <div className="text-2xl font-retro text-primary opacity-60">
            Your personal coach
          </div>
          {user && (
            <div className="text-sm font-retro text-primary opacity-40 mt-2">
              Welcome, {user.email}
            </div>
          )}
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
  return <VoiceProvider>
      <VoiceAgentContent />
    </VoiceProvider>;
};
export default Index;