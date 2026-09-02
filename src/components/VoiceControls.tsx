import React, { useMemo } from 'react';
import { SpeechSettings, VoiceOption, UILanguage } from '../types';
import { TranslationSchema } from '../utils/i18n';
import { formatLanguageName } from '../utils/languages';
import { Volume2, Gauge, Globe, SlidersHorizontal, RotateCcw, Play, Sparkles, Check } from 'lucide-react';

interface VoiceControlsProps {
  voices: VoiceOption[];
  settings: SpeechSettings;
  onSettingsChange: (newSettings: Partial<SpeechSettings>) => void;
  onTestVoice: (voiceURI: string) => void;
  isSpeaking: boolean;
  t: TranslationSchema;
  uiLang: UILanguage;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  voices,
  settings,
  onSettingsChange,
  onTestVoice,
  isSpeaking,
  t,
  uiLang,
}) => {
  // Extract unique languages available across voices
  const availableLanguages = useMemo(() => {
    const langMap = new Map<string, { code: string; label: string; count: number; naturalCount: number }>();
    voices.forEach((v) => {
      const code = v.lang;
      const label = formatLanguageName(code, uiLang);
      if (!langMap.has(code)) {
        langMap.set(code, { code, label, count: 1, naturalCount: v.isNatural ? 1 : 0 });
      } else {
        const existing = langMap.get(code)!;
        existing.count += 1;
        if (v.isNatural) existing.naturalCount += 1;
      }
    });

    return Array.from(langMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [voices, uiLang]);

  // Filter voices based on currently selected language
  const languageVoices = useMemo(() => {
    if (!settings.lang) return voices;
    const baseCode = settings.lang.split('-')[0].toLowerCase();
    const exactMatches = voices.filter((v) => v.lang.toLowerCase() === settings.lang.toLowerCase());
    if (exactMatches.length > 0) return exactMatches;

    // Fallback to matching base language (e.g. 'pt')
    return voices.filter((v) => v.lang.toLowerCase().startsWith(baseCode));
  }, [voices, settings.lang]);

  // Check if current language has natural voices
  const hasNaturalVoices = useMemo(() => {
    return languageVoices.some((v) => v.isNatural);
  }, [languageVoices]);

  // Filter list by Natural Only if toggle is on (fallback to all if no natural voices exist)
  const displayVoices = useMemo(() => {
    if (settings.filterNaturalOnly && hasNaturalVoices) {
      return languageVoices.filter((v) => v.isNatural);
    }
    return languageVoices;
  }, [languageVoices, settings.filterNaturalOnly, hasNaturalVoices]);

  // Recommended quick-pick voices (top 3 best natural or preferred voices for current language)
  const topRecommendedVoices = useMemo(() => {
    const naturalOnes = languageVoices.filter((v) => v.isNatural);
    if (naturalOnes.length > 0) {
      return naturalOnes.slice(0, 4);
    }
    return languageVoices.slice(0, 3);
  }, [languageVoices]);

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    const baseCode = newLang.split('-')[0].toLowerCase();
    const matchedVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(baseCode));
    const bestVoice = matchedVoices.find((v) => v.isNatural) || matchedVoices[0] || voices[0];

    onSettingsChange({
      lang: newLang,
      voiceURI: bestVoice ? (bestVoice.voice.voiceURI || bestVoice.name) : settings.voiceURI,
    });
  };

  // Speed presets
  const speedPresets = [0.75, 0.9, 1.0, 1.25, 1.5];

  return (
    <div id="voice-controls-panel" className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[28px] border border-slate-100 dark:border-slate-800 p-5 sm:p-7 space-y-5 sm:space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-colors">
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-sm tracking-tight">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{t.voiceSettingsTitle}</span>
        </div>
        <button
          id="btn-reset-settings"
          type="button"
          onClick={() =>
            onSettingsChange({
              rate: 1.0,
              pitch: 1.0,
              volume: 1.0,
              naturalCadence: true,
              filterNaturalOnly: true,
            })
          }
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={t.resetAudio}
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden xs:inline">{t.resetAudio}</span>
        </button>
      </div>

      {/* Recommended Voices Quick Picks */}
      {topRecommendedVoices.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              <span>{t.recommendedVoicesLabel}</span>
            </span>

            {/* Natural Only Filter Toggle */}
            {hasNaturalVoices && (
              <button
                id="btn-toggle-natural-filter"
                type="button"
                onClick={() => onSettingsChange({ filterNaturalOnly: !settings.filterNaturalOnly })}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer ${
                  settings.filterNaturalOnly
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{settings.filterNaturalOnly ? t.filterNaturalLabel : t.filterAllLabel}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-0.5">
            {topRecommendedVoices.map((v) => {
              const uri = v.voice.voiceURI || v.name;
              const isSelected = settings.voiceURI === uri || settings.voiceURI === v.name;
              return (
                <button
                  key={uri}
                  id={`btn-quick-voice-${v.name.replace(/[^a-zA-Z0-9]/g, '_')}`}
                  type="button"
                  onClick={() => {
                    onSettingsChange({ voiceURI: uri, lang: v.lang });
                    onTestVoice(uri);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-slate-750'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                  <span>{v.displayName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Language & Voice Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Language Selection */}
        <div className="space-y-2">
          <label htmlFor="select-language" className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span>{t.languageLabel}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">({availableLanguages.length})</span>
          </label>
          <div className="relative">
            <select
              id="select-language"
              value={settings.lang}
              onChange={handleLanguageChange}
              className="w-full appearance-none bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 rounded-xl min-h-[44px] px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 font-medium transition-all cursor-pointer pr-9 outline-none"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code} className="dark:bg-slate-800 dark:text-slate-100">
                  {lang.label} ({lang.naturalCount > 0 ? `${lang.naturalCount} ⭐ Natural` : `${lang.count} ${lang.count === 1 ? t.availableSingular : t.availablePlural}`})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="select-voice" className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Volume2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>{t.voiceTypeLabel}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">({displayVoices.length})</span>
            </label>
            {settings.voiceURI && (
              <button
                type="button"
                id="btn-test-voice"
                onClick={() => onTestVoice(settings.voiceURI)}
                disabled={isSpeaking}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors disabled:opacity-50 cursor-pointer"
                title={t.testVoice}
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>{t.testVoice}</span>
              </button>
            )}
          </div>
          <div className="relative">
            <select
              id="select-voice"
              value={settings.voiceURI}
              onChange={(e) => onSettingsChange({ voiceURI: e.target.value })}
              className="w-full appearance-none bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 rounded-xl min-h-[44px] px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 font-medium transition-all cursor-pointer pr-9 outline-none"
            >
              {displayVoices.map((v) => {
                const uri = v.voice.voiceURI || v.name;
                return (
                  <option key={uri} value={uri} className="dark:bg-slate-800 dark:text-slate-100">
                    {v.displayName} {v.isDefault ? `• ${t.defaultVoiceTag}` : ''}
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Natural Cadence Switcher Box */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 sm:p-4 border border-slate-150 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{t.naturalCadenceTitle}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            {t.naturalCadenceDesc}
          </p>
        </div>

        <button
          id="btn-toggle-natural-cadence"
          type="button"
          onClick={() => onSettingsChange({ naturalCadence: !settings.naturalCadence })}
          className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
            settings.naturalCadence
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${settings.naturalCadence ? 'bg-white' : 'bg-slate-400'}`} />
          <span>{settings.naturalCadence ? 'Ativo' : 'Desativado'}</span>
        </button>
      </div>

      {/* Speed & Pitch Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        {/* Speed (Rate) Control */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Gauge className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>{t.readingSpeedLabel}</span>
            </span>
            <span id="label-speed-value" className="font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-xs tabular-nums">
              {settings.rate.toFixed(2)}x
            </span>
          </div>

          {/* Slider */}
          <input
            id="input-speed-slider"
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={settings.rate}
            onChange={(e) => onSettingsChange({ rate: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
          />

          {/* Preset Buttons */}
          <div className="flex items-center justify-between gap-1.5 pt-1">
            {speedPresets.map((speed) => {
              const isSelected = Math.abs(settings.rate - speed) < 0.02;
              return (
                <button
                  key={speed}
                  id={`btn-speed-${speed}x`}
                  type="button"
                  onClick={() => onSettingsChange({ rate: speed })}
                  className={`flex-1 text-xs py-2 px-1.5 rounded-full border transition-all text-center font-medium cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {speed === 1.0 ? '1.0x' : `${speed}x`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pitch Control */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>{t.voicePitchLabel}</span>
            </span>
            <span id="label-pitch-value" className="font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-xs">
              {settings.pitch === 1.0 ? `1.0 (${t.normalLabel})` : settings.pitch < 1.0 ? `${settings.pitch.toFixed(1)} (${t.deeperPitch.split(' ')[1]})` : `${settings.pitch.toFixed(1)} (${t.higherPitch.split(' ')[1]})`}
            </span>
          </div>

          <input
            id="input-pitch-slider"
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={settings.pitch}
            onChange={(e) => onSettingsChange({ pitch: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1 px-1">
            <span>{t.deeperPitch}</span>
            <span>{t.neutralPitch}</span>
            <span>{t.higherPitch}</span>
          </div>
        </div>
      </div>
    </div>
  );
};



