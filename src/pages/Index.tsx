import { useState, useEffect, useCallback } from "react";
import { VoiceProvider, useVoice } from "@/contexts/VoiceContext";
import { useAuth } from "@/contexts/AuthContext";
import { AdminQuickAccess } from "@/components/AdminQuickAccess";
import { CRTOverlay } from "@/components/CRTOverlay";
import { OrientationLock } from "@/components/OrientationLock";
import { PixelFace } from "@/components/PixelFace";
import { DebugTerminal } from "@/components/DebugTerminal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  User,
  Minimize2,
  Maximize2,
  Mic,
  MicOff,
  Power,
  PowerOff,
  Maximize,
  X,
  MapPin,
  CheckCircle,
  Settings,
} from "lucide-react";
import { useLiveKit, ToolCallEvent } from "@/hooks/useLiveKit";
import { toast } from "sonner";

const VoiceAgentContent = () => {
  const { emotion, updateEmotionFromLiveKit, setIsConnected } = useVoice();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [focusMode, setFocusMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tool call UI states
  const [showMap, setShowMap] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInName, setCheckInName] = useState("");
  const [checkInEmail, setCheckInEmail] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Handle tool calls from the agent
  const handleToolCall = useCallback((toolCall: ToolCallEvent) => {
    console.log("Tool call received in component:", toolCall.tool);

    switch (toolCall.tool) {
      case "show_map":
        setShowMap(true);
        break;
      case "check_in":
        // Auto-fill name if provided by the agent
        if (toolCall.name) {
          setCheckInName(toolCall.name);
        }
        setShowCheckIn(true);
        break;
      default:
        console.warn("Unknown tool call:", toolCall.tool);
    }
  }, []);

  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    toggleMute,
    isMuted,
  } = useLiveKit(updateEmotionFromLiveKit, handleToolCall);

  // Handle check-in form submission
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInName.trim() || !checkInEmail.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsCheckingIn(true);
    // Simulate check-in process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success(`Welcome to Zero2Demo, ${checkInName}! 🎉`);
    setShowCheckIn(false);
    setCheckInName("");
    setCheckInEmail("");
    setIsCheckingIn(false);
  };

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
      const roomName = `rummi-${user?.id || "guest"}`;
      const participantName = user?.email || "Guest";
      await connect(roomName, participantName);
      toast.success("Connected to RUMMI");
    } catch (err) {
      toast.error("Failed to connect");
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    toast.info("Disconnected from RUMMI");
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
      toast.error("Fullscreen not supported");
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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
            onClick={() => navigate("/admin")}
            className="font-retro"
            title="Dashboard"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/profile")}
            className="font-retro"
          >
            <User className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={signOut} className="font-retro">
            Sign Out
          </Button>
        </div>
      )}

      {/* Focus Mode and Fullscreen Toggles */}
      <div
        className={`absolute ${
          focusMode ? "top-4 right-4" : "top-4 left-4"
        } z-20 flex gap-2 animate-fade-in`}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setFocusMode(!focusMode)}
          className="font-retro"
          title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
        >
          {focusMode ? (
            <Maximize2 className="h-4 w-4" />
          ) : (
            <Minimize2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="font-retro"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
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
                {isMuted ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
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
            <h1 className="text-6xl font-retro text-primary retro-glow mb-2">
              RUMMI
            </h1>
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

        <div className={focusMode ? "scale-[2.5]" : ""}>
          <PixelFace emotion={emotion} />
        </div>

        {/* Status - Hidden in focus mode */}
        {!focusMode && (
          <div className="text-center mt-4 animate-fade-in">
            <div className="text-xl font-retro text-primary">
              STATUS: {emotion}
            </div>
            {isConnected && (
              <div className="text-sm font-retro text-primary opacity-60 mt-2">
                {isMuted ? "🔇 Muted" : "🎤 Listening"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Debug Terminal - Hidden in focus mode */}
      {!focusMode && <DebugTerminal />}

      {/* Admin Quick Access - Hidden in focus mode */}
      {!focusMode && <AdminQuickAccess />}

      {/* Map Overlay */}
      {showMap && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in"
          onClick={() => setShowMap(false)}
        >
          <div 
            className="relative w-[85vw] h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Map container */}
            <div className="relative bg-background border-4 border-primary p-4 retro-glow flex flex-col h-full">
              {/* Close button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowMap(false)}
                className="absolute top-4 right-4 font-retro z-10"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-retro text-primary">VENUE MAP</h2>
              </div>

              {/* Map image */}
              <div className="relative flex-1 bg-muted overflow-hidden border-2 border-primary/50 min-h-0">
                <img
                  src="/hackathon-map.png"
                  alt="Hackathon Venue Map"
                  className="w-full h-full object-contain"
                />

                {/* Map legend */}
                <div className="absolute bottom-4 left-4 bg-background/90 p-3 border border-primary text-sm font-retro">
                  <div className="text-primary mb-2 font-bold">LEGEND</div>
                  <div className="space-y-1 text-primary/80">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500"></div>
                      <span>Hacking Area</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500"></div>
                      <span>Food & Drinks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500"></div>
                      <span>Stage / Demos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500"></div>
                      <span>Mentor Area</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center text-sm font-retro text-primary/60">
                Antler Offices & BLOXHUB • Frederiksholms Kanal 30
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Modal */}
      {showCheckIn && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in"
          onClick={() => setShowCheckIn(false)}
        >
          <div 
            className="relative w-[85vw] h-[85vh] max-w-2xl max-h-[600px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Check-in form container */}
            <div className="bg-background border-4 border-primary p-6 retro-glow flex flex-col h-full justify-center relative">
              {/* Close button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowCheckIn(false)}
                className="absolute top-4 right-4 font-retro z-10"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 mb-6">
                <CheckCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-retro text-primary">CHECK IN</h2>
              </div>

              <form onSubmit={handleCheckInSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-retro text-primary mb-2">
                    YOUR NAME
                  </label>
                  <Input
                    type="text"
                    value={checkInName}
                    onChange={(e) => setCheckInName(e.target.value)}
                    placeholder="Enter your name"
                    className="font-retro"
                    disabled={isCheckingIn}
                  />
                </div>

                <div>
                  <label className="block text-sm font-retro text-primary mb-2">
                    EMAIL ADDRESS
                  </label>
                  <Input
                    type="email"
                    value={checkInEmail}
                    onChange={(e) => setCheckInEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="font-retro"
                    disabled={isCheckingIn}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full font-retro mt-6"
                  disabled={isCheckingIn}
                >
                  {isCheckingIn ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                      CHECKING IN...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      CONFIRM CHECK-IN
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-xs font-retro text-primary/60">
                Zero2Demo AI Hackathon • November 29-30, 2025
              </div>
            </div>
          </div>
        </div>
      )}
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
