import React, { createContext, useContext, useState, ReactNode } from 'react';

export type EmotionState = 
  | 'NEUTRAL' 
  | 'HAPPY' 
  | 'SAD' 
  | 'CONFUSED' 
  | 'INTERESTED' 
  | 'LISTENING' 
  | 'TALKING';

interface VoiceContextType {
  emotion: EmotionState;
  setEmotion: (emotion: EmotionState) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const [emotion, setEmotion] = useState<EmotionState>('NEUTRAL');
  const [isConnected, setIsConnected] = useState(false);

  return (
    <VoiceContext.Provider value={{ emotion, setEmotion, isConnected, setIsConnected }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
};
