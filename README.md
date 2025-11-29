\*\*\*\*# RUMMI - Retro Voice Assistant Core

<div align="center">

![RUMMI](https://img.shields.io/badge/RUMMI-Personal%20Coach-FFB000?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**A retro-styled voice assistant with an expressive pixelated face that communicates through emotions**

</div>

---

## 🎯 Main Idea

RUMMI is a personal coach voice assistant that combines cutting-edge voice AI technology with a nostalgic retro aesthetic. The assistant features an animated pixelated face that expresses emotions in real-time, creating an engaging and personable interaction experience. The application uses a CRT monitor-inspired design with scanlines, flicker effects, and a warm amber color palette to evoke the feeling of classic computing.

### Core Concept

- **Emotional Intelligence**: The assistant displays 7 distinct emotional states that reflect its current mood and interaction state
- **Retro Aesthetic**: Pixelated graphics, CRT scanlines, and retro typography create a unique visual identity
- **Voice-First Interaction**: Designed for seamless voice conversations with real-time emotion feedback
- **Focus Mode**: Distraction-free mode for immersive coaching sessions

---

## 🏗️ Project Structure

```
retro-voice-core/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui component library
│   │   ├── CRTOverlay.tsx  # CRT monitor visual effects
│   │   ├── PixelFace.tsx   # Animated emotion display
│   │   ├── DebugTerminal.tsx # Emotion testing interface
│   │   └── OrientationLock.tsx # Mobile orientation handling
│   │
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx # Supabase authentication
│   │   └── VoiceContext.tsx # Voice & emotion state management
│   │
│   ├── hooks/               # Custom React hooks
│   │   └── useOpenAIVoice.ts # OpenAI Realtime Voice integration (skeleton)
│   │
│   ├── pages/               # Route pages
│   │   ├── Index.tsx        # Main voice assistant interface
│   │   ├── Auth.tsx         # Authentication page
│   │   └── Profile.tsx      # User profile page
│   │
│   ├── integrations/        # External service integrations
│   │   └── supabase/        # Supabase client & types
│   │
│   └── lib/                 # Utility functions
│
├── supabase/                # Supabase configuration
│   └── migrations/          # Database migrations
│
└── public/                  # Static assets
```

---

## 🧠 Architecture & Logic

### Emotion System

The application uses a centralized emotion state management system through `VoiceContext`:

```typescript
type EmotionState =
  | "NEUTRAL" // Default resting state with blinking animation
  | "HAPPY" // Positive interaction feedback
  | "SAD" // Empathetic response
  | "CONFUSED" // Processing or unclear input
  | "INTERESTED" // Engaged and attentive
  | "LISTENING" // Actively receiving audio input
  | "TALKING"; // Generating speech output
```

**Emotion Flow:**

1. Voice agent backend determines emotion based on conversation context
2. Emotion state is updated via `VoiceContext.setEmotion()`
3. `PixelFace` component reacts to emotion changes with smooth animations
4. Visual feedback provides real-time emotional context to users

### Component Hierarchy

```
App
├── QueryClientProvider (React Query)
├── AuthProvider (Supabase Auth)
└── Routes
    ├── /auth → Auth Page
    ├── / → ProtectedRoute → Index Page
    │   └── VoiceProvider
    │       └── VoiceAgentContent
    │           ├── CRTOverlay (visual effects)
    │           ├── PixelFace (emotion display)
    │           └── DebugTerminal (dev tools)
    └── /profile → ProtectedRoute → Profile Page
```

### State Management

- **Authentication**: Managed by `AuthContext` using Supabase Auth
- **Voice & Emotions**: Managed by `VoiceContext` (React Context API)
- **Server State**: Managed by React Query (TanStack Query)
- **UI State**: Local component state with React hooks

### Visual System

- **CRT Effects**: Scanlines, vignette, and flicker animations via `CRTOverlay`
- **Pixel Face**: SVG-based animated face with emotion-specific morphing
- **Retro Typography**: VT323 monospace font for authentic retro feel
- **Color Palette**: Warm amber (`hsl(38, 100%, 50%)`) on black background
- **Animations**: Framer Motion for smooth, spring-based transitions

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or bun
- Supabase account and project

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd retro-voice-core

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:8080
```

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎨 Key Features

### 1. Pixel Face Emotion Display

The `PixelFace` component renders an animated SVG face that morphs based on the current emotion:

- **Eyes**: Different shapes and sizes for each emotion
- **Mouth**: Varied expressions (smile, frown, talking bars)
- **Eyebrows**: Animated for LISTENING state
- **Blinking**: Automatic blinking in NEUTRAL state
- **Thought Bubbles**: Animated dots for LISTENING state

### 2. CRT Monitor Aesthetic

- **Scanlines**: Horizontal lines overlay for authentic CRT feel
- **Vignette**: Radial gradient darkening at edges
- **Flicker**: Subtle random opacity changes
- **Glow Effects**: Amber glow on interactive elements

### 3. Focus Mode

Toggle to hide all UI elements except the pixel face for distraction-free sessions.

### 4. Debug Terminal

Development tool for testing emotion states and running demo sequences.

---

## 🔌 Voice Agent Integration

### Current State

The `useOpenAIVoice` hook provides a skeleton structure ready for OpenAI Realtime Voice API integration:

```typescript
// src/hooks/useOpenAIVoice.ts
-connect() - // Initialize WebSocket connection
  disconnect() - // Close connection
  sendAudio() - // Send audio data
  detectEmotion(); // Parse emotion from responses
```

### Future Integration Points

The system is designed to receive emotion and mood updates from the voice agent backend:

#### 1. **Emotion Updates from Voice Agent**

The voice agent backend should send emotion updates via WebSocket or API:

```typescript
// Expected payload structure
interface VoiceAgentEmotionUpdate {
  emotion: EmotionState;
  confidence?: number;
  context?: string; // Optional context about why this emotion
  timestamp?: number;
}
```

**Integration Location**: `src/hooks/useOpenAIVoice.ts`

**Update Flow**:

```typescript
// When receiving emotion update from voice agent:
const handleEmotionUpdate = (update: VoiceAgentEmotionUpdate) => {
  setEmotion(update.emotion);
  // Optional: Store emotion history, log context, etc.
};
```

#### 2. **Mood Navigation**

The voice agent can navigate the assistant's mood through conversation context:

**Mood Dimensions** (Future Enhancement):

- **Energy Level**: Low → Medium → High
- **Positivity**: Negative → Neutral → Positive
- **Engagement**: Disengaged → Neutral → Engaged
- **Empathy**: Low → Medium → High

**Implementation Plan**:

```typescript
// Extend VoiceContext to include mood
interface MoodState {
  energy: "LOW" | "MEDIUM" | "HIGH";
  positivity: "NEGATIVE" | "NEUTRAL" | "POSITIVE";
  engagement: "DISENGAGED" | "NEUTRAL" | "ENGAGED";
  empathy: "LOW" | "MEDIUM" | "HIGH";
}

// Voice agent can update mood based on:
// - User's emotional state (detected from voice)
// - Conversation topic
// - Time of day / context
// - User preferences / history
```

#### 3. **Voice Agent Input Channels**

**WebSocket Connection** (Recommended):

```typescript
// In useOpenAIVoice.ts
const ws = new WebSocket("wss://your-backend/realtime-voice");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "emotion_update") {
    setEmotion(data.emotion);
  }

  if (data.type === "mood_update") {
    setMood(data.mood);
  }

  if (data.type === "voice_response") {
    // Handle audio playback
  }
};
```

**REST API Polling** (Alternative):

```typescript
// Poll for emotion updates
setInterval(async () => {
  const response = await fetch("/api/voice-agent/emotion");
  const { emotion } = await response.json();
  setEmotion(emotion);
}, 1000);
```

**Supabase Realtime** (Alternative):

```typescript
// Listen to Supabase realtime channel
supabase
  .channel("voice-agent-updates")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "voice_sessions",
    },
    (payload) => {
      setEmotion(payload.new.emotion);
    }
  )
  .subscribe();
