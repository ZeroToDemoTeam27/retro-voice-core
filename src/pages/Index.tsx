import { useState, useEffect } from 'react';
import { VoiceProvider, useVoice } from '@/contexts/VoiceContext';
import { useAuth } from '@/contexts/AuthContext';
import { CRTOverlay } from '@/components/CRTOverlay';
import { OrientationLock } from '@/components/OrientationLock';
import { PixelFace } from '@/components/PixelFace';
import { DebugTerminal } from '@/components/DebugTerminal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Minimize2, Maximize2, Mic, MicOff, Power, PowerOff, Maximize } from 'lucide-react';
import { useLiveKit } from '@/hooks/useLiveKit';
import { toast } from 'sonner';

const VoiceAgentContent = () => {
  const { emotion, setEmotion, updateEmotionFromLiveKit, setIsConnected } = useVoice();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [focusMode, setFocusMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      toast.error('Fullscreen not supported');
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Endless emotion cycling loop
  useEffect(() => {
    const emotions: Array<'NEUTRAL' | 'HAPPY' | 'SAD' | 'CONFUSED' | 'INTERESTED' | 'LISTENING' | 'TALKING'> = 
      ['NEUTRAL', 'HAPPY', 'SAD', 'CONFUSED', 'INTERESTED', 'LISTENING', 'TALKING'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % emotions.length;
      setEmotion(emotions[currentIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [setEmotion]);
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
      <CRTOverlay />
      <OrientationLock />
      
      {/* Top Navigation - Hidden in focus mode */}
      {!focusMode && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 animate-fade-in">
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

      {/* Focus Mode and Fullscreen Toggles */}
      <div className={`absolute ${focusMode ? 'top-4 right-4' : 'top-4 left-4'} z-20 flex gap-2 animate-fade-in`}>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setFocusMode(!focusMode)}
          className="font-retro"
          title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
        >
          {focusMode ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleFullscreen}
          className="font-retro"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>

      {/* LiveKit Connection Controls - Hidden in focus mode */}
      {!focusMode && (
        <div className="absolute bottom-4 left-4 z-20 flex gap-2 animate-fade-in">
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