import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechSettings, PlaybackStatus, VoiceOption } from '../types';
import { parseVoiceOption } from '../utils/languages';

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [highlightRange, setHighlightRange] = useState<{ start: number; length: number } | null>(null);
  const [supported, setSupported] = useState(true);

  const [settings, setSettings] = useState<SpeechSettings>({
    voiceURI: '',
    lang: 'pt-BR',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    naturalCadence: true,
    filterNaturalOnly: true,
  });

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveIntervalRef = useRef<number | null>(null);
  const fullTextRef = useRef<string>('');
  const charOffsetRef = useRef<number>(0);
  const currentCharIndexRef = useRef<number>(0);
  const isMidStreamRestartingRef = useRef<boolean>(false);
  const liveUpdateTimeoutRef = useRef<number | null>(null);
  const statusRef = useRef<PlaybackStatus>('idle');

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Load and refresh available voices
  const populateVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    const synthVoices = window.speechSynthesis.getVoices();
    if (synthVoices.length > 0) {
      const parsed: VoiceOption[] = [];
      for (const v of synthVoices) {
        const opt = parseVoiceOption(v);
        if (opt) {
          parsed.push(opt);
        }
      }

      // Sort voices: Natural/Neural first, then default, then by name
      parsed.sort((a, b) => {
        if (a.isNatural && !b.isNatural) return -1;
        if (!a.isNatural && b.isNatural) return 1;
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.displayName.localeCompare(b.displayName);
      });

      setVoices(parsed);
      setIsLoaded(true);

      // Default voice selection if not set yet
      setSettings((prev) => {
        if (!prev.voiceURI && parsed.length > 0) {
          const targetLang = prev.lang || 'pt-BR';
          const targetBase = targetLang.split('-')[0].toLowerCase();

          // 1. First look for a Natural voice matching full or base language
          const naturalVoice = parsed.find(
            (v) => v.isNatural && v.lang.toLowerCase().startsWith(targetBase)
          );
          // 2. Look for any matching language voice
          const matchingLangVoice = parsed.find((v) =>
            v.lang.toLowerCase().startsWith(targetBase)
          );
          // 3. Look for default or first voice
          const chosen = naturalVoice || matchingLangVoice || parsed.find((v) => v.isDefault) || parsed[0];

          return {
            ...prev,
            voiceURI: chosen.voice.voiceURI || chosen.name,
            lang: chosen.lang,
          };
        }
        return prev;
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }

    const timer = setTimeout(populateVoices, 250);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (keepAliveIntervalRef.current) {
        window.clearInterval(keepAliveIntervalRef.current);
      }
      if (liveUpdateTimeoutRef.current) {
        window.clearTimeout(liveUpdateTimeoutRef.current);
      }
    };
  }, [populateVoices]);

  // Chrome 14-second audio pause bug workaround
  const startKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      window.clearInterval(keepAliveIntervalRef.current);
    }
    keepAliveIntervalRef.current = window.setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      window.clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (liveUpdateTimeoutRef.current) {
      window.clearTimeout(liveUpdateTimeoutRef.current);
      liveUpdateTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopKeepAlive();
    setStatus('idle');
    setHighlightRange(null);
    charOffsetRef.current = 0;
    currentCharIndexRef.current = 0;
    fullTextRef.current = '';
  }, [stopKeepAlive]);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setStatus('paused');
      }
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setStatus('playing');
      }
    }
  }, []);

  // Internal helper to create and start an utterance from an offset in full text
  const startUtteranceSegment = useCallback(
    (
      textSegment: string,
      offset: number,
      config: SpeechSettings,
      shouldPlayImmediately = true
    ) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      const trimmed = textSegment.trim();
      if (!trimmed) {
        setStatus('idle');
        setHighlightRange(null);
        stopKeepAlive();
        return;
      }

      // Prepare cadence
      const sanitized = config.naturalCadence
        ? textSegment.replace(/\r\n/g, '\n').replace(/\n{2,}/g, '\n. ')
        : textSegment;

      const utterance = new SpeechSynthesisUtterance(sanitized);
      utteranceRef.current = utterance;
      charOffsetRef.current = offset;

      // Find chosen voice
      const selectedVoice = voices.find(
        (v) =>
          (v.voice.voiceURI && v.voice.voiceURI === config.voiceURI) ||
          v.name === config.voiceURI
      );

      if (selectedVoice) {
        utterance.voice = selectedVoice.voice;
        utterance.lang = selectedVoice.lang;
      } else if (config.lang) {
        utterance.lang = config.lang;
      }

      utterance.rate = Math.min(Math.max(config.rate, 0.25), 2.5);
      utterance.pitch = Math.min(Math.max(config.pitch, 0.5), 1.5);
      utterance.volume = Math.min(Math.max(config.volume, 0), 1);

      utterance.onstart = () => {
        if (!isMidStreamRestartingRef.current) {
          setStatus('playing');
        }
        startKeepAlive();
      };

      utterance.onboundary = (event) => {
        if (event.name === 'word' || typeof event.charIndex === 'number') {
          const absoluteIndex = charOffsetRef.current + (event.charIndex || 0);
          currentCharIndexRef.current = absoluteIndex;
          const charLength = event.charLength || 1;
          setHighlightRange({ start: absoluteIndex, length: charLength });
        }
      };

      utterance.onend = () => {
        if (isMidStreamRestartingRef.current) return;
        setStatus('idle');
        setHighlightRange(null);
        stopKeepAlive();
      };

      utterance.onerror = (e) => {
        if (isMidStreamRestartingRef.current) return;
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.error('Speech synthesis error:', e);
        }
        setStatus('idle');
        setHighlightRange(null);
        stopKeepAlive();
      };

      window.speechSynthesis.speak(utterance);
      if (shouldPlayImmediately) {
        setStatus('playing');
      } else {
        window.speechSynthesis.pause();
        setStatus('paused');
      }
    },
    [voices, startKeepAlive, stopKeepAlive]
  );

  // Main Speak function
  const speak = useCallback(
    (textToSpeak: string, customSettings?: Partial<SpeechSettings>) => {
      if (!textToSpeak.trim() || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      // Stop any existing speech
      window.speechSynthesis.cancel();
      stopKeepAlive();

      const currentConfig = { ...settingsRef.current, ...customSettings };
      fullTextRef.current = textToSpeak;
      currentCharIndexRef.current = 0;
      charOffsetRef.current = 0;

      startUtteranceSegment(textToSpeak, 0, currentConfig, true);
    },
    [startUtteranceSegment, stopKeepAlive]
  );

  // Seamless mid-playback settings update (specifically for Rate / Speed, Pitch, Voice)
  const updateSettings = useCallback(
    (newSettings: Partial<SpeechSettings> | ((prev: SpeechSettings) => SpeechSettings)) => {
      setSettings((prev) => {
        const next = typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings };
        settingsRef.current = next;

        // If audio is currently playing or paused, smoothly adjust mid-stream without resetting
        if (
          (statusRef.current === 'playing' || statusRef.current === 'paused') &&
          fullTextRef.current &&
          typeof window !== 'undefined' &&
          'speechSynthesis' in window
        ) {
          if (liveUpdateTimeoutRef.current) {
            window.clearTimeout(liveUpdateTimeoutRef.current);
          }

          // Debounce slightly to allow smooth dragging of speed sliders
          liveUpdateTimeoutRef.current = window.setTimeout(() => {
            const currentFull = fullTextRef.current;
            const currentIdx = Math.min(currentCharIndexRef.current, currentFull.length);
            const remainder = currentFull.slice(currentIdx);

            if (remainder.trim().length > 0) {
              isMidStreamRestartingRef.current = true;
              window.speechSynthesis.cancel();

              // Speak remainder with new settings
              startUtteranceSegment(
                remainder,
                currentIdx,
                next,
                statusRef.current === 'playing'
              );
              isMidStreamRestartingRef.current = false;
            }
          }, 80);
        }

        return next;
      });
    },
    [startUtteranceSegment]
  );

  // Quick helper specifically to change rate
  const setRate = useCallback(
    (newRate: number) => {
      updateSettings({ rate: newRate });
    },
    [updateSettings]
  );

  return {
    voices,
    isLoaded,
    supported,
    status,
    highlightRange,
    settings,
    setSettings: updateSettings,
    setRate,
    speak,
    pause,
    resume,
    stop,
  };
}
