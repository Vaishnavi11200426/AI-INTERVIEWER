
export interface InterviewConfig {
  role: string;
  company: string;
  experience: string;
}

export interface TranscriptionItem {
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export enum InterviewStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR'
}

export enum ConversationState {
  LISTENING = 'LISTENING',
  USER_SPEAKING = 'USER_SPEAKING',
  PROCESSING = 'PROCESSING',
  AI_RESPONDING = 'AI_RESPONDING'
}

export interface LiveTranscript {
  text: string;
  isFinal: boolean;
  timestamp: number;
}
