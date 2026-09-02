export type UILanguage = 'pt-BR' | 'en' | 'es' | 'zh';
export type ThemeMode = 'light' | 'dark';

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  isDefault: boolean;
  isLocalService: boolean;
  displayName: string;
  isNatural: boolean;
  provider: 'Google' | 'Microsoft' | 'Apple' | 'Siri' | 'System' | 'Other';
  qualityTag: string;
}

export interface SpeechSettings {
  voiceURI: string;
  lang: string;
  rate: number; // 0.5 to 2.0
  pitch: number; // 0.5 to 1.5
  volume: number; // 0 to 1
  naturalCadence: boolean;
  filterNaturalOnly: boolean;
}

export type PlaybackStatus = 'idle' | 'playing' | 'paused';

export interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
  voiceName: string;
  lang: string;
  rate: number;
}

