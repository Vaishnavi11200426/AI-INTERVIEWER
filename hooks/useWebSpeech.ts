import { useRef, useCallback, useEffect } from 'react';
import { LiveTranscript, ConversationState } from '../types';

const SILENCE_TIMEOUT = 3000;

interface UseWebSpeechProps {
  isActive: boolean;
  conversationState: ConversationState;
  onTranscriptUpdate: (transcript: LiveTranscript) => void;
  onFinalTranscript: (text: string) => void;
  onStateChange: (state: ConversationState) => void;
}

export const useWebSpeech = ({
  isActive,
  conversationState,
  onTranscriptUpdate,
  onFinalTranscript,
  onStateChange
}: UseWebSpeechProps) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback((clearAccumulated = true) => {
    console.log('🛑 stopListening called');
    
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent auto-restart
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
      recognitionRef.current = null;
    }
    
    clearSilenceTimer();
    
    if (clearAccumulated) {
      accumulatedTranscriptRef.current = '';
    }
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    // Always clean up first
    if (recognitionRef.current) {
      console.log('⚠️ Cleaning up existing recognition');
      stopListening(false);
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Web Speech API not supported');
      return;
    }

    console.log('🎤 Starting speech recognition...');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('✅ Speech recognition ACTIVE');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        accumulatedTranscriptRef.current += 
          (accumulatedTranscriptRef.current ? ' ' : '') + finalTranscript.trim();
        console.log('📦 Accumulated:', accumulatedTranscriptRef.current);
      }

      const displayText = (accumulatedTranscriptRef.current + ' ' + interimTranscript).trim();

      if (displayText) {
        onStateChange(ConversationState.USER_SPEAKING);
        onTranscriptUpdate({
          text: displayText,
          isFinal: false,
          timestamp: Date.now()
        });

        // Reset silence timer
        clearSilenceTimer();
        
        silenceTimerRef.current = setTimeout(() => {
          const text = accumulatedTranscriptRef.current.trim();
          console.log('⏰ Silence timeout! Text:', text);
          
          if (text) {
            stopListening(true);
            onStateChange(ConversationState.PROCESSING);
            onFinalTranscript(text);
          }
        }, SILENCE_TIMEOUT);
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied.');
      }
    };

    recognition.onend = () => {
      console.log('🔚 Recognition ended naturally');
      // Auto-restart if still supposed to be listening
      if (recognitionRef.current) {
        recognitionRef.current = null;
        // Small delay before restart
        setTimeout(() => {
          if (isActive && (conversationState === ConversationState.LISTENING || 
                          conversationState === ConversationState.USER_SPEAKING)) {
            console.log('🔄 Auto-restarting...');
            startListening();
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start:', e);
      recognitionRef.current = null;
    }
  }, [isActive, conversationState, onTranscriptUpdate, onFinalTranscript, onStateChange, clearSilenceTimer, stopListening]);

  // Handle activation/deactivation
  useEffect(() => {
    console.log('🔄 Effect - isActive:', isActive, 'state:', conversationState);
    
    if (!isActive) {
      stopListening();
      return;
    }

    // Start listening when active AND in LISTENING state
    if (isActive && conversationState === ConversationState.LISTENING) {
      // Small delay to ensure clean start
      const timer = setTimeout(() => {
        if (!recognitionRef.current) {
          console.log('🎯 Starting recognition for LISTENING state');
          startListening();
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }

    // Cleanup when not active
    return () => {
      if (!isActive) {
        stopListening();
      }
    };
  }, [isActive, conversationState, startListening, stopListening]);

  return {
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    startListening,
    stopListening
  };
};