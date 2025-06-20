import { useState, useEffect, useRef } from 'react';

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export const useSpeechRecognition = (options: SpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      
      // Configure recognition
      recognition.continuous = options.continuous ?? false;
      recognition.interimResults = options.interimResults ?? true;
      recognition.lang = options.language ?? 'en-US';
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        options.onStart?.();
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimText += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          options.onResult?.(finalTranscript, true);
        }

        setInterimTranscript(interimText);
        if (interimText && options.interimResults) {
          options.onResult?.(interimText, false);
        }
      };

      recognition.onerror = (event: any) => {
        const errorMessage = getErrorMessage(event.error);
        setError(errorMessage);
        setIsListening(false);
        options.onError?.(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        options.onEnd?.();
      };

      // Auto-restart for continuous listening
      if (options.continuous) {
        recognition.onend = () => {
          if (isListening) {
            try {
              recognition.start();
            } catch (e) {
              setIsListening(false);
            }
          } else {
            setInterimTranscript('');
            options.onEnd?.();
          }
        };
      }
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [options.continuous, options.interimResults, options.language]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported');
      return;
    }

    if (isListening) {
      return; // Already listening
    }

    try {
      setError(null);
      recognitionRef.current.start();
    } catch (error) {
      setError('Failed to start speech recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  // Auto-stop after period of silence (for non-continuous mode)
  const startWithTimeout = (timeoutMs: number = 10000) => {
    startListening();
    
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      stopListening();
    }, timeoutMs);
  };

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'network':
        return 'Network error occurred. Please check your internet connection.';
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone access.';
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'aborted':
        return 'Speech recognition was aborted.';
      case 'audio-capture':
        return 'Audio capture failed. Please check your microphone.';
      case 'service-not-allowed':
        return 'Speech recognition service is not allowed.';
      default:
        return 'An error occurred with speech recognition.';
    }
  };

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    startWithTimeout,
    fullTranscript: transcript + interimTranscript
  };
}; 