```

#### 4. **Emotion Mapping from Voice Agent**

The voice agent should map its internal state to the application's emotion system:

| Voice Agent State        | RUMMI Emotion | Use Case                  |
| ------------------------ | ------------- | ------------------------- |
| Processing user input    | `LISTENING`   | User is speaking          |
| Generating response      | `TALKING`     | Assistant is responding   |
| Positive sentiment       | `HAPPY`       | Encouraging, celebratory  |
| Empathetic response      | `SAD`         | Comforting, understanding |
| Processing complex query | `CONFUSED`    | Analyzing, thinking       |
| Engaged conversation     | `INTERESTED`  | Curious, attentive        |
| Idle / waiting           | `NEUTRAL`     | Default state             |

---

## 🗄️ Database Schema

### Profiles Table

```sql
profiles (
  id UUID PRIMARY KEY (references auth.users),
  email TEXT,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Row Level Security**: Users can only view/update their own profiles.

---

## 🛠️ Technology Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **TanStack Query** - Server state management

### Backend & Services

- **Supabase** - Authentication & database
- **OpenAI Realtime Voice API** - Voice interaction (planned)

### Development Tools

- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting

---

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

---

## 🧪 Development Tools

### Debug Terminal

The debug terminal (visible in development) allows you to:

- Manually set emotion states
- Run demo emotion sequences
- Test emotion transitions

Access it in the bottom-right corner when not in focus mode.

### Focus Mode

Toggle focus mode to hide all UI except the pixel face for testing the core experience.

---

## 🚧 Roadmap & Future Enhancements

### Voice Integration

- [ ] Complete OpenAI Realtime Voice API integration
- [ ] WebSocket connection to voice agent backend
- [ ] Real-time emotion detection from voice analysis
- [ ] Audio input/output handling

### Emotion & Mood System

- [ ] Extended mood dimensions (energy, positivity, engagement, empathy)
- [ ] Emotion history tracking
- [ ] Mood-based response adaptation
- [ ] Personalized emotion preferences

### Features

- [ ] Conversation history
- [ ] Emotion analytics dashboard
- [ ] Customizable pixel face styles
- [ ] Multiple assistant personalities
- [ ] Voice command shortcuts
- [ ] Mobile app version

### Technical

- [ ] Unit tests for components
- [ ] Integration tests for voice flow
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] PWA support

---

## 🤝 Contributing

This project is part of the ZeroToDemo challenge. Contributions are welcome!

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

[Add your license here]

---

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- Retro aesthetic inspired by classic computing
- Emotion system designed for empathetic AI interactions

---

## 📞 Support

For issues, questions, or contributions, please open an issue in the repository.

---

<div align="center">

**Made with ❤️ and retro vibes**

</div>
