import React from 'react';
import { PlaybackStatus } from '../types';
import { TranslationSchema } from '../utils/i18n';

interface AudioVisualizerProps {
  status: PlaybackStatus;
  t: TranslationSchema;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ status, t, barCount = 14 }) => {
  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';

  const statusLabel = isPlaying ? t.speaking : isPaused ? t.paused : t.ready;

  return (
    <div
      id="audio-visualizer-container"
      className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 bg-slate-50/90 dark:bg-slate-800/80 rounded-full border border-slate-200/80 dark:border-slate-700/80 transition-colors"
      title={statusLabel}
    >
      {/* Status dot */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            isPlaying
              ? 'bg-indigo-600 dark:bg-indigo-400 animate-ping'
              : isPaused
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
        />
        <span
          className={`w-2 h-2 -ml-3.5 rounded-full ${
            isPlaying
              ? 'bg-indigo-600 dark:bg-indigo-400'
              : isPaused
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
        />
      </div>

      {/* Mini equalizer bars - visible on all screens */}
      <div className="flex items-center gap-[2px] sm:gap-[2.5px] h-4 sm:h-5 shrink-0">
        {Array.from({ length: barCount }).map((_, index) => {
          const animDelay = (index * 0.07) % 1.0;
          const minHeight = 3;

          return (
            <span
              key={index}
              id={`visualizer-bar-${index}`}
              className={`w-[2px] sm:w-[2.5px] rounded-full transition-all duration-200 ${
                isPlaying
                  ? 'bg-indigo-600 dark:bg-indigo-400'
                  : isPaused
                  ? 'bg-indigo-300 dark:bg-indigo-600'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
              style={{
                height: isPlaying
                  ? `${Math.sin((index + 1) * 0.8) * 7 + 10}px`
                  : isPaused
                  ? '5px'
                  : `${minHeight}px`,
                animationDuration: isPlaying ? `${0.5 + ((index % 4) * 0.12)}s` : undefined,
                animationDelay: `${animDelay}s`,
              }}
            />
          );
        })}
      </div>

      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 min-w-[42px] truncate">
        {statusLabel}
      </span>
    </div>
  );
};


