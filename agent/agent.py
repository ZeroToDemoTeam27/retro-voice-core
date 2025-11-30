from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import AgentSession, Agent, RoomInputOptions
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


async def entrypoint(ctx: agents.JobContext):
    """Main entrypoint for the voice agent"""
    
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
                print(f"Sent emotion update: {emotion}")
            except Exception as e:
                print(f"Error sending emotion update: {e}")
    
    # FIRST: Connect to the room and wait for a participant
    print("Waiting for user to connect...")
    await ctx.connect()
    print(f"Connected to room: {ctx.room.name}")
    
    # Wait for a participant to join
    await ctx.wait_for_participant()
    print("User connected!")
    
    # Set up event handlers for emotion updates
    @ctx.room.on("active_speakers_changed")
    def on_active_speakers_changed(speakers: list[rtc.Participant]):
        if speakers:
            speaker = speakers[0]
            if speaker.identity == ctx.room.local_participant.identity:
                # Agent is speaking
                asyncio.create_task(send_emotion_update("TALKING"))
            else:
                # User is speaking
                asyncio.create_task(send_emotion_update("LISTENING"))
        else:
            # No one speaking
            asyncio.create_task(send_emotion_update("NEUTRAL"))
    
    # Create the agent session with Gemini Live API
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model="gemini-2.0-flash-exp",
            voice="Puck",
            temperature=0.8,
        )
    )
    
    # Send initial emotion
    await send_emotion_update("INTERESTED")
    
    # Start the agent session - this handles audio I/O automatically
    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )
    
    print("Agent session started, generating greeting...")
    
    # Generate initial greeting
    await send_emotion_update("TALKING")
    await session.generate_reply(
        instructions="Greet the user warmly and offer your assistance as their personal coach."
    )
    
    print("Agent is now listening...")
    
    # Create an event to wait for disconnection
    disconnect_event = asyncio.Event()
    
    @ctx.room.on("disconnected")
    def on_disconnect():
        print("Room disconnected, shutting down agent...")
        disconnect_event.set()
    
    # Keep running until the room disconnects
    await disconnect_event.wait()
    print("Agent session ended.")


if __name__ == "__main__":
    agents.cli.run_app(
        agents.WorkerOptions(entrypoint_fnc=entrypoint)
    )

