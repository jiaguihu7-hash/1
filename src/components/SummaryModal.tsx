import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Star,
  ArrowRight,
  Download,
  X,
  Check,
  Volume2,
  History,
  AlertCircle,
  Play
} from 'lucide-react';
import { WordItem, DictationRecord, DictationSettings } from '../types';
import { formatWordsToText } from '../utils/parser';
import { speakWord } from '../utils/audio';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: WordItem[];
  records: DictationRecord[];
  onRestartAll: () => void;
  onPracticeMistakes: (mistakeWords: WordItem[]) => void;
  onOpenPasteModal: () => void;
  settings?: DictationSettings;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  words,
  records,
  onRestartAll,
  onPracticeMistakes,
  onOpenPasteModal,
  settings,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'correct'>('all');
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe catch
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = words.length;
  const correctWords = words.filter((w) => w.isCorrect === true);
  const wrongWords = words.filter((w) => w.isCorrect === false);

  const testedCount = correctWords.length + wrongWords.length;
  const accuracy = testedCount > 0 ? Math.round((correctWords.length / testedCount) * 100) : null;

  const filteredWords = words.filter((w) => {
    if (filterMode === 'wrong') return w.isCorrect === false;
    if (filterMode === 'correct') return w.isCorrect === true;
    return true;
  });

  const handleSpeakSingle = async (wordText: string) => {
    setPlayingWord(wordText);
    await speakWord(wordText, {
      rate: settings?.speechRate ?? 1.0,
      pitch: settings?.speechPitch ?? 1.0,
      voiceURI: settings?.voiceURI,
      voiceAccent: settings?.voiceAccent || 'us',
    });
    setPlayingWord(null);
  };

  const handleExport = () => {
    const text = formatWordsToText(words);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `听写结果回顾_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">听写回顾与成绩</h2>
              <p className="text-xs text-slate-500">
                本轮听写已结束，点击任意单词即可重听发音
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. Score Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
              <div className="text-2xl font-black text-slate-800 font-mono tabular-nums">{total}</div>
              <div className="text-xs text-slate-500 mt-0.5">总单词数</div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-center">
              <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">{correctWords.length}</div>
              <div className="text-xs text-emerald-800 mt-0.5">拼写正确</div>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200/80 text-center">
              <div className="text-2xl font-black text-rose-700 font-mono tabular-nums">{wrongWords.length}</div>
              <div className="text-xs text-rose-800 mt-0.5">拼写错误</div>
            </div>

            <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200/80 text-center">
              <div className="text-2xl font-black text-indigo-700 font-mono tabular-nums">
                {accuracy !== null ? `${accuracy}%` : '-'}
              </div>
              <div className="text-xs text-indigo-800 mt-0.5">本次正确率</div>
            </div>
          </div>

          {/* 2. History of Last 3 Records (当前词库独立的前3次记录) */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <History className="w-4 h-4 text-indigo-600" />
                <span>本词库前 3 次历史记录</span>
              </div>
              <span className="text-[11px] text-slate-400">词库专属独立保存</span>
            </div>

            {records.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">
                这是本词库第 1 次完成听写，成绩已保存！
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {records.map((rec, index) => {
                  const dateStr = new Date(rec.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const isCurrent = index === records.length - 1;

                  return (
                    <div
                      key={rec.id}
                      className={`p-3 rounded-xl border transition-all text-xs ${
                        isCurrent
                          ? 'bg-white border-indigo-300 shadow-sm ring-1 ring-indigo-200/50'
                          : 'bg-white/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-700">
                          第 {index + 1} 次 {isCurrent && '(本次)'}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{dateStr}</span>
                      </div>

                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-base font-bold font-mono text-indigo-600">
                          {rec.accuracy}%
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {rec.correctCount} / {rec.totalWords} 正确
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${rec.accuracy}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Detailed Word Review List (可点击发音) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">逐词回顾核对</h3>
                <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                  点击任意词条即可重读发音
                </span>
              </div>

              {/* Filter tabs */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  全部 ({words.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('wrong')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    filterMode === 'wrong' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  错误 ({wrongWords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('correct')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    filterMode === 'correct' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  正确 ({correctWords.length})
                </button>
              </div>
            </div>

            {/* List with full row clickability */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredWords.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  当前分类下无单词
                </div>
              ) : (
                filteredWords.map((item, idx) => {
                  const isWrong = item.isCorrect === false;
                  const isRight = item.isCorrect === true;
                  const isCurrentlyPlaying = playingWord === item.word;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSpeakSingle(item.word)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all cursor-pointer group active:scale-[0.99] ${
                        isCurrentlyPlaying
                          ? 'ring-2 ring-indigo-500 bg-indigo-50/70 border-indigo-300 shadow-xs'
                          : isWrong
                          ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50/70 hover:border-rose-300'
                          : isRight
                          ? 'bg-emerald-50/30 border-emerald-200 hover:bg-emerald-50/60 hover:border-emerald-300'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                      title="点击即可朗读此单词发音"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Status Icon */}
                        <span className="shrink-0">
                          {isRight && (
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                          {isWrong && (
                            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                          {!isRight && !isWrong && (
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-mono text-[11px]">
                              {idx + 1}
                            </span>
                          )}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                              {item.word}
                            </span>
                            {item.phonetic && (
                              <span className="text-slate-400 font-mono text-[11px]">
                                {item.phonetic}
                              </span>
                            )}
                          </div>

                          {/* Meaning & user input */}
                          <div className="flex items-center gap-2 text-slate-500 mt-1 flex-wrap">
                            {item.meaning && <span className="text-slate-600 font-medium">{item.meaning}</span>}
                            {item.userInput && isWrong && (
                              <span className="text-rose-700 font-mono text-[11px] bg-rose-100/70 px-2 py-0.5 rounded border border-rose-200">
                                当时键入: {item.userInput}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Play Audio Indicator */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrentlyPlaying ? (
                          <div className="flex items-center gap-1.5 text-indigo-600 font-semibold text-xs bg-indigo-100/70 px-2.5 py-1.5 rounded-xl animate-pulse">
                            <span className="flex gap-0.5 items-center">
                              <span className="w-1 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="w-1 h-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="w-1 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                            </span>
                            <span>朗读中...</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeakSingle(item.word);
                            }}
                            className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-medium ${
                              isWrong
                                ? 'text-rose-700 bg-rose-100/80 hover:bg-rose-200'
                                : 'text-slate-500 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                          >
                            <Volume2 className="w-4 h-4" />
                            <span className="hidden sm:inline">重听</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>导出单词文本</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {wrongWords.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onPracticeMistakes(wrongWords);
                  onClose();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4" />
                <span>重测本次错词 ({wrongWords.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onRestartAll();
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow-sm shadow-indigo-200 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>再次完整听写</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
