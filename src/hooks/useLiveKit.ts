import { useState, useCallback, useEffect, useRef } from "react";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  Track,
  TrackPublication,
} from "livekit-client";
import { generateLiveKitToken } from "@/lib/livekit-token";
import { EmotionState } from "@/contexts/VoiceContext";

interface UseLiveKitReturn {
  room: Room | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (roomName?: string, participantName?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  toggleMute: () => Promise<void>;
  isMuted: boolean;
}

export const useLiveKit = (
  onEmotionUpdate?: (emotion: EmotionState) => void
): UseLiveKitReturn => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const roomRef = useRef<Room | null>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const connect = useCallback(
    async (
      roomName: string = "rummi-room",
      participantName: string = "user"
    ) => {
      if (isConnecting || isConnected) {
        return;
      }

      setIsConnecting(true);
      setError(null);

      try {
        const livekitUrl = import.meta.env.VITE_LIVEKIT_URL;
        const apiKey = import.meta.env.VITE_LIVEKIT_API_KEY;
        const apiSecret = import.meta.env.VITE_LIVEKIT_API_SECRET;

        if (!livekitUrl) {
          throw new Error(
            "VITE_LIVEKIT_URL is not set in environment variables"
          );
        }

        // Generate access token
        const token = await generateLiveKitToken(
          roomName,
          participantName,
          apiKey,
          apiSecret
        );

        // Create and connect to room
        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: { width: 1280, height: 720 },
          },
        });

        // Set up event listeners before connecting
        setupRoomListeners(newRoom, onEmotionUpdate, audioElementsRef);

        // Connect to room
        await newRoom.connect(livekitUrl, token);

        // Request microphone permission and enable audio
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          // Enable microphone in room
          await newRoom.localParticipant.setMicrophoneEnabled(true);
          // Stop the local stream as LiveKit will handle it
          stream.getTracks().forEach((track) => track.stop());
        } catch (err) {
          console.warn("Microphone permission denied or unavailable:", err);
          // Continue without microphone - user can enable it later
        }

        setRoom(newRoom);
        roomRef.current = newRoom;
        setIsConnected(true);
        setIsMuted(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to connect to LiveKit";
        setError(errorMessage);
        console.error("LiveKit connection error:", err);
      } finally {
        setIsConnecting(false);
      }
    },
    [isConnecting, isConnected, onEmotionUpdate]
  );

  const disconnect = useCallback(async () => {
    // Clean up all audio elements
    audioElementsRef.current.forEach((audioElement) => {
      audioElement.pause();
      audioElement.srcObject = null;
      if (audioElement.parentNode) {
        audioElement.parentNode.removeChild(audioElement);
      }
    });
    audioElementsRef.current.clear();
    
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
      setRoom(null);
      setIsConnected(false);
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      const microphoneEnabled =
        roomRef.current.localParticipant.isMicrophoneEnabled;
      await roomRef.current.localParticipant.setMicrophoneEnabled(
        !microphoneEnabled
      );
      setIsMuted(!microphoneEnabled);
    } catch (err) {
      console.error("Failed to toggle microphone:", err);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all audio elements
      audioElementsRef.current.forEach((audioElement) => {
        audioElement.pause();
        audioElement.srcObject = null;
        if (audioElement.parentNode) {
          audioElement.parentNode.removeChild(audioElement);
        }
      });
      audioElementsRef.current.clear();
      
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  return {
    room,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    toggleMute,
    isMuted,
  };
};

function setupRoomListeners(
  room: Room,
  onEmotionUpdate?: (emotion: EmotionState) => void,
  audioElementsRef?: React.MutableRefObject<Map<string, HTMLAudioElement>>
) {
  // Handle connection state changes
  room.on(RoomEvent.Connected, () => {
    console.log("Connected to LiveKit room");
  });

  room.on(RoomEvent.Disconnected, () => {
    console.log("Disconnected from LiveKit room");
  });

  room.on(RoomEvent.Reconnecting, () => {
    console.log("Reconnecting to LiveKit room...");
  });

  room.on(RoomEvent.Reconnected, () => {
    console.log("Reconnected to LiveKit room");
  });

  // Handle data messages for emotion updates
  room.on(RoomEvent.DataReceived, (payload, participant) => {
    if (!participant || participant.isLocal) return;

    try {
      const data = JSON.parse(new TextDecoder().decode(payload));

      if (data.type === "emotion_update" && data.emotion) {
        const emotion = data.emotion as EmotionState;
        console.log("Emotion update received:", emotion);
        onEmotionUpdate?.(emotion);
      }
    } catch (err) {
      console.error("Failed to parse emotion update:", err);
    }
  });

  // Handle participant events
  room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
    console.log("Participant connected:", participant.identity);

    // Set emotion to NEUTRAL when agent connects
    onEmotionUpdate?.("NEUTRAL");
  });

  room.on(
    RoomEvent.ParticipantDisconnected,
    (participant: RemoteParticipant) => {
      console.log("Participant disconnected:", participant.identity);

      // Set emotion to NEUTRAL when agent disconnects
      onEmotionUpdate?.("NEUTRAL");
    }
  );

  // Handle track subscriptions (audio from agent)
  room.on(
    RoomEvent.TrackSubscribed,
    (
      track: Track,
      publication: TrackPublication | undefined,
      participant: RemoteParticipant | undefined
    ) => {
      if (track.kind === "audio" && participant && !participant.isLocal) {
        console.log("Agent audio track subscribed:", track.sid);

        const trackId = track.sid || `${participant.identity}-audio`;
        
        // Create and configure audio element
        const audioElement = track.attach() as HTMLAudioElement;
        audioElement.autoplay = true;
        audioElement.volume = 1.0;
        audioElement.setAttribute("playsinline", "true");
        audioElement.setAttribute("data-participant", participant.identity);
        audioElement.setAttribute("data-track-id", trackId);
        
        // Add to DOM (hidden) to ensure playback works in all browsers
        audioElement.style.display = "none";
        document.body.appendChild(audioElement);
        
        // Track the audio element for cleanup
        if (audioElementsRef) {
          audioElementsRef.current.set(trackId, audioElement);
        }

        // Play audio with error handling
        audioElement.play()
          .then(() => {
            console.log("Agent audio playback started:", trackId);
          })
          .catch((err) => {
            console.error("Failed to play agent audio:", err);
          });
      }
    }
  );

  room.on(
    RoomEvent.TrackUnsubscribed,
    (
      track: Track,
      publication: TrackPublication | undefined,
      participant: RemoteParticipant | undefined
    ) => {
      if (track.kind === "audio" && audioElementsRef) {
        const trackId = track.sid || `${participant?.identity || "unknown"}-audio`;
        const audioElement = audioElementsRef.current.get(trackId);
        
        if (audioElement) {
          audioElement.pause();
          audioElement.srcObject = null;
          if (audioElement.parentNode) {
            audioElement.parentNode.removeChild(audioElement);
          }
          audioElementsRef.current.delete(trackId);
          console.log("Agent audio track unsubscribed and cleaned up:", trackId);
        }
        
        track.detach();
      }
    }
  );

  // Handle speaking events
  room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
    if (speakers.length > 0) {
      const speaker = speakers[0];
      if (speaker && !speaker.isLocal) {
        // Agent is speaking
        onEmotionUpdate?.("TALKING");
      } else if (speaker && speaker.isLocal) {
        // User is speaking
        onEmotionUpdate?.("LISTENING");
      }
    } else {
      // No one speaking
      onEmotionUpdate?.("NEUTRAL");
    }
  });
}
