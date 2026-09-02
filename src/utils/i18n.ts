import { UILanguage } from '../types';

export interface TranslationSchema {
  appTitle: string;
  appBadge: string;
  appSubtitle: string;
  engineReady: string;
  speaking: string;
  paused: string;
  ready: string;
  unsupportedTitle: string;
  unsupportedDesc: string;
  
  // Editor
  inputTextTitle: string;
  placeholderText: string;
  pasteAndGo: string;
  paste: string;
  copy: string;
  copied: string;
  clearAll: string;
  wordCountSingular: string;
  wordCountPlural: string;
  charCount: string;
  readingAloud: string;
  speechPaused: string;
  speakText: string;
  resumeSpeaking: string;
  pause: string;
  stop: string;
  shortcutHint: string;
  shortcutDesc: string;
  clipboardEmpty: string;
  clipboardBlocked: string;

  // Voice Controls & Selectors
  voiceSettingsTitle: string;
  resetAudio: string;
  languageLabel: string;
  voiceTypeLabel: string;
  testVoice: string;
  testPhrase: string;
  readingSpeedLabel: string;
  voicePitchLabel: string;
  deeperPitch: string;
  neutralPitch: string;
  higherPitch: string;
  normalLabel: string;
  availableSingular: string;
  availablePlural: string;
  defaultVoiceTag: string;

  // Popover Balloons
  speedPopoverTitle: string;
  speedPopoverDesc: string;
  pitchPopoverTitle: string;
  pitchPopoverDesc: string;
  voicePopoverTitle: string;
  voicePopoverDesc: string;

  // Voice Quality & Natural Features
  filterNaturalLabel: string;
  filterAllLabel: string;
  recommendedVoicesLabel: string;
  naturalCadenceTitle: string;
  naturalCadenceDesc: string;
  noNaturalVoicesFound: string;

  // History Popover
  historyTitle: string;
  clearClips: string;
  loadAndSpeak: string;
  removeClip: string;
  noRecentClips: string;

  // Footer
  clientSideBadge: string;
  footerBenefits: string;
}

export const UI_LANGUAGES: { code: UILanguage; label: string; flag: string }[] = [
  { code: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: '中文 (简体)', flag: '🇨🇳' },
];

