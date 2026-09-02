import React from 'react';
import { HistoryItem } from '../types';
import { TranslationSchema } from '../utils/i18n';
import { History, Play, Trash2, Clock } from 'lucide-react';

interface RecentHistoryProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onRemoveItem: (id: string) => void;
  t: TranslationSchema;
}

export const RecentHistory: React.FC<RecentHistoryProps> = ({
  items,
  onSelect,
  onClear,
  onRemoveItem,
  t,
}) => {
  if (items.length === 0) return null;

  return (
    <div id="recent-history-section" className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[28px] border border-slate-100 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-colors">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
          <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{t.recentClipsTitle} ({items.length})</span>
        </div>
        <button
          id="btn-clear-history"
          type="button"
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          {t.clearClips}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => {
          const previewText = item.text.length > 70 ? item.text.slice(0, 70) + '...' : item.text;
          const formattedDate = new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              id={`history-item-${item.id}`}
              className="group bg-slate-50/70 dark:bg-slate-800/60 hover:bg-indigo-50/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800/60 rounded-2xl p-3.5 transition-all flex flex-col justify-between gap-3 shadow-2xs"
            >
              <p
                onClick={() => onSelect(item)}
                className="text-xs text-slate-700 dark:text-slate-200 font-normal leading-relaxed line-clamp-2 cursor-pointer hover:text-indigo-900 dark:hover:text-indigo-300"
                title={item.text}
              >
                "{previewText}"
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  <span>{formattedDate}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{item.rate}x</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                    title={t.loadAndSpeak}
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{t.speakText.split(' ')[0]}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


