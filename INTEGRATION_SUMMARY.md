# LiveKit Voice Assistant Integration Summary

## Implementation Complete ✅

This document summarizes the LiveKit voice assistant integration using Google Gemini Live API.

## What Was Implemented

### 1. Backend Agent (Python)

**Location**: `agent/` directory

- **`agent.py`**: Main agent implementation using LiveKit Agents SDK with Google Gemini Live API
  - Uses `gemini-2.0-flash-exp` model with `Puck` voice
  - Implements emotion state broadcasting via LiveKit data messages
  - Handles participant events and active speaker detection
  - Includes noise cancellation for better audio quality

- **`requirements.txt`** & **`pyproject.toml`**: Python dependencies
  - `livekit-agents[google]~=1.2`
  - `livekit-plugins-noise-cancellation~=0.2`
  - `python-dotenv`

- **`README.md`**: Setup and deployment instructions

### 2. Frontend Integration (TypeScript/React)

**New Files Created:**

- **`src/hooks/useLiveKit.ts`**: Custom React hook for LiveKit integration
  - Manages room connection/disconnection
  - Handles audio input/output streams
  - Listens for emotion updates via data messages
  - Manages microphone mute/unmute
  - Tracks connection state and errors

- **`src/lib/livekit-token.ts`**: Token generation utility
  - Supports both server-side (recommended) and client-side (dev only) token generation
  - Handles LiveKit access token creation

**Updated Files:**

- **`src/contexts/VoiceContext.tsx`**: Extended with `updateEmotionFromLiveKit` method
- **`src/pages/Index.tsx`**: Integrated LiveKit hook with UI controls
  - Connect/Disconnect buttons
  - Microphone mute/unmute toggle
  - Connection status display
  - Error handling with toast notifications

- **`package.json`**: Added dependencies
  - `livekit-client@^2.5.0`
  - `livekit-rtc@^2.5.0`
  - `livekit-server-sdk@^2.5.0`

## Emotion State Mapping

The agent sends emotion updates to the frontend based on conversation state:

| Agent State | RUMMI Emotion | Trigger |
|------------|---------------|---------|
| User speaking detected | `LISTENING` | Active speaker detection |
| Agent generating response | `TALKING` | Agent audio track active |
| Participant connected | `INTERESTED` | User joins room |
| No activity | `NEUTRAL` | Idle state |
| Positive sentiment | `HAPPY` | (Future: LLM response analysis) |
| Empathetic response | `SAD` | (Future: LLM response analysis) |
| Processing complex query | `CONFUSED` | (Future: Long processing time) |

## Environment Variables Required

### Frontend (`.env`)

```env
VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
VITE_LIVEKIT_API_KEY=your_livekit_api_key  # Dev only
VITE_LIVEKIT_API_SECRET=your_livekit_api_secret  # Dev only
# OR for production:
VITE_LIVEKIT_TOKEN_ENDPOINT=https://your-api.com/api/livekit/token
```

### Backend Agent (`agent/.env.local`)

```env
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
GOOGLE_API_KEY=your_gemini_api_key
# OR for Vertex AI:
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
npm install
# or
bun install
```

### 2. Set Up Python Agent

```bash
cd agent
# Using uv (recommended):
uv add "livekit-agents[google]~=1.2" "livekit-plugins-noise-cancellation~=0.2" "python-dotenv"

# Or using pip:
pip install -r requirements.txt
```

### 3. Configure Environment Variables

- Copy `.env.example` to `.env` and fill in your LiveKit credentials
- Create `agent/.env.local` with your LiveKit and Google API keys

### 4. Run Agent in Development

```bash
cd agent
uv run agent.py dev
# or
python agent.py dev
```

### 5. Run Frontend

```bash
npm run dev
```

## Deployment

### Deploy Agent to LiveKit Cloud

1. Install LiveKit CLI and authenticate:
```bash
brew install livekit-cli  # macOS
lk cloud auth
```

2. Deploy agent:
```bash
cd agent
lk agent create
```

This creates deployment files and registers your agent with LiveKit Cloud.

### Frontend Deployment

Deploy the frontend as usual. Ensure environment variables are set in your hosting platform.

## Architecture

```
┌─────────────────┐         WebRTC          ┌──────────────────┐
│   React App     │◄──────────────────────►│  LiveKit Cloud   │
│  (Frontend)     │    Audio + Data Msgs    │   (Media Server)  │
└─────────────────┘                         └──────────────────┘
                                                      ▲
                                                      │
                                                      │ WebRTC
                                                      │
                                              ┌───────┴────────┐
                                              │  Python Agent  │
                                              │  (Gemini Live)  │
                                              └─────────────────┘
```

## Key Features

- ✅ Real-time voice conversation using Gemini Live API
- ✅ Emotion state updates via LiveKit data messages
- ✅ Microphone mute/unmute controls
- ✅ Connection status indicators
- ✅ Error handling with user-friendly messages
- ✅ Noise cancellation for better audio quality
- ✅ Automatic emotion detection based on speaking state

## Next Steps

1. **Set up server-side token generation** (recommended for production)
2. **Test the integration** with LiveKit Cloud
3. **Add conversation history** tracking
4. **Implement advanced emotion detection** based on LLM response analysis
5. **Add voice command shortcuts**
6. **Optimize audio quality** and latency

## Troubleshooting

### Connection Issues

- Verify `VITE_LIVEKIT_URL` is correct
- Check that agent is running and connected to LiveKit Cloud
- Ensure API keys are valid

### Microphone Issues

- Check browser permissions for microphone access
- Verify microphone is enabled in system settings
- Check browser console for errors

### Emotion Updates Not Working

- Verify agent is sending data messages (check agent logs)
- Check browser console for data message reception
- Ensure `updateEmotionFromLiveKit` is being called

## Notes

- The agent uses Gemini Live API which provides real-time voice interactions
- Emotion updates are sent via LiveKit's data channel (lightweight, real-time)
- For production, implement server-side token generation for security
- The agent automatically handles noise cancellation and audio processing

