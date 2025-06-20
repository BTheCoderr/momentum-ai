import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceInputProps {
  onTranscript: (text: string, isFinal: boolean) => void;
  placeholder?: string;
  className?: string;
  continuous?: boolean;
  autoStop?: boolean;
  autoStopDelay?: number;
  language?: string;
  disabled?: boolean;
  showTranscript?: boolean;
}

export default function VoiceInput({
  onTranscript,
  placeholder = "Tap mic to speak...",
  className = "",
  continuous = false,
  autoStop = true,
  autoStopDelay = 3000,
  language = "en-US",
  disabled = false,
  showTranscript = true
}: VoiceInputProps) {
  const [isActive, setIsActive] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);

  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    fullTranscript
  } = useSpeechRecognition({
    continuous,
    interimResults: true,
    language,
    onResult: (text, isFinal) => {
      setHasSpoken(true);
      onTranscript(text, isFinal);
      
      // Auto-stop after delay if not continuous
      if (!continuous && autoStop && isFinal) {
        setTimeout(() => {
          stopListening();
          setIsActive(false);
        }, autoStopDelay);
      }
    },
    onStart: () => {
      setIsActive(true);
      setHasSpoken(false);
    },
    onEnd: () => {
      setIsActive(false);
    },
    onError: (error) => {
      setIsActive(false);
      console.error('Voice input error:', error);
    }
  });

  const handleToggleListening = () => {
    if (!isSupported || disabled) return;

    if (isListening) {
      stopListening();
      setIsActive(false);
    } else {
      resetTranscript();
      startListening();
    }
  };

  const getMicrophoneIcon = () => {
    if (!isSupported || disabled) {
      return <MicOff className="w-5 h-5 text-gray-400" />;
    }
    
    if (isListening) {
      return <Volume2 className="w-5 h-5 text-white animate-pulse" />;
    }
    
    return <Mic className="w-5 h-5 text-white" />;
  };

  const getButtonStyle = () => {
    if (!isSupported || disabled) {
      return "bg-gray-300 cursor-not-allowed";
    }
    
    if (isListening) {
      return "bg-red-500 animate-pulse shadow-lg scale-110";
    }
    
    if (hasSpoken && transcript) {
      return "bg-green-500 hover:bg-green-600";
    }
    
    return "bg-blue-500 hover:bg-blue-600 active:scale-95";
  };

  const getStatusText = () => {
    if (!isSupported) {
      return "Voice input not supported";
    }
    
    if (disabled) {
      return "Voice input disabled";
    }
    
    if (error) {
      return error;
    }
    
    if (isListening) {
      return interimTranscript || "Listening...";
    }
    
    if (hasSpoken && transcript) {
      return "Voice captured!";
    }
    
    return placeholder;
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Microphone Button */}
      <button
        onClick={handleToggleListening}
        disabled={!isSupported || disabled}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-200 ease-in-out
          ${getButtonStyle()}
        `}
        title={isListening ? "Stop listening" : "Start voice input"}
      >
        {getMicrophoneIcon()}
      </button>

      {/* Status/Transcript Display */}
      {showTranscript && (
        <div className="flex-1 min-h-[48px] flex items-center">
          <div className={`
            w-full p-3 rounded-lg border-2 transition-all duration-200
            ${isListening 
              ? 'border-red-300 bg-red-50' 
              : hasSpoken && transcript
              ? 'border-green-300 bg-green-50'
              : 'border-gray-200 bg-gray-50'
            }
          `}>
            <p className={`
              text-sm leading-relaxed
              ${isListening 
                ? 'text-red-700' 
                : hasSpoken && transcript
                ? 'text-green-700'
                : 'text-gray-600'
              }
            `}>
              {getStatusText()}
            </p>
            
            {/* Interim transcript preview */}
            {isListening && interimTranscript && (
              <p className="text-xs text-red-500 mt-1 opacity-70">
                {interimTranscript}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Audio Wave Animation */}
      {isListening && (
        <div className="flex items-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`
                w-1 bg-red-500 rounded-full animate-pulse
                ${i === 0 ? 'h-4' : i === 1 ? 'h-6' : 'h-4'}
              `}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
} 