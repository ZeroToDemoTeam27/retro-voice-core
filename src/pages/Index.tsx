import { useState, useEffect } from 'react';
import { VoiceProvider, useVoice } from '@/contexts/VoiceContext';
import { useAuth } from '@/contexts/AuthContext';
import { CRTOverlay } from '@/components/CRTOverlay';
import { OrientationLock } from '@/components/OrientationLock';
import { PixelFace } from '@/components/PixelFace';
import { DebugTerminal } from '@/components/DebugTerminal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Minimize2, Maximize2, Mic, MicOff, Power, PowerOff } from 'lucide-react';
import { useLiveKit } from '@/hooks/useLiveKit';
import { toast } from 'sonner';

const VoiceAgentContent = () => {
  const { emotion, updateEmotionFromLiveKit, setIsConnected } = useVoice();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [focusMode, setFocusMode] = useState(false);
  
  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    toggleMute,
    isMuted,
  } = useLiveKit(updateEmotionFromLiveKit);

  // Sync LiveKit connection state with VoiceContext
  useEffect(() => {
    setIsConnected(isConnected);
  }, [isConnected, setIsConnected]);

  // Show error toast if connection fails
  useEffect(() => {
    if (error) {
      toast.error(`Connection error: ${error}`);
    }
  }, [error]);

  const handleConnect = async () => {
    try {
      const roomName = `rummi-${user?.id || 'guest'}`;
      const participantName = user?.email || 'Guest';
      await connect(roomName, participantName);
      toast.success('Connected to RUMMI');
    } catch (err) {
      toast.error('Failed to connect');
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    toast.info('Disconnected from RUMMI');
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
      <CRTOverlay />
      <OrientationLock />
      
      {/* Top Navigation - Hidden in focus mode */}
      {!focusMode && (
        <div className="absolute top-6 right-6 z-20 flex gap-3 animate-fade-in">
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
      )}

      {/* Focus Mode Toggle */}
      <div className={`absolute ${focusMode ? 'top-6 right-6' : 'top-6 left-6'} z-20 animate-fade-in`}>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setFocusMode(!focusMode)}
          className="font-retro"
          title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
        >
          {focusMode ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* LiveKit Connection Controls - Hidden in focus mode */}
      {!focusMode && (
        <div className="absolute bottom-6 left-6 z-20 flex flex-wrap gap-3 max-w-md animate-fade-in">
          {!isConnected ? (
            <Button
              variant="outline"
              onClick={handleConnect}
              disabled={isConnecting}
              className="font-retro"
            >
              {isConnecting ? (
                <>
                  <Power className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  Connect to RUMMI
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMute}
                className="font-retro"
                title={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="font-retro"
              >
                <PowerOff className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </>
          )}
        </div>
      )}

      <div className="flex flex-col items-center justify-center gap-8 z-10">
        {/* Title and Welcome - Hidden in focus mode */}
        {!focusMode && (
          <div className="text-center mb-8 animate-fade-in">
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
        )}

        <PixelFace emotion={emotion} />

        {/* Status - Hidden in focus mode */}
        {!focusMode && (
          <div className="text-center mt-4 animate-fade-in">
            <div className="text-xl font-retro text-primary">
              STATUS: {emotion}
            </div>
            {isConnected && (
              <div className="text-sm font-retro text-primary opacity-60 mt-2">
                {isMuted ? '🔇 Muted' : '🎤 Listening'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Debug Terminal - Hidden in focus mode */}
      {!focusMode && <DebugTerminal />}
    </div>
  );
};
const Index = () => {
  return <VoiceProvider>
      <VoiceAgentContent />
    </VoiceProvider>;
};
export default Index;