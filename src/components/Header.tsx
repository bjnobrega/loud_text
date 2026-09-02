import React from 'react';
import { UILanguage, ThemeMode, PlaybackStatus } from '../types';
import { TranslationSchema, UI_LANGUAGES } from '../utils/i18n';
import { AudioVisualizer } from './AudioVisualizer';
import { Mic, Moon, Sun, Globe } from 'lucide-react';

interface HeaderProps {
  status: PlaybackStatus;
  uiLang: UILanguage;
  onLanguageChange: (lang: UILanguage) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  t: TranslationSchema;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  uiLang,
  onLanguageChange,
  theme,
  onThemeToggle,
  t,
}) => {
  const currentLangObj = UI_LANGUAGES.find((l) => l.code === uiLang) || UI_LANGUAGES[0];

  return (
    <header className="px-4 sm:px-8 md:px-12 py-3.5 sm:py-5 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & App Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center shadow-xs shrink-0">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                {t.appTitle}
              </h1>
              <span className="hidden md:inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40">
                {t.appBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Right side controls: Visualizer + Lang Switcher + Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Status Indicator / Equalizer */}
          <div className="hidden xs:block">
            <AudioVisualizer status={status} t={t} barCount={12} />
          </div>

          {/* Language Switcher Dropdown */}
          <div className="relative group">
            <button
              id="btn-language-selector"
              type="button"
              className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              title="Change interface language"
            >
              <span className="text-sm leading-none">{currentLangObj.flag}</span>
              <span className="hidden sm:inline">{currentLangObj.label.split(' ')[0]}</span>
              <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 sm:hidden" />
              <svg className="w-3 h-3 text-slate-400 dark:text-slate-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 hidden group-hover:block hover:block z-30">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                Interface Language
              </div>
              {UI_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  id={`lang-opt-${lang.code}`}
                  type="button"
                  onClick={() => onLanguageChange(lang.code)}
                  className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    uiLang === lang.code
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                  {uiLang === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            id="btn-theme-toggle"
            type="button"
            onClick={onThemeToggle}
            className="flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 min-h-[40px] min-w-[40px] w-10 h-10 rounded-full transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
