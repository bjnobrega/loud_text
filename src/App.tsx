import { useState, useEffect, useCallback } from 'react';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { Header } from './components/Header';
import { TextEditor } from './components/TextEditor';
import { HistoryItem, UILanguage, ThemeMode } from './types';
import { translations } from './utils/i18n';
import { AlertTriangle, Sparkles } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'tts_recent_history_v1';
const UI_LANG_STORAGE_KEY = 'tts_ui_lang_v1';
const THEME_STORAGE_KEY = 'tts_theme_v1';

export default function App() {
  const {
    voices,
    supported,
    status,
    highlightRange,
    settings,
    setSettings,
    speak,
    pause,
    resume,
    stop,
  } = useSpeechSynthesis();

  // Interface Language State (Default: pt-BR)
  const [uiLang, setUiLang] = useState<UILanguage>(() => {
    try {
      const saved = localStorage.getItem(UI_LANG_STORAGE_KEY) as UILanguage | null;
      if (saved && (saved === 'pt-BR' || saved === 'en' || saved === 'es' || saved === 'zh')) {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'pt-BR';
  });

  // Current translations dictionary
  const t = translations[uiLang] || translations['pt-BR'];

  // Dark / Light Theme Mode State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Ignore
    }
    return 'light';
  });

  // Apply dark mode class to html document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  // Persist language preference
  const handleLanguageChange = (newLang: UILanguage) => {
    setUiLang(newLang);
    try {
      localStorage.setItem(UI_LANG_STORAGE_KEY, newLang);
    } catch {
      // Ignore
    }

    // Auto-adjust default voice language if available to match UI language
    const langPrefix = newLang === 'pt-BR' ? 'pt' : newLang === 'zh' ? 'zh' : newLang;
    const matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
    if (matchingVoice) {
      setSettings((prev) => ({
        ...prev,
        lang: matchingVoice.lang,
        voiceURI: matchingVoice.voice.voiceURI || matchingVoice.name,
      }));
    }
  };

  // Toggle theme mode
  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Text editor content
  const [text, setText] = useState<string>('');

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to local storage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage errors
    }
  }, [history]);

  // Record item into history when spoken
  const recordHistory = useCallback(
    (spokenText: string) => {
      const trimmed = spokenText.trim();
      if (!trimmed || trimmed.length < 3) return;

      const selectedVoice = voices.find(
        (v) => (v.voice.voiceURI && v.voice.voiceURI === settings.voiceURI) || v.name === settings.voiceURI
      );

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        text: trimmed,
        timestamp: Date.now(),
        voiceName: selectedVoice?.displayName || settings.voiceURI || 'Default Voice',
        lang: settings.lang,
        rate: settings.rate,
      };

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.text.trim() !== trimmed);
        return [newItem, ...filtered].slice(0, 10);
      });
    },
    [voices, settings.voiceURI, settings.lang, settings.rate]
  );

  const handleSpeak = (textToSpeak: string) => {
    if (!textToSpeak.trim()) return;
    speak(textToSpeak);
    recordHistory(textToSpeak);
  };

  const handleTestVoice = (voiceURI: string) => {
    speak(t.testPhrase, { voiceURI, rate: settings.rate, pitch: settings.pitch });
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setText(item.text);
    if (item.voiceName || item.lang) {
      setSettings((prev) => ({
        ...prev,
        lang: item.lang || prev.lang,
        rate: item.rate || prev.rate,
      }));
    }
    speak(item.text, { rate: item.rate, lang: item.lang });
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-950 selection:text-indigo-900 dark:selection:text-indigo-200 flex flex-col justify-between transition-colors duration-200">
      {/* Top Navigation Bar with Language Switcher & Dark Mode Toggle */}
      <Header
        status={status}
        uiLang={uiLang}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        t={t}
      />

      {/* Main Workspace - Clean, Minimal & Focused ("Menos é mais") */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 md:px-12 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* Browser compatibility warning if needed */}
        {!supported && (
          <div
            id="browser-unsupported-warning"
            className="flex items-start sm:items-center gap-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 p-4 rounded-2xl text-sm text-red-800 dark:text-red-200"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <strong className="font-semibold">{t.unsupportedTitle}:</strong> {t.unsupportedDesc}
            </div>
          </div>
        )}

        {/* Primary Workspace Card with Text Area and All Volume-Style Selectors */}
        <section className="bg-white dark:bg-slate-900 rounded-[28px] md:rounded-[32px] p-5 sm:p-7 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 transition-colors">
          <TextEditor
            text={text}
            onChange={setText}
            onSpeak={handleSpeak}
            onPause={pause}
            onResume={resume}
            onStop={stop}
            status={status}
            highlightRange={highlightRange}
            t={t}
            settings={settings}
            onSettingsChange={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
            voices={voices}
            onTestVoice={handleTestVoice}
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onRemoveHistoryItem={handleRemoveHistoryItem}
            onClearHistory={handleClearHistory}
          />
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="px-4 sm:px-8 md:px-12 py-5 sm:py-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-6 sm:mt-8 transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-medium text-slate-400 dark:text-slate-500 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">{t.engineReady}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">|</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>{t.clientSideBadge}</span>
            </span>
          </div>

          <div className="text-slate-400 dark:text-slate-500 text-xs">
            {t.footerBenefits}
          </div>
        </div>
      </footer>
    </div>
  );
}
