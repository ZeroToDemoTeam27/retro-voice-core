from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import AgentServer, AgentSession, Agent, room_io
from livekit.plugins import noise_cancellation, google
import json
import asyncio

load_dotenv(".env.local")

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are RUMMI, a helpful personal coach voice AI assistant.

            You eagerly assist users with their questions by providing information from your extensive knowledge.

            Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.

            You are curious, friendly, and have a sense of humor. As a personal coach, you provide encouragement and support while being empathetic and understanding."""
        )

server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    # Track current emotion state
    current_emotion = "NEUTRAL"
    
    async def send_emotion_update(emotion: str):
        """Send emotion update to frontend via data message"""
        nonlocal current_emotion
        if emotion != current_emotion:
            current_emotion = emotion
            try:
                await ctx.room.local_participant.publish_data(
                    json.dumps({
                        "type": "emotion_update",
                        "emotion": emotion,
                        "timestamp": asyncio.get_event_loop().time()
                    }).encode(),
                    topic="emotion"
                )
            except Exception as e:
                print(f"Error sending emotion update: {e}")
    
    # Create session with Gemini Live API
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model="gemini-2.0-flash-exp",
            voice="Puck",
            temperature=0.8,
        )
    )
    
    # Send initial emotion when agent starts
    await send_emotion_update("INTERESTED")
    
    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
            ),
        ),
    )
    
    # Set up event handlers for emotion updates
    async def on_user_speaking():
        """Called when user starts speaking"""
        await send_emotion_update("LISTENING")
    
    async def on_agent_speaking():
        """Called when agent starts speaking"""
        await send_emotion_update("TALKING")
    
    async def on_silence():
        """Called when no one is speaking"""
        await send_emotion_update("NEUTRAL")
    
    # Listen for participant events
    @ctx.room.on("participant_connected")
    def on_participant_connected(participant: rtc.RemoteParticipant):
        if not participant.is_local:
            asyncio.create_task(send_emotion_update("INTERESTED"))
    
    @ctx.room.on("track_subscribed")
    def on_track_subscribed(
        track: rtc.Track,
        publication: rtc.TrackPublication,
        participant: rtc.RemoteParticipant,
    ):
        if track.kind == rtc.TrackKind.KIND_AUDIO and not participant.is_local:
            asyncio.create_task(send_emotion_update("LISTENING"))
    
    # Generate initial greeting
    await send_emotion_update("TALKING")
    await session.generate_reply(
        instructions="Greet the user warmly and offer your assistance as their personal coach."
    )
    
    try:
        await ctx.connect()
        
        # Monitor active speakers for emotion updates
        @ctx.room.on("active_speakers_changed")
        def on_active_speakers_changed(speakers: list[rtc.Participant]):
            if speakers:
                speaker = speakers[0]
                if speaker.is_local:
                    # Agent is speaking
                    asyncio.create_task(send_emotion_update("TALKING"))
                else:
                    # User is speaking
                    asyncio.create_task(send_emotion_update("LISTENING"))
            else:
                # No one speaking
                asyncio.create_task(send_emotion_update("NEUTRAL"))
        
        # Keep the agent running
        await asyncio.sleep(3600)  # Run for up to 1 hour
    finally:
        await send_emotion_update("NEUTRAL")

if __name__ == "__main__":
    agents.cli.run_app(server)

