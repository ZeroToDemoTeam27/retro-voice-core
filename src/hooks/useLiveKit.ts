import { useState, useCallback, useEffect, useRef } from "react";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  Track,
  TrackPublication,
  ParticipantKind,
  Participant,
} from "livekit-client";
import { generateLiveKitToken } from "@/lib/livekit-token";
import { EmotionState } from "@/contexts/VoiceContext";

export type ToolCallType = "show_map" | "check_in";

export interface ToolCallEvent {
  type: "tool_call";
  tool: ToolCallType;
  timestamp: number;
  name?: string; // For check_in tool, the pre-filled name
}

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
  onEmotionUpdate?: (emotion: EmotionState) => void,
  onToolCall?: (toolCall: ToolCallEvent) => void
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
        setupRoomListeners(newRoom, onEmotionUpdate, onToolCall, audioElementsRef);

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
    [isConnecting, isConnected, onEmotionUpdate, onToolCall]
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

/**
 * Maps agent state from LiveKit to emotion state
 * @param agentState - The agent state from lk.agent.state attribute
 * @returns The corresponding emotion state
 */
function mapAgentStateToEmotion(agentState: string | undefined): EmotionState {
  switch (agentState) {
    case "initializing":
      return "NEUTRAL";
    case "listening":
      return "LISTENING";
    case "thinking":
      return "CONFUSED";
    case "speaking":
      // 50/50 chance between TALKING and HAPPY - random every time
      return Math.random() < 0.5 ? "TALKING" : "HAPPY";
    default:
      return "NEUTRAL";
  }
}

/**
 * Finds the agent participant in the room
 * @param room - The LiveKit room
 * @returns The agent participant if found, null otherwise
 */
function findAgentParticipant(room: Room): Participant | null {
  // Check remote participants
  for (const participant of room.remoteParticipants.values()) {
    if (participant.isAgent || participant.kind === ParticipantKind.AGENT) {
      return participant;
    }
  }
  return null;
}

/**
 * Updates emotion based on agent state from participant attributes
 * @param participant - The participant (should be agent)
 * @param onEmotionUpdate - Callback to update emotion
 * @param currentAgentState - Current agent state to detect transitions
 * @returns New agent state
 */
function updateEmotionFromAgentState(
  participant: Participant,
  onEmotionUpdate?: (emotion: EmotionState) => void,
  currentAgentState?: string
): string | undefined {
  const agentState = participant.attributes?.["lk.agent.state"];
  if (!agentState) {
    return undefined;
  }

  // Only update emotion when state actually changes (to avoid flickering)
  // This ensures we pick a new random emotion when entering speaking state
  const stateChanged = agentState !== currentAgentState;

  if (stateChanged) {
    const emotion = mapAgentStateToEmotion(agentState);
    console.log(`Agent state: ${agentState} -> Emotion: ${emotion}`);
    onEmotionUpdate?.(emotion);
  }

  return agentState;
}

function setupRoomListeners(
  room: Room,
  onEmotionUpdate?: (emotion: EmotionState) => void,
  onToolCall?: (toolCall: ToolCallEvent) => void,
  audioElementsRef?: React.MutableRefObject<Map<string, HTMLAudioElement>>
) {
  // Track current agent state to detect transitions
  let currentAgentState: string | undefined = undefined;

  // Check for existing agent participant and set initial emotion
  // This handles the case where agent connects before we set up listeners
  const checkExistingAgent = () => {
    const agentParticipant = findAgentParticipant(room);
    if (agentParticipant) {
      currentAgentState = updateEmotionFromAgentState(
        agentParticipant,
        onEmotionUpdate,
        currentAgentState
      );
    }
  };

  // Handle connection state changes
  room.on(RoomEvent.Connected, () => {
    console.log("Connected to LiveKit room");
    // Small delay to ensure participants are loaded
    setTimeout(checkExistingAgent, 100);
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

  // Handle data messages for emotion updates and tool calls
  room.on(RoomEvent.DataReceived, (payload, participant) => {
    if (!participant || participant.isLocal) return;

    try {
      const data = JSON.parse(new TextDecoder().decode(payload));

      if (data.type === "emotion_update" && data.emotion) {
        const emotion = data.emotion as EmotionState;
        console.log("Emotion update received:", emotion);
        onEmotionUpdate?.(emotion);
      } else if (data.type === "tool_call" && data.tool) {
        console.log("Tool call received:", data.tool);
        onToolCall?.(data as ToolCallEvent);
      }
    } catch (err) {
      console.error("Failed to parse data message:", err);
    }
  });

  // Handle participant events
  room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
    console.log("Participant connected:", participant.identity);

    // Check if this is an agent participant
    if (participant.isAgent || participant.kind === ParticipantKind.AGENT) {
      console.log("Agent participant connected");
      // Update emotion based on agent's initial state
      currentAgentState = updateEmotionFromAgentState(
        participant,
        onEmotionUpdate,
        currentAgentState
      );
    }
  });

  room.on(
    RoomEvent.ParticipantDisconnected,
    (participant: RemoteParticipant) => {
      console.log("Participant disconnected:", participant.identity);

      // Set emotion to NEUTRAL when agent disconnects
      if (participant.isAgent || participant.kind === ParticipantKind.AGENT) {
        console.log("Agent participant disconnected");
        currentAgentState = undefined;
        onEmotionUpdate?.("NEUTRAL");
      }
    }
  );

  // Handle participant attributes changes (for agent state updates)
  room.on(
    RoomEvent.ParticipantAttributesChanged,
    (changedAttributes: Record<string, string>, participant: Participant) => {
      // Only process if this is an agent participant
      if (participant.isAgent || participant.kind === ParticipantKind.AGENT) {
        // Check if lk.agent.state was changed
        if ("lk.agent.state" in changedAttributes) {
          currentAgentState = updateEmotionFromAgentState(
            participant,
            onEmotionUpdate,
            currentAgentState
          );
        }
      }
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
        audioElement
          .play()
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
        const trackId =
          track.sid || `${participant?.identity || "unknown"}-audio`;
        const audioElement = audioElementsRef.current.get(trackId);

        if (audioElement) {
          audioElement.pause();
          audioElement.srcObject = null;
          if (audioElement.parentNode) {
            audioElement.parentNode.removeChild(audioElement);
          }
          audioElementsRef.current.delete(trackId);
          console.log(
            "Agent audio track unsubscribed and cleaned up:",
            trackId
          );
        }

        track.detach();
      }
    }
  );
}
