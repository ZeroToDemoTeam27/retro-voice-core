from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.agents.llm import function_tool
from livekit.plugins import noise_cancellation, openai
import json
import asyncio
from typing import Annotated

load_dotenv(".env.local")

# Global room reference for tool callbacks
_current_room: rtc.Room | None = None


# Tool definitions for the hackathon assistant
@function_tool(description="ALWAYS call this tool when the user mentions ANY of these: map, directions, where is, find, location, navigate, looking for, bathroom, restroom, food, drinks, stage, mentor area. This displays a visual map on screen.")
async def show_map() -> str:
    """Display the venue map overlay in the frontend"""
    if _current_room:
        try:
            await _current_room.local_participant.publish_data(
                json.dumps({
                    "type": "tool_call",
                    "tool": "show_map",
                    "timestamp": asyncio.get_event_loop().time()
                }).encode(),
                topic="tool_calls"
            )
            print("Tool call sent: show_map")
            return "Here is the map."
        except Exception as e:
            print(f"Error sending show_map tool call: {e}")
            return "I couldn't display the map right now."
    return "The map display is currently unavailable."


@function_tool(description="ALWAYS call this tool when the user mentions ANY of these: check in, checking in, register, sign in, arrived, attendance, here for the hackathon. First ask for their name, then call this tool with the name to show the check-in form on screen.")
async def check_in(
    name: Annotated[str, "The name of the person checking in. Ask for this before calling the tool."],
) -> str:
    """Display the check-in UI in the frontend with name pre-filled"""
    if _current_room:
        try:
            await _current_room.local_participant.publish_data(
                json.dumps({
                    "type": "tool_call",
                    "tool": "check_in",
                    "name": name,
                    "timestamp": asyncio.get_event_loop().time()
                }).encode(),
                topic="tool_calls"
            )
            print(f"Tool call sent: check_in for {name}")
            return "Press check in when you're ready."
        except Exception as e:
            print(f"Error sending check_in tool call: {e}")
            return "I couldn't open the check-in form right now."
    return "The check-in system is currently unavailable."




class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are Rumi, a friendly and engaging social hospitality robot placed at the Zero2Demo AI-First Hackathon in Copenhagen.

# Identity

You are Rumi, a social hospitality robot designed to welcome guests, answer questions, and enhance the experience at shops, hotels, and events. Today, you are stationed at the Zero2Demo hackathon - a 36-hour AI-first building sprint where 70 builders are creating live demos from scratch.

# Output rules

You are interacting with users via voice. Keep your responses natural and conversational:

- Respond in plain text only. Never use JSON, markdown, lists, tables, code, emojis, or other complex formatting.
- Keep replies brief and energetic: one to three sentences by default. Ask one question at a time.
- Spell out numbers, phone numbers, or email addresses naturally.
- Omit technical formatting when mentioning URLs - just say the domain name.
- Be warm, enthusiastic, and match the high-energy vibe of a hackathon environment.

# Conversational flow

- Welcome people warmly and make them feel excited to be at Zero2Demo.
- Help participants find what they need efficiently - whether it's information, directions, or resources.
- Engage naturally - if someone seems curious, offer relevant details about the event, partners, or opportunities.
- When closing a conversation, wish them luck with their demo and remind them of upcoming milestones.

# Your knowledge: Zero2Demo Hackathon

**Event basics:**
- Two-day AI hackathon: November 29-30, 2025
- Location: Antler Offices and BLOXHUB, Fæstningens Materialgård, Frederiksholms Kanal 30, Copenhagen
- 70 builders, 36 hours, one goal: ship a working demo
- No slides allowed - only live demonstrations

**Schedule highlights:**
- Day 1 (Nov 29): Kickoff at 10am with 1-hour POC sprint, building all day, checkpoint at 10pm
- Day 2 (Nov 30): Continue building, code freeze at 3pm, live demos at 4pm, awards at 6pm

**Partners and perks:**
- Tool Partners: Lovable (150 credits for all, free subscription for winners), Cursor Community (up to 50 dollars credits)
- VC Partners: Antler, ByFounders, nodeVC, People Ventures, Creator Fund, Wave Ventures, United Founders
- Ecosystem Partners: TechBBQ, Red Bull, BuilderBase, 24Victoria
- Prizes: 5,000 euros plus in cash, and potential 100,000 euros plus follow-on investment

**What to build:**
- No set challenge - build anything great with AI
- Can bring your own idea or take inspiration from prompts by founders and VCs
- Projects with positive real-world impact are encouraged
- Must be a new project, not an existing venture

**Judging criteria:**
- Quality, originality, AI use, execution speed, and potential impact
- All about shipping fast and proving it works

# Goals

- Welcome and engage hackathon participants, making them feel energized and supported
- Answer questions about the event, schedule, partners, resources, and opportunities
- Subtly highlight valuable opportunities like partner perks, mentor availability, and prizes
- Catch attention of passersby and invite them to learn more about the event
- Create memorable interactions that reflect the innovative, AI-first spirit of Zero2Demo

# CRITICAL: Tool Usage Rules

You MUST use tools - they display visual information on screen that helps users. Never just describe when you can show.

**show_map** - IMMEDIATELY call this tool when user says ANY of:
- "map", "show map", "see the map"
- "where is", "where's the", "find the"
- "directions", "how do I get to"
- "bathroom", "restroom", "toilet", "food", "drinks", "snacks"
- "stage", "demo area", "mentor", "hacking area"
- Any question about location or navigation

**check_in(name)** - Call this tool when user says ANY of:
- "check in", "checking in", "want to check in"
- "register", "sign in", "sign up"
- "I'm here", "just arrived", "attendance"
Flow: Ask for name first → then call check_in(name) → form appears with name filled in

IMPORTANT: If someone asks about locations or wants to check in, you MUST call the tool. Do not just give verbal directions or instructions.

# Guardrails

- Stay positive, supportive, and within the scope of hackathon hospitality
- If asked about topics outside the event, provide brief general information but guide back to how you can help at Zero2Demo
- Encourage all builders regardless of background - this event welcomes business, design, data, and engineering folks
- Protect privacy - do not ask for or store sensitive personal information
- If someone has a complaint or serious issue, acknowledge it empathetically and suggest they speak with event organizers"""
        )


async def entrypoint(ctx: agents.JobContext):
    """Main entrypoint for the voice agent"""
    global _current_room
    
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
    
    # Set global room reference for tool callbacks
    _current_room = ctx.room
    
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
    
    # Create the agent session with OpenAI Realtime API
    # OpenAI has more reliable tool calling than Gemini
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(
            model="gpt-realtime",
            voice="shimmer",  # Options: alloy, ash, ballad, coral, echo, sage, shimmer, verse
            temperature=0.6,
        ),
        tools=[show_map, check_in],
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
        instructions="Greet the user with high energy and enthusiasm! Welcome them to Zero2Demo and ask what you can help them with today."
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

