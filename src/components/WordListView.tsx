import React, { useState } from 'react';
import { Volume2, Star, Check, ListFilter, Play, BookmarkCheck } from 'lucide-react';
import { WordItem } from '../types';

interface WordListViewProps {
  words: WordItem[];
  currentIndex: number;
  onSelectWord: (index: number) => void;
  onToggleStar: (id: string) => void;
  onSpeakWordSingle: (word: string) => void;
  onFilterStarredOnly: () => void;
  isStarredOnlyActive: boolean;
  onResetFilter: () => void;
}

export const WordListView: React.FC<WordListViewProps> = ({
  words,
  currentIndex,
  onSelectWord,
  onToggleStar,
  onSpeakWordSingle,
  onFilterStarredOnly,
  isStarredOnlyActive,
  onResetFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const starredCount = words.filter((w) => w.isStarred).length;

  const filteredWords = words
    .map((word, originalIndex) => ({ word, originalIndex }))
    .filter(({ word }) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        word.word.toLowerCase().includes(q) ||
        (word.meaning && word.meaning.toLowerCase().includes(q))
      );
    });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full max-h-[700px]">
      {/* Header and Filter */}
      <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">听写单词清单</h3>
            <span className="text-xs font-mono text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
              {words.length} 词
            </span>
          </div>

          {/* Quick filter for starred words */}
          {starredCount > 0 && (
            <button
              type="button"
              onClick={isStarredOnlyActive ? onResetFilter : onFilterStarredOnly}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                isStarredOnlyActive
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{isStarredOnlyActive ? '返回全部' : `仅听写生词 (${starredCount})`}</span>
            </button>
          )}
        </div>

        {/* Quick Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索词单中单词或中文..."
          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      {/* Words List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredWords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            无匹配的单词
          </div>
        ) : (
          filteredWords.map(({ word, originalIndex }) => {
            const isActive = originalIndex === currentIndex;
            const isCompleted = originalIndex < currentIndex;

            return (
              <div
                key={word.id}
                onClick={() => onSelectWord(originalIndex)}
                className={`px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-indigo-50/90 border-l-4 border-l-indigo-600 text-indigo-950 font-medium'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                {/* Left: Index & Word */}
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`font-mono text-xs w-6 text-right tabular-nums shrink-0 ${
                      isActive ? 'text-indigo-600 font-bold' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 inline stroke-[2.5]" /> : `${originalIndex + 1}.`}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-950 font-bold' : 'text-slate-800'}`}>
                        {word.word}
                      </span>
                      {word.phonetic && (
                        <span className="text-slate-400 font-mono text-xs hidden sm:inline">
                          {word.phonetic}
                        </span>
                      )}
                    </div>
                    {word.meaning && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {word.meaning}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Single pronunciation */}
                  <button
                    type="button"
                    onClick={() => onSpeakWordSingle(word.word)}
                    title="朗读该词"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Star toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleStar(word.id)}
                    title={word.isStarred ? '取消生词标记' : '标记为生词/错词'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      word.isStarred
                        ? 'text-amber-500 hover:text-amber-600'
                        : 'text-slate-300 hover:text-slate-500'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${word.isStarred ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer stats */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span>已进行到: 第 {Math.min(currentIndex + 1, words.length)} / {words.length} 词</span>
        <span>点击任意词可直接跳至该词</span>
      </div>
    </div>
  );
};
