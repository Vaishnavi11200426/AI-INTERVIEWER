import React from 'react';
import { LiveTranscript, ConversationState } from '../types';

interface LiveTranscriptPanelProps {
  liveTranscript: LiveTranscript | null;
  conversationState: ConversationState;
}

const LiveTranscriptPanel: React.FC<LiveTranscriptPanelProps> = ({ 
  liveTranscript, 
  conversationState 
}) => {
  const getStateIndicator = () => {
    switch (conversationState) {
      case ConversationState.LISTENING:
        return {
          icon: 'fas fa-microphone',
          text: 'Listening...',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20'
        };
      case ConversationState.USER_SPEAKING:
        return {
          icon: 'fas fa-waveform-lines',
          text: 'You are speaking...',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20'
        };
      case ConversationState.PROCESSING:
        return {
          icon: 'fas fa-paper-plane',
          text: 'Sending to Gemini...',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20'
        };
      case ConversationState.AI_RESPONDING:
        return {
          icon: 'fas fa-robot',
          text: 'AI is responding...',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20'
        };
      default:
        return {
          icon: 'fas fa-microphone-slash',
          text: 'Ready',
          color: 'text-slate-400',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/20'
        };
    }
  };

  const indicator = getStateIndicator();

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl h-[400px] flex flex-col overflow-hidden">
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 font-semibold text-slate-300 flex items-center justify-between">
        <span>Live Speech</span>
        <i className="fas fa-microphone-lines text-slate-500"></i>
      </div>
      
      {/* Status Indicator */}
      <div className={`mx-4 mt-4 p-3 rounded-lg ${indicator.bgColor} border ${indicator.borderColor} flex items-center gap-3`}>
        <div className="flex items-center gap-2">
          <i className={`${indicator.icon} ${indicator.color} ${conversationState === ConversationState.USER_SPEAKING ? 'animate-pulse' : ''}`}></i>
          <span className={`text-sm font-medium ${indicator.color}`}>{indicator.text}</span>
        </div>
        {conversationState === ConversationState.PROCESSING && (
          <div className="ml-auto">
            <div className="w-4 h-4 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Live Transcript Display */}
      <div className="flex-1 p-4 overflow-y-auto">
        {liveTranscript ? (
          <div className="space-y-2">
            <div className={`p-3 rounded-lg ${liveTranscript.isFinal ? 'bg-slate-800 border border-slate-700' : 'bg-blue-500/10 border border-blue-500/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  {liveTranscript.isFinal ? 'Final Transcript' : 'Live Transcript'}
                </span>
                {!liveTranscript.isFinal && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <p className={`text-sm ${liveTranscript.isFinal ? 'text-slate-200' : 'text-blue-200'}`}>
                {liveTranscript.text && liveTranscript.text.trim() ? liveTranscript.text : 'Start speaking...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-sm">
            <div className="text-center">
              <i className="fas fa-microphone text-2xl mb-2 block"></i>
              <p>Start speaking to see live transcription</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTranscriptPanel;