import { AccessToken } from 'livekit-server-sdk';

/**
 * Generate a LiveKit access token for joining a room
 * 
 * Note: In production, this should be done server-side for security.
 * This client-side implementation is for development/testing only.
 */
export async function generateLiveKitToken(
  roomName: string,
  participantName: string,
  apiKey?: string,
  apiSecret?: string
): Promise<string> {
  // For production, call a server endpoint instead
  const tokenEndpoint = import.meta.env.VITE_LIVEKIT_TOKEN_ENDPOINT;
  
  if (tokenEndpoint) {
    // Server-side token generation (recommended)
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomName,
        participantName,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate token: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.token;
  }
  
  // Client-side token generation (development only)
  // Note: This requires exposing API secret in frontend - NOT recommended for production
  if (!apiKey || !apiSecret) {
    throw new Error(
      'LiveKit API key and secret are required for client-side token generation. ' +
      'For production, set VITE_LIVEKIT_TOKEN_ENDPOINT to a server-side endpoint.'
    );
  }
  
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  });
  
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
  
  return await at.toJwt();
}