export const translations: Record<UILanguage, TranslationSchema> = {
  'pt-BR': {
    appTitle: 'Texto para Voz',
    appBadge: 'Rápido & Simples',
    appSubtitle: 'Cole qualquer texto, escolha a voz e velocidade, e ouça instantaneamente.',
    engineReady: 'Motor Pronto',
    speaking: 'Falando',
    paused: 'Pausado',
    ready: 'Pronto',
    unsupportedTitle: 'Síntese de Voz Não Suportada',
    unsupportedDesc: 'Seu navegador atual não suporta a API Web Speech. Experimente usar o Google Chrome, Edge, Safari ou Firefox.',

    inputTextTitle: 'Texto de Entrada',
    placeholderText: 'Cole seu texto aqui para começar a ouvir...',
    pasteAndGo: 'Colar & Falar',
    paste: 'Colar',
    copy: 'Copiar',
    copied: 'Copiado!',
    clearAll: 'Limpar Tudo',
    wordCountSingular: 'palavra',
    wordCountPlural: 'palavras',
    charCount: 'Caracteres',
    readingAloud: 'Lendo em voz alta...',
    speechPaused: 'Leitura pausada',
    speakText: 'Play',
    resumeSpeaking: 'Continuar',
    pause: 'Pausar',
    stop: 'Parar',
    shortcutHint: 'Dica:',
    shortcutDesc: 'para reprodução instantânea.',
    clipboardEmpty: 'A área de transferência está vazia.',
    clipboardBlocked: 'Permissão de colagem bloqueada. Use Ctrl+V ou cole na caixa abaixo.',

    voiceSettingsTitle: 'Voz & Configurações de Áudio',
    resetAudio: 'Redefinir Áudio',
    languageLabel: 'Idioma da Voz',
    voiceTypeLabel: 'Tipo de Voz',
    testVoice: 'Testar Voz',
    testPhrase: 'Olá! Este é um teste da voz selecionada.',
    readingSpeedLabel: 'Velocidade',
    voicePitchLabel: 'Tom da Voz',
    deeperPitch: '0.5x Grave',
    neutralPitch: '1.0x Normal',
    higherPitch: '1.5x Agudo',
    normalLabel: 'Normal',
    availableSingular: 'voz disponível',
    availablePlural: 'vozes disponíveis',
    defaultVoiceTag: '(Padrão)',

    speedPopoverTitle: 'Velocidade de Leitura',
    speedPopoverDesc: 'Ajuste o ritmo da fala em tempo real enquanto ouve.',
    pitchPopoverTitle: 'Tom da Voz',
    pitchPopoverDesc: 'Alterne entre tons mais graves ou agudos em tempo real.',
    voicePopoverTitle: 'Voz & Configurações de Áudio',
    voicePopoverDesc: 'Escolha a voz ideal, cadência natural e idioma da fala.',

    filterNaturalLabel: '⭐ Vozes Naturais / HD',
    filterAllLabel: 'Todas as Vozes',
    recommendedVoicesLabel: 'Vozes Recomendadas',
    naturalCadenceTitle: 'Modo Leitura Natural',
    naturalCadenceDesc: 'Pausas humanas de respiração em pontuações para não soar robótico.',
    noNaturalVoicesFound: 'Nenhuma voz HD para este idioma. Mostrando vozes do sistema.',

    historyTitle: 'Últimos Textos',
    clearClips: 'Limpar Histórico',
    loadAndSpeak: 'Ouvir',
    removeClip: 'Remover',
    noRecentClips: 'Nenhum histórico recente.',

    clientSideBadge: 'Síntese Local no Navegador',
    footerBenefits: 'Zero Latência • Funciona Offline • Total Privacidade',
  },

  en: {
    appTitle: 'Text to Speech',
    appBadge: 'Fast & Simple',
    appSubtitle: 'Paste any text, choose your voice and speed, and listen instantly.',
    engineReady: 'Engine Ready',
    speaking: 'Speaking',
    paused: 'Paused',
    ready: 'Ready',
    unsupportedTitle: 'Speech Synthesis Not Supported',
    unsupportedDesc: 'Your current browser does not support the Web Speech API. Please try Google Chrome, Microsoft Edge, Safari, or Firefox.',

    inputTextTitle: 'Input Text',
    placeholderText: 'Paste your text here to begin listening...',
    pasteAndGo: 'Paste & Go',
    paste: 'Paste',
    copy: 'Copy',
    copied: 'Copied!',
    clearAll: 'Clear All',
    wordCountSingular: 'word',
    wordCountPlural: 'words',
    charCount: 'Characters',
    readingAloud: 'Reading aloud...',
    speechPaused: 'Speech paused',
    speakText: 'Play',
    resumeSpeaking: 'Resume',
    pause: 'Pause',
    stop: 'Stop',
    shortcutHint: 'Shortcut:',
    shortcutDesc: 'for instant playback.',
    clipboardEmpty: 'Clipboard is empty. Please paste or type below.',
    clipboardBlocked: 'Clipboard permission blocked. Press Ctrl+V inside the text box.',

    voiceSettingsTitle: 'Voice & Audio Settings',
    resetAudio: 'Reset Audio',
    languageLabel: 'Voice Language',
    voiceTypeLabel: 'Voice Type',
    testVoice: 'Test Voice',
    testPhrase: 'Hello! This is a test of the selected voice.',
    readingSpeedLabel: 'Speed',
    voicePitchLabel: 'Voice Pitch',
    deeperPitch: '0.5x Deeper',
    neutralPitch: '1.0x Normal',
    higherPitch: '1.5x Higher',
    normalLabel: 'Normal',
    availableSingular: 'voice available',
    availablePlural: 'voices available',
    defaultVoiceTag: '(Default)',

    speedPopoverTitle: 'Reading Speed',
    speedPopoverDesc: 'Adjust speech playback speed in real-time as you listen.',
    pitchPopoverTitle: 'Voice Pitch',
    pitchPopoverDesc: 'Switch between deeper or higher vocal tones in real-time.',
    voicePopoverTitle: 'Voice & Audio Settings',
    voicePopoverDesc: 'Choose voice, natural cadence, and language.',

    filterNaturalLabel: '⭐ Natural / HD Voices',
    filterAllLabel: 'All Voices',
    recommendedVoicesLabel: 'Recommended Voices',
    naturalCadenceTitle: 'Natural Reading Mode',
    naturalCadenceDesc: 'Human breathing pauses on punctuation to eliminate robotic cadence.',
    noNaturalVoicesFound: 'No HD voice found. Showing standard system voices.',

    historyTitle: 'Recent Texts',
    clearClips: 'Clear History',
    loadAndSpeak: 'Speak',
    removeClip: 'Remove',
    noRecentClips: 'No recent clips.',

    clientSideBadge: 'Fast Client-Side Synthesis',
    footerBenefits: 'Zero Latency • Works Offline • Privacy Friendly',
  },

  es: {
    appTitle: 'Texto a Voz',
    appBadge: 'Rápido y Simple',
    appSubtitle: 'Pega cualquier texto, elige la voz y velocidad, y escucha al instante.',
    engineReady: 'Motor Listo',
    speaking: 'Hablando',
    paused: 'Pausado',
    ready: 'Listo',
    unsupportedTitle: 'Síntesis de voz no compatible',
    unsupportedDesc: 'Tu navegador actual no admite la API Web Speech. Intenta con Google Chrome, Edge, Safari o Firefox.',

    inputTextTitle: 'Texto de Entrada',
    placeholderText: 'Pega tu texto aquí para comenzar a escuchar...',
    pasteAndGo: 'Pegar y Hablar',
    paste: 'Pegar',
    copy: 'Copiar',
    copied: '¡Copiado!',
    clearAll: 'Borrar Todo',
    wordCountSingular: 'palabra',
    wordCountPlural: 'palabras',
    charCount: 'Caracteres',
    readingAloud: 'Leyendo en voz alta...',
    speechPaused: 'Lectura pausada',
    speakText: 'Play',
    resumeSpeaking: 'Reanudar',
    pause: 'Pausar',
    stop: 'Detener',
    shortcutHint: 'Atajo:',
    shortcutDesc: 'para reproducción instantánea.',
    clipboardEmpty: 'El portapapeles está vacío.',
    clipboardBlocked: 'Permiso del portapapeles bloqueado. Usa Ctrl+V en la caja de texto.',

    voiceSettingsTitle: 'Ajustes de Voz y Audio',
    resetAudio: 'Restablecer',
    languageLabel: 'Idioma de Voz',
    voiceTypeLabel: 'Tipo de Voz',
    testVoice: 'Probar Voz',
    testPhrase: '¡Hola! Esta es una prueba de la voz seleccionada.',
    readingSpeedLabel: 'Velocidad',
    voicePitchLabel: 'Tono de Voz',
    deeperPitch: '0.5x Grave',
    neutralPitch: '1.0x Normal',
    higherPitch: '1.5x Agudo',
    normalLabel: 'Normal',
    availableSingular: 'voz disponible',
    availablePlural: 'voces disponibles',
    defaultVoiceTag: '(Predeterminada)',

    speedPopoverTitle: 'Velocidad de Lectura',
    speedPopoverDesc: 'Ajusta la velocidad de reproducción en tiempo real.',
    pitchPopoverTitle: 'Tono de Voz',
    pitchPopoverDesc: 'Cambia entre tonos más graves o agudos en tiempo real.',
    voicePopoverTitle: 'Voz y Ajustes de Audio',
    voicePopoverDesc: 'Elige la voz, cadencia natural e idioma.',

    filterNaturalLabel: '⭐ Voces Naturales / HD',
    filterAllLabel: 'Todas las Voces',
    recommendedVoicesLabel: 'Voces Recomendadas',
    naturalCadenceTitle: 'Modo Lectura Natural',
    naturalCadenceDesc: 'Pausas humanas de respiración en puntuación para no sonar robótico.',
    noNaturalVoicesFound: 'No se encontraron voces HD. Mostrando voces estándar.',

    historyTitle: 'Textos Recientes',
    clearClips: 'Borrar Historial',
    loadAndSpeak: 'Escuchar',
    removeClip: 'Eliminar',
    noRecentClips: 'No hay textos recientes.',

    clientSideBadge: 'Síntesis Local en el Navegador',
    footerBenefits: 'Cero Latencia • Funciona Sin Conexión • Privacidad Total',
  },

  zh: {
    appTitle: '文本转语音',
    appBadge: '极简快速',
    appSubtitle: '粘贴任意文字，选择您喜欢的声音与语速，即刻聆听。',
    engineReady: '语音引擎就绪',
    speaking: '正在朗读',
    paused: '已暂停',
    ready: '就绪',
    unsupportedTitle: '浏览器不支持语音合成',
    unsupportedDesc: '您当前的浏览器不支持 Web Speech API，请尝试使用 Google Chrome、Edge、Safari 或 Firefox。',

    inputTextTitle: '输入文本',
    placeholderText: '在此粘贴文本，开始朗读...',
    pasteAndGo: '粘贴并朗读',
    paste: '粘贴',
    copy: '复制',
    copied: '已复制！',
    clearAll: '清空内容',
    wordCountSingular: '字/词',
    wordCountPlural: '字/词',
    charCount: '字符数',
    readingAloud: '正在大声朗读...',
    speechPaused: '朗读已暂停',
    speakText: 'Play',
    resumeSpeaking: '继续播放',
    pause: '暂停',
    stop: '停止',
    shortcutHint: '快捷键：',
    shortcutDesc: '实现一键即时朗读。',
    clipboardEmpty: '剪贴板为空，请在下方输入文字。',
    clipboardBlocked: '剪贴板权限受限，请使用 Ctrl+V 粘贴。',

    voiceSettingsTitle: '声音与音频设置',
    resetAudio: '重置音频',
    languageLabel: '语言筛选',
    voiceTypeLabel: '声音类型',
    testVoice: '试听声音',
    testPhrase: '你好！这是当前所选声音的试听测试。',
    readingSpeedLabel: '速度',
    voicePitchLabel: '声音音调',
    deeperPitch: '0.5x 低沉',
    neutralPitch: '1.0x 标准',
    higherPitch: '1.5x 高亢',
    normalLabel: '标准',
    availableSingular: '个可用声音',
    availablePlural: '个可用声音',
    defaultVoiceTag: '(默认)',

    speedPopoverTitle: '朗读速度',
    speedPopoverDesc: '在朗读过程中实时调节语速。',
    pitchPopoverTitle: '声音音调',
    pitchPopoverDesc: '调节声音音调高低，消除单调感。',
    voicePopoverTitle: '声音与音频设置',
    voicePopoverDesc: '选择偏好声音、自然呼吸韵律与语言。',

    filterNaturalLabel: '⭐ 高保真声音 / HD',
    filterAllLabel: '全部声音',
    recommendedVoicesLabel: '推荐声音',
    naturalCadenceTitle: '自然朗读模式',
    naturalCadenceDesc: '加入平滑韵律与标点呼吸停顿，消除机械感。',
    noNaturalVoicesFound: '未找到高保真声音，已显示系统标准声音。',

    historyTitle: '最近朗读',
    clearClips: '清空记录',
    loadAndSpeak: '朗读',
    removeClip: '删除',
    noRecentClips: '暂无历史记录。',

    clientSideBadge: '本地纯前端极速合成',
    footerBenefits: '零延迟 • 支持离线 • 尊重隐私',
  },
};
