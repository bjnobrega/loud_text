import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PlaybackStatus, SpeechSettings, VoiceOption, HistoryItem } from '../types';
import { TranslationSchema } from '../utils/i18n';
import { formatLanguageName } from '../utils/languages';
import { 
  Play, 
  Pause, 
  Square, 
  Clipboard, 
  Trash2, 
  Copy, 
  Check, 
  Volume2, 
  AlertCircle,
  Gauge,
  SlidersHorizontal,
  Mic,
  History,
  X,
  Clock
} from 'lucide-react';

interface TextEditorProps {
  text: string;
  onChange: (newText: string) => void;
  onSpeak: (textToSpeak: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  status: PlaybackStatus;
  highlightRange: { start: number; length: number } | null;
  t: TranslationSchema;
  settings: SpeechSettings;
  onSettingsChange: (newSettings: Partial<SpeechSettings>) => void;
  voices: VoiceOption[];
  onTestVoice: (voiceURI: string) => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onRemoveHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

const SPEED_PRESETS = [0.75, 1.0, 1.25, 1.5, 2.0];
const PITCH_PRESETS = [
  { val: 0.5, labelKey: 'deeperPitch' as const },
  { val: 1.0, labelKey: 'neutralPitch' as const },
  { val: 1.5, labelKey: 'higherPitch' as const },
];

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChange,
  onSpeak,
  onPause,
  onResume,
  onStop,
  status,
  highlightRange,
  t,
  settings,
  onSettingsChange,
  voices,
  onTestVoice,
  history,
  onSelectHistoryItem,
  onRemoveHistoryItem,
  onClearHistory,
}) => {
  const [copied, setCopied] = useState(false);
  const [clipboardError, setClipboardError] = useState<string | null>(null);
  const [activePopover, setActivePopover] = useState<'speed' | 'pitch' | 'voice' | 'history' | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverContainerRef = useRef<HTMLDivElement>(null);

  const wordCount = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [text]);

  const charCount = text.length;

  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';
  const isActive = isPlaying || isPaused;

  // Available unique languages from voices list
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    voices.forEach((v) => {
      if (v.lang) langs.add(v.lang);
    });
    return Array.from(langs).sort((a, b) =>
      formatLanguageName(a).localeCompare(formatLanguageName(b))
    );
  }, [voices]);

  // Filter voices by selected language and natural toggle
  const filteredVoices = useMemo(() => {
    let list = voices.filter((v) => {
      if (!settings.lang) return true;
      const normalizedVoiceLang = v.lang.toLowerCase().replace('_', '-');
      const normalizedSettingLang = settings.lang.toLowerCase().replace('_', '-');
      return (
        normalizedVoiceLang === normalizedSettingLang ||
        normalizedVoiceLang.startsWith(normalizedSettingLang.split('-')[0])
      );
    });

    if (settings.filterNaturalOnly) {
      const naturalList = list.filter((v) => v.isNatural);
      if (naturalList.length > 0) {
        list = naturalList;
      }
    }

    return list;
  }, [voices, settings.lang, settings.filterNaturalOnly]);

  // Currently active voice object
  const currentVoice = useMemo(() => {
    return (
      voices.find(
        (v) =>
          (v.voice.voiceURI && v.voice.voiceURI === settings.voiceURI) ||
          v.name === settings.voiceURI
      ) || voices[0]
    );
  }, [voices, settings.voiceURI]);

  // Last 4 history items only ("aparecem os 4 ultimos e mais nada")
  const recent4History = useMemo(() => {
    return history.slice(0, 4);
  }, [history]);

  // Hover balloon delay handlers
  const handleMouseEnter = (type: 'speed' | 'pitch' | 'voice') => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActivePopover(type);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      setActivePopover((prev) => (prev === 'history' ? prev : null));
    }, 240);
  };

  const handleToggleClick = (type: 'speed' | 'pitch' | 'voice' | 'history') => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActivePopover((prev) => (prev === type ? null : type));
  };

  // Close history popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverContainerRef.current &&
        !popoverContainerRef.current.contains(e.target as Node)
      ) {
        setActivePopover((prev) => (prev === 'history' ? null : prev));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle standard "Paste text"
  const handlePasteText = async () => {
    setClipboardError(null);
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          onChange(clipText);
          textareaRef.current?.focus();
          return;
        }
      }
      setClipboardError(t.clipboardEmpty);
    } catch {
      setClipboardError(t.clipboardBlocked);
      textareaRef.current?.focus();
    }
  };

  // Handle Copy
  const handleCopyText = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Handle Clear
  const handleClear = () => {
    onStop();
    onChange('');
    setClipboardError(null);
    textareaRef.current?.focus();
  };

  // Clear clipboard error after 4 seconds
  useEffect(() => {
    if (clipboardError) {
      const timer = setTimeout(() => setClipboardError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [clipboardError]);

  // Render text with highlighted boundary if playing
  const renderHighlightedContent = () => {
    if (!highlightRange || !text) return text;

    const { start, length } = highlightRange;
    const safeStart = Math.max(0, Math.min(start, text.length));
    const safeEnd = Math.min(text.length, safeStart + Math.max(length, 1));

    const before = text.slice(0, safeStart);
    const highlighted = text.slice(safeStart, safeEnd);
    const after = text.slice(safeEnd);

    return (
      <div className="font-sans text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100">
        <span>{before}</span>
        <mark className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-950 dark:text-indigo-200 font-semibold px-1 py-0.5 rounded shadow-2xs transition-colors duration-150 border border-indigo-200/50 dark:border-indigo-800/50">
          {highlighted}
        </mark>
        <span>{after}</span>
      </div>
    );
  };

  return (
    <div id="text-editor-container" className="space-y-4" ref={popoverContainerRef}>
      {/* Top Utility Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left side: Paste Text + Minimal History Icon Button */}
        <div className="flex items-center gap-2">
          <button
            id="btn-paste-only"
            type="button"
            onClick={handlePasteText}
            className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 min-h-[44px] px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer active:scale-95"
            title={t.paste}
          >
            <Clipboard className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>{t.paste}</span>
          </button>

          {/* Minimal History Icon-Only Button with 4-Item Popover */}
          <div className="relative">
            <button
              id="btn-history-symbol"
              type="button"
              onClick={() => handleToggleClick('history')}
              className={`flex items-center justify-center min-h-[44px] min-w-[44px] w-11 h-11 rounded-full border transition-all cursor-pointer ${
                activePopover === 'history'
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title={t.historyTitle}
              aria-label={t.historyTitle}
            >
              <History className="w-4 h-4" />
              {history.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* History Popover: Strictly 4 Last Items & Nothing Else */}
            {activePopover === 'history' && (
              <div
                id="popover-history-last-4"
                className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-80 max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-2xl border border-slate-200 dark:border-slate-700/80 z-40 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{t.historyTitle}</span>
                  </div>
                  {recent4History.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onClearHistory();
                        setActivePopover(null);
                      }}
                      className="text-[11px] text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                      {t.clearClips}
                    </button>
                  )}
                </div>

                {recent4History.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    {t.noRecentClips}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {recent4History.map((item) => {
                      const snippet =
                        item.text.length > 60
                          ? item.text.slice(0, 60) + '...'
                          : item.text;
                      const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={item.id}
                          className="group flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                          onClick={() => {
                            onSelectHistoryItem(item);
                            setActivePopover(null);
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-700 dark:text-slate-200 font-normal truncate">
                              "{snippet}"
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{timeStr}</span>
                              <span>•</span>
                              <span>{item.rate}x</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveHistoryItem(item.id);
                            }}
                            className="text-slate-300 dark:text-slate-600 hover:text-red-500 p-1 rounded-md opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                            title={t.removeClip}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Copy & Clear */}
        {text && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="btn-copy-text"
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 min-h-[40px] px-3 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer"
              title={t.copy}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
              )}
              <span className="hidden xs:inline">{copied ? t.copied : t.copy}</span>
            </button>

            <button
              id="btn-clear-text"
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-200 hover:text-red-700 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 min-h-[40px] px-3 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer"
              title={t.clearAll}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t.clearAll}</span>
            </button>
          </div>
        )}
      </div>

      {/* Clipboard Alert / Notification */}
      {clipboardError && (
        <div
          id="clipboard-error-alert"
          className="flex items-center gap-2 p-3 text-xs text-amber-900 dark:text-amber-200 bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 rounded-2xl animate-fade-in"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{clipboardError}</span>
        </div>
      )}

      {/* Main Text Input Box / Highlight Mode */}
      <div className="relative rounded-[24px] border border-slate-200 dark:border-slate-700/80 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100/60 dark:focus-within:ring-indigo-950/50 bg-white dark:bg-slate-900 transition-all overflow-hidden shadow-2xs">
        {isActive && highlightRange ? (
          <div className="p-4 sm:p-6 md:p-8 min-h-[190px] sm:min-h-[220px] max-h-[380px] overflow-y-auto bg-slate-50/40 dark:bg-slate-950/30">
            {renderHighlightedContent()}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            id="main-text-input"
            rows={6}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t.placeholderText}
            className="w-full p-4 sm:p-6 md:p-8 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base sm:text-lg leading-relaxed resize-y outline-none font-normal min-h-[190px] sm:min-h-[220px] max-h-[420px] bg-transparent"
          />
        )}

        {/* Text stats footer bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-50/70 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 sm:gap-3">
            <span id="label-word-count" className="font-semibold text-slate-700 dark:text-slate-300">
              {wordCount} {wordCount === 1 ? t.wordCountSingular : t.wordCountPlural}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span id="label-char-count" className="text-slate-400 dark:text-slate-500">
              {t.charCount}: {charCount.toLocaleString()}
            </span>
          </div>

          {isActive && (
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isPlaying ? t.readingAloud : t.speechPaused}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Playback & Volume-Style Audio Selectors Bar */}
      <div
        id="playback-controls-bar"
        className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 pt-1 sm:pt-2"
      >
        {/* Left Side: Playback and Interactive Volume-Style Selectors (Speed, Pitch, Voice) */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Main Speak / Play Button */}
          {!isPlaying ? (
            <button
              id="btn-main-speak"
              type="button"
              disabled={!text.trim()}
              onClick={() => {
                if (isPaused) {
                  onResume();
                } else {
                  onSpeak(text);
                }
              }}
              className="flex-1 sm:flex-initial group flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white min-h-[48px] px-6 sm:px-8 py-3.5 rounded-[20px] font-bold text-sm sm:text-base shadow-lg shadow-indigo-100 dark:shadow-none transition-all cursor-pointer"
            >
              <span>{isPaused ? t.resumeSpeaking : t.speakText}</span>
              <Play className="w-4 h-4 fill-current transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : (
            <button
              id="btn-main-pause"
              type="button"
              onClick={onPause}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 active:scale-95 text-white min-h-[48px] px-6 py-3.5 rounded-[20px] font-bold text-sm sm:text-base shadow-sm transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>{t.pause}</span>
            </button>
          )}

          {/* Stop Button */}
          {isActive && (
            <button
              id="btn-main-stop"
              type="button"
              onClick={onStop}
              className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 min-h-[48px] px-4 sm:px-5 py-3.5 rounded-[20px] font-medium text-sm transition-colors cursor-pointer"
              title={t.stop}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t.stop}</span>
            </button>
          )}

          {/* Selector 1: Velocidade (Volume-Style Audio Button with Hover Balloon) */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('speed')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              id="btn-volume-speed-selector"
              type="button"
              onClick={() => handleToggleClick('speed')}
              className={`flex items-center gap-2 min-h-[48px] px-3.5 sm:px-4 py-3 rounded-[20px] border transition-all cursor-pointer text-sm font-semibold select-none ${
                activePopover === 'speed'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-750 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              aria-label={t.readingSpeedLabel}
            >
              <Gauge className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-bold tabular-nums">{settings.rate.toFixed(2)}x</span>
            </button>

            {/* Hover Balloon: Velocidade */}
            {activePopover === 'speed' && (
              <div
                id="balloon-speed-popover"
                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-700/80 z-30 animate-in fade-in zoom-in-95 duration-150"
                onMouseEnter={() => handleMouseEnter('speed')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-700/80 rotate-45" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                        <Gauge className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{t.speedPopoverTitle}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {t.speedPopoverDesc}
                      </p>
                    </div>
                    <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full text-xs tabular-nums shrink-0 border border-indigo-200/60 dark:border-indigo-800">
                      {settings.rate.toFixed(2)}x
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <input
                      id="popover-input-speed-slider"
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={settings.rate}
                      onChange={(e) => onSettingsChange({ rate: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      <span>0.5x</span>
                      <span>1.0x</span>
                      <span>2.0x</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {SPEED_PRESETS.map((spd) => {
                      const isSelected = Math.abs(settings.rate - spd) < 0.03;
                      return (
                        <button
                          key={spd}
                          type="button"
                          id={`popover-speed-preset-${spd}x`}
                          onClick={() => onSettingsChange({ rate: spd })}
                          className={`py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-300'
                          }`}
                        >
                          {spd}x
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selector 2: Tom da Voz / Pitch (Volume-Style Audio Button with Hover Balloon) */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('pitch')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              id="btn-volume-pitch-selector"
              type="button"
              onClick={() => handleToggleClick('pitch')}
              className={`flex items-center gap-2 min-h-[48px] px-3.5 sm:px-4 py-3 rounded-[20px] border transition-all cursor-pointer text-sm font-semibold select-none ${
                activePopover === 'pitch'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-750 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              aria-label={t.voicePitchLabel}
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-bold">
                {settings.pitch === 1.0
                  ? t.normalLabel
                  : settings.pitch < 1.0
                  ? t.deeperPitch.split(' ')[1] || 'Grave'
                  : t.higherPitch.split(' ')[1] || 'Agudo'}
              </span>
            </button>

            {/* Hover Balloon: Tom */}
            {activePopover === 'pitch' && (
              <div
                id="balloon-pitch-popover"
                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-700/80 z-30 animate-in fade-in zoom-in-95 duration-150"
                onMouseEnter={() => handleMouseEnter('pitch')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-700/80 rotate-45" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{t.pitchPopoverTitle}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {t.pitchPopoverDesc}
                      </p>
                    </div>
                    <span className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full text-xs shrink-0 border border-indigo-200/60 dark:border-indigo-800">
                      {settings.pitch.toFixed(1)}x
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <input
                      id="popover-input-pitch-slider"
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={settings.pitch}
                      onChange={(e) => onSettingsChange({ pitch: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      <span>{t.deeperPitch}</span>
                      <span>{t.neutralPitch}</span>
                      <span>{t.higherPitch}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {PITCH_PRESETS.map((p) => {
                      const isSelected = Math.abs(settings.pitch - p.val) < 0.04;
                      return (
                        <button
                          key={p.val}
                          type="button"
                          id={`popover-pitch-preset-${p.val}x`}
                          onClick={() => onSettingsChange({ pitch: p.val })}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-300'
                          }`}
                        >
                          {t[p.labelKey]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selector 3: Voz & Idioma (Volume-Style Audio Button with Hover Balloon) */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('voice')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              id="btn-volume-voice-selector"
              type="button"
              onClick={() => handleToggleClick('voice')}
              className={`flex items-center gap-2 min-h-[48px] px-3.5 sm:px-4 py-3 rounded-[20px] border transition-all cursor-pointer text-sm font-semibold select-none max-w-[200px] sm:max-w-[240px] ${
                activePopover === 'voice'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-750 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              aria-label={t.voiceTypeLabel}
              title={currentVoice ? currentVoice.displayName : 'Voz'}
            >
              <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate font-bold text-xs sm:text-sm">
                {currentVoice ? currentVoice.displayName.split('(')[0].trim() : 'Voz'}
              </span>
            </button>

            {/* Hover Balloon: Vozes & Configurações de Áudio */}
            {activePopover === 'voice' && (
              <div
                id="balloon-voice-popover"
                className="absolute bottom-full mb-3 left-0 sm:left-1/2 sm:-translate-x-1/2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-700/80 z-30 animate-in fade-in zoom-in-95 duration-150 max-h-[440px] flex flex-col"
                onMouseEnter={() => handleMouseEnter('voice')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="absolute -bottom-2 left-6 sm:left-1/2 sm:-translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-700/80 rotate-45" />

                <div className="relative z-10 space-y-3 flex-1 overflow-y-auto pr-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                        <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{t.voicePopoverTitle}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {t.voicePopoverDesc}
                      </p>
                    </div>
                  </div>

                  {/* Language Selector Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {t.languageLabel}
                    </label>
                    <select
                      id="popover-voice-lang-select"
                      value={settings.lang}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        const matching = voices.find((v) =>
                          v.lang.toLowerCase().startsWith(newLang.toLowerCase().split('-')[0])
                        );
                        onSettingsChange({
                          lang: newLang,
                          voiceURI: matching ? matching.voice.voiceURI || matching.name : settings.voiceURI,
                        });
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      {availableLanguages.map((langCode) => (
                        <option key={langCode} value={langCode}>
                          {formatLanguageName(langCode)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Natural Filter & Natural Cadence Toggle */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.filterNaturalOnly}
                        onChange={(e) =>
                          onSettingsChange({ filterNaturalOnly: e.target.checked })
                        }
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{t.filterNaturalLabel}</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.naturalCadence}
                        onChange={(e) =>
                          onSettingsChange({ naturalCadence: e.target.checked })
                        }
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{t.naturalCadenceTitle}</span>
                    </label>
                  </div>

                  {/* Voices List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <span>{t.voiceTypeLabel}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {filteredVoices.length} {filteredVoices.length === 1 ? t.availableSingular : t.availablePlural}
                      </span>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1 pr-0.5">
                      {filteredVoices.map((v) => {
                        const isSelected =
                          (v.voice.voiceURI && v.voice.voiceURI === settings.voiceURI) ||
                          v.name === settings.voiceURI;
                        return (
                          <div
                            key={v.voice.voiceURI || v.name}
                            onClick={() =>
                              onSettingsChange({
                                voiceURI: v.voice.voiceURI || v.name,
                                lang: v.lang,
                              })
                            }
                            className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-semibold'
                                : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <div className="min-w-0 flex-1 truncate pr-2">
                              <span>{v.displayName}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTestVoice(v.voice.voiceURI || v.name);
                              }}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 p-1 rounded-md bg-white dark:bg-slate-700 text-[10px] font-bold shrink-0 border border-indigo-100 dark:border-indigo-800 cursor-pointer flex items-center gap-1"
                              title={t.testVoice}
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>{t.testVoice.split(' ')[0]}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
