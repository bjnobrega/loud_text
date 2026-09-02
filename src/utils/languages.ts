import { VoiceOption } from '../types';

// Unwanted novelty / robotic toy voices that clutter the system
const ROBOTIC_NOVELTY_VOICES = new Set([
  'zarvox', 'cellos', 'trinoids', 'boing', 'bad news', 'good news', 'bells',
  'bubbles', 'deranged', 'hysterical', 'pipe organ', 'whisper', 'albert', 'bahh',
  'fred', 'junior', 'kathy', 'ralph', 'princess', 'vicki', 'victoria', 'wobble',
  'espeak', 'organ', 'sin-wave', 'whisper'
]);

export function isRoboticNoveltyVoice(voiceName: string): boolean {
  const lower = voiceName.toLowerCase().trim();
  for (const novelty of ROBOTIC_NOVELTY_VOICES) {
    if (lower === novelty || lower.startsWith(`${novelty} `) || lower.includes(`(${novelty})`)) {
      return true;
    }
  }
  return false;
}

export function detectVoiceQuality(rawName: string): {
  isNatural: boolean;
  provider: 'Google' | 'Microsoft' | 'Apple' | 'Siri' | 'System' | 'Other';
  qualityTag: string;
} {
  const lower = rawName.toLowerCase();

  // Provider detection
  let provider: 'Google' | 'Microsoft' | 'Apple' | 'Siri' | 'System' | 'Other' = 'System';
  if (lower.includes('google')) {
    provider = 'Google';
  } else if (lower.includes('microsoft')) {
    provider = 'Microsoft';
  } else if (lower.includes('siri')) {
    provider = 'Siri';
  } else if (lower.includes('apple') || lower.includes('enhanced') || lower.includes('compact') || lower.includes('premium')) {
    provider = 'Apple';
  }

  // Natural / Neural check
  const isNatural =
    lower.includes('natural') ||
    lower.includes('neural') ||
    lower.includes('google') ||
    lower.includes('online') ||
    lower.includes('enhanced') ||
    lower.includes('premium') ||
    lower.includes('siri') ||
    lower.includes('studio') ||
    lower.includes('wavenet');

  let qualityTag = 'Padrão';
  if (lower.includes('natural') || lower.includes('neural')) {
    qualityTag = 'Natural ⭐';
  } else if (lower.includes('google')) {
    qualityTag = 'Google HD ⭐';
  } else if (lower.includes('premium') || lower.includes('enhanced')) {
    qualityTag = 'Premium HD ⭐';
  } else if (lower.includes('online')) {
    qualityTag = 'Online HD ⭐';
  } else if (isNatural) {
    qualityTag = 'Natural ⭐';
  }

  return { isNatural, provider, qualityTag };
}

export function cleanVoiceName(rawName: string): string {
  // Extract core name from verbose system strings
  let cleaned = rawName
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/^Microsoft\s+/i, '')
    .replace(/^Google\s+/i, 'Google ')
    .replace(/\s*-\s*(Desktop|Mobile|Online|Natural|Portuguese|English|Spanish|French|German|Italian|Chinese|Japanese).*/gi, '')
    .trim();

  // If cleaning made it too short or empty, fallback to rawName
  if (!cleaned || cleaned.length < 2) {
    cleaned = rawName.split('-')[0].trim();
  }

  return cleaned;
}

export function parseVoiceOption(v: SpeechSynthesisVoice): VoiceOption | null {
  if (isRoboticNoveltyVoice(v.name)) {
    return null;
  }

  const { isNatural, provider, qualityTag } = detectVoiceQuality(v.name);
  const cleanName = cleanVoiceName(v.name);

  // Formatted display name for dropdown
  let displayName = cleanName;
  if (isNatural) {
    displayName = `${cleanName} (${qualityTag})`;
  } else if (provider !== 'System') {
    displayName = `${cleanName} (${provider})`;
  }

  return {
    voice: v,
    name: v.name,
    lang: v.lang,
    isDefault: v.default,
    isLocalService: v.localService,
    displayName,
    isNatural,
    provider,
    qualityTag,
  };
}

// Helper to format language tags into friendly readable labels with locale support
export function formatLanguageName(langCode: string, uiLocale: string = 'pt-BR'): string {
  try {
    if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
      const languageNames = new Intl.DisplayNames([uiLocale, 'en'], { type: 'language' });
      const normalized = langCode.replace('_', '-');
      const baseLang = normalized.split('-')[0];
      const langName = languageNames.of(baseLang) || baseLang;

      // Extract region if present
      const parts = normalized.split('-');
      if (parts.length > 1) {
        const regionNames = new Intl.DisplayNames([uiLocale, 'en'], { type: 'region' });
        try {
          const region = regionNames.of(parts[1].toUpperCase());
          if (region) {
            return `${langName} (${region})`;
          }
        } catch {
          // Ignore region error
        }
      }
      return langName;
    }
  } catch {
    // Fallback if Intl fails
  }

  const fallbackMap: Record<string, string> = {
    'pt-BR': 'Português (Brasil)',
    'pt-PT': 'Português (Portugal)',
    'en-US': 'English (United States)',
    'en-GB': 'English (United Kingdom)',
    'en-AU': 'English (Australia)',
    'en-CA': 'English (Canada)',
    'en-IN': 'English (India)',
    'es-ES': 'Español (España)',
    'es-MX': 'Español (México)',
    'es-US': 'Español (Estados Unidos)',
    'fr-FR': 'Français (France)',
    'fr-CA': 'Français (Canada)',
    'de-DE': 'Deutsch (Deutschland)',
    'it-IT': 'Italiano (Italia)',
    'ja-JP': '日本語 (日本)',
    'ko-KR': '한국어 (대한민국)',
    'zh-CN': '中文 (简体, 中国)',
    'zh-TW': '中文 (繁體, 台灣)',
    'ru-RU': 'Русский (Россия)',
    'ar-SA': 'العربية (السعودية)',
    'hi-IN': 'हिन्दी (भारत)',
    'nl-NL': 'Nederlands (Nederland)',
    'tr-TR': 'Türkçe (Türkiye)',
    'pl-PL': 'Polski (Polska)',
    'sv-SE': 'Svenska (Sverige)',
    'da-DK': 'Dansk (Danmark)',
    'fi-FI': 'Suomi (Suomi)',
    'no-NO': 'Norsk (Norge)',
    'el-GR': 'Ελληνικά (Ελλάδα)',
    'he-IL': 'עברית (ישראל)',
    'id-ID': 'Bahasa Indonesia (Indonesia)',
    'vi-VN': 'Tiếng Việt (Việt Nam)',
    'th-TH': 'ไทย (ไทย)',
  };

  return fallbackMap[langCode] || fallbackMap[langCode.replace('_', '-')] || langCode;
}


