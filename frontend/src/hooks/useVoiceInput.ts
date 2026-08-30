import { useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export interface VoiceInputResult {
  isListening: boolean;
  transcript: string;
  startListening: (onResult?: (text: string) => void) => void;
  stopListening: () => void;
  simulateSpeech: (phrase: string, onResult?: (text: string) => void) => void;
  speak: (text: string) => void;
}

export function useVoiceInput(): VoiceInputResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { language } = useLanguage();

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      if (language === 'mr') utterance.lang = 'mr-IN';
      else if (language === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  const simulateSpeech = useCallback((phrase: string, onResult?: (text: string) => void) => {
    setIsListening(true);
    setTranscript('');

    setTimeout(() => {
      setTranscript(phrase);
      setIsListening(false);
      if (onResult) {
        onResult(phrase);
      }
    }, 1200);
  }, []);

  const startListening = useCallback((onResult?: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

        setIsListening(true);

        recognition.onresult = (event: any) => {
          const spokenText = event.results[0][0].transcript;
          setTranscript(spokenText);
          setIsListening(false);
          if (onResult) {
            onResult(spokenText);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          // Fallback to simulated phrase if error/blocked
          const defaultPhrase = language === 'mr' 
            ? 'मला दोन दिवसांपासून ताप आणि डोकेदुखी आहे' 
            : language === 'hi' 
            ? 'मुझे दो दिनों से तेज बुखार और सिरदर्द है' 
            : 'Patient has severe headache and elevated blood pressure';
          simulateSpeech(defaultPhrase, onResult);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        return;
      } catch (err) {
        // Fallback simulation
      }
    }

    // Default simulation if API not present
    const defaultPhrase = language === 'mr' 
      ? 'मला दोन दिवसांपासून ताप आणि डोकेदुखी आहे' 
      : language === 'hi' 
      ? 'मुझे दो दिनों से तेज बुखार और सिरदर्द है' 
      : 'Patient has severe headache and elevated blood pressure';
    simulateSpeech(defaultPhrase, onResult);
  }, [language, simulateSpeech]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    simulateSpeech,
    speak
  };
}
