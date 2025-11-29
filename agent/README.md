# LiveKit Voice Agent - RUMMI

Python-based LiveKit agent using Google Gemini Live API for the RUMMI voice assistant.

## Setup

### Prerequisites

- Python >= 3.9
- [uv](https://docs.astral.sh/uv/getting-started/installation/) package manager (recommended)
- LiveKit Cloud account
- Google Gemini API key

### Installation

1. Install dependencies:

```bash
uv add \
  "livekit-agents[google]~=1.2" \
  "livekit-plugins-noise-cancellation~=0.2" \
  "python-dotenv"
```

Or with pip:

```bash
pip install "livekit-agents[google]~=1.2" "livekit-plugins-noise-cancellation~=0.2" "python-dotenv"
```

2. Set up environment variables:

Create `.env.local` file:

```bash
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
GOOGLE_API_KEY=your_gemini_api_key
```

Or set `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to your Google service account key file (for Vertex AI).

**Note**: For Gemini Live API, you can use either:
- `GOOGLE_API_KEY` - Direct API key from Google AI Studio
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON file (for Vertex AI)

3. Download model files (if needed):

```bash
uv run agent.py download-files
```

## Running the Agent

### Development Mode

Run the agent in development mode to connect to LiveKit Cloud:

```bash
uv run agent.py dev
```

### Console Mode (Testing)

Run locally in terminal for testing:

```bash
uv run agent.py console
```

### Production Mode

Run in production mode:

```bash
uv run agent.py start
```

## Deployment to LiveKit Cloud

1. Ensure you have the LiveKit CLI installed and authenticated:

```bash
lk cloud auth
```

2. Deploy the agent:

```bash
lk agent create
```

This will create `Dockerfile`, `.dockerignore`, and `livekit.toml` files, then deploy to LiveKit Cloud.

## Emotion State Updates

The agent sends emotion updates to the frontend via LiveKit room data messages:

- `NEUTRAL` - Default idle state
- `LISTENING` - User is speaking
- `TALKING` - Agent is responding
- `INTERESTED` - Engaged in conversation
- `HAPPY` - Positive interaction
- `SAD` - Empathetic response
- `CONFUSED` - Processing complex query

## Architecture

- Uses Google Gemini Live API (`gemini-live-2.5-flash`) for real-time voice interactions
- Includes noise cancellation for better audio quality
- Sends emotion state updates via LiveKit data messages
- Configured for LiveKit Cloud deployment

