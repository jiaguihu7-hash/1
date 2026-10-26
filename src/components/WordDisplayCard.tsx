import React, { useState } from 'react';
import { Volume2, Star, Eye, EyeOff, RotateCcw, Check, X, Sparkles } from 'lucide-react';
import { WordItem, PlaybackStatus } from '../types';

interface WordDisplayCardProps {
  currentWord: WordItem | null;
  currentIndex: number;
  totalWords: number;
  status: PlaybackStatus;
  currentRepetition: number;
  totalRepetitions: number;
  countdownRemaining: number | null;
  intervalDuration: number;
  isBlindMode: boolean;
  onToggleBlindMode: () => void;
  onToggleStar: (id: string) => void;
  onReplayCurrent: () => void;
  interactiveTyping: boolean;
  onValidateAndAdvance?: (wordId: string, userInput: string) => void;
  lastResult?: { isCorrect: boolean } | null;
}

export const WordDisplayCard: React.FC<WordDisplayCardProps> = ({
  currentWord,
  currentIndex,
  totalWords,
  status,
  currentRepetition,
  totalRepetitions,
  countdownRemaining,
  intervalDuration,
  isBlindMode,
  onToggleBlindMode,
  onToggleStar,
  onReplayCurrent,
  interactiveTyping,
  onValidateAndAdvance,
  lastResult,
}) => {
  const [peekReveal, setPeekReveal] = useState(false);
  const [typedValue, setTypedValue] = useState('');
  const [lastCheckedId, setLastCheckedId] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Reset typed value when word changes & autofocus input if typing mode active
  React.useEffect(() => {
    if (currentWord?.id !== lastCheckedId) {
      setTypedValue(currentWord?.userInput || '');
      setLastCheckedId(currentWord?.id || null);
      setPeekReveal(false);

      if (interactiveTyping) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 80);
      }
    }
  }, [currentWord, lastCheckedId, interactiveTyping]);

  if (!currentWord || totalWords === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-4">
          <Volume2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">暂无听写单词</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          点击右上角「粘贴单词」录入单词列表，或选择内置官方词汇库开始听写。
        </p>
      </div>
    );
  }

  const isSpeaking = status === 'playing';
  const isWaiting = status === 'waiting';
  const showContent = !isBlindMode || peekReveal;

  // Calculate countdown percentage for circular/linear indicator
  const countdownRatio = isWaiting && countdownRemaining !== null && intervalDuration > 0
    ? Math.max(0, Math.min(1, countdownRemaining / intervalDuration))
    : 0;

  const lastSubmitTimeRef = React.useRef(0);
  const handleTypingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastSubmitTimeRef.current < 80) return;
    lastSubmitTimeRef.current = now;
    if (!currentWord || !onValidateAndAdvance) return;
    onValidateAndAdvance(currentWord.id, typedValue.trim());
  };

  const isCorrect = currentWord.isCorrect;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col relative">
      {/* Top progress line indicating waiting interval or progress */}
      {isWaiting && (
        <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-100 ease-linear"
            style={{ width: `${(1 - countdownRatio) * 100}%` }}
          />
        </div>
      )}

      {/* Card Header Info */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-slate-500 text-sm">
            第 {currentIndex + 1} / {totalWords} 词
          </span>
          <span className="text-slate-300">·</span>
          {/* Status Label */}
          {isSpeaking && (
            <span className="text-indigo-600 font-semibold flex items-center gap-1.5">
              <span className="flex gap-0.5 items-center">
                <span className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
              </span>
              <span>朗读中 (第 {currentRepetition}/{totalRepetitions} 遍)</span>
            </span>
          )}
          {isWaiting && (
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <span>间隔等待中</span>
              <span className="font-mono font-bold text-amber-800 tabular-nums">
                ({countdownRemaining !== null ? countdownRemaining.toFixed(1) : 0}s)
              </span>
            </span>
          )}
          {status === 'paused' && (
            <span className="text-slate-500 font-medium">已暂停</span>
          )}
          {status === 'idle' && (
            <span className="text-slate-400">就绪</span>
          )}
        </div>

        {/* Action icons: Star & Peek */}
        <div className="flex items-center gap-2">
          {/* Peek button in blind mode */}
          {isBlindMode && (
            <button
              type="button"
              onClick={() => setPeekReveal(!peekReveal)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              title={peekReveal ? '隐藏单词' : '偷看一眼答案'}
            >
              {peekReveal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{peekReveal ? '隐藏' : '看一眼'}</span>
            </button>
          )}

          {/* Star button */}
          <button
            type="button"
            onClick={() => onToggleStar(currentWord.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              currentWord.isStarred
                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={currentWord.isStarred ? '取消标记' : '标记为生词/错词'}
          >
            <Star className={`w-4 h-4 ${currentWord.isStarred ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Word Presentation Area */}
      <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[260px]">
        {showContent ? (
          <div className="space-y-3 w-full animate-fade-in">
            {/* The Word */}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 select-all">
              {currentWord.word}
            </h1>

            {/* Phonetic if present */}
            {currentWord.phonetic && (
              <p className="font-mono text-sm sm:text-base text-slate-500">
                {currentWord.phonetic}
              </p>
            )}

            {/* Meaning/Translation if present */}
            {currentWord.meaning && (
              <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto font-medium">
                {currentWord.meaning}
              </p>
            )}
          </div>
        ) : (
          /* Blind Mode Obscured Display */
          <div className="space-y-4 flex flex-col items-center justify-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
              <EyeOff className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-mono tracking-widest text-slate-300 font-bold select-none">
                {'• '.repeat(Math.min(10, Math.max(5, currentWord.word.length)))}
              </div>
              <p className="text-xs text-slate-400">
                盲听听写模式已开启（单词已隐藏，请在纸上书写或下方键入）
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPeekReveal(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-4 decoration-indigo-300 hover:decoration-indigo-600 transition-colors"
            >
              偷看当前单词答案
            </button>
          </div>
        )}

        {/* Live Replay Button during listening */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onReplayCurrent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>再读一遍</span>
          </button>
        </div>
      </div>

      {/* Interactive Typing Practice Box (核对后立即跳到下一个，错时不显露正确拼写，仅用红绿区分) */}
      {interactiveTyping && (
        <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-200">
          <form onSubmit={handleTypingSubmit} className="max-w-md mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span className="font-medium">听写实时拼写核对:</span>
              <div className="flex items-center gap-2">
                {lastResult && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold animate-fade-in ${
                      lastResult.isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {lastResult.isCorrect ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>上一词正确</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 stroke-[3]" />
                        <span>上一词错误</span>
                      </>
                    )}
                  </span>
                )}
                <span className="text-slate-400 text-[11px]">按回车核对立即跳至下一词</span>
              </div>
            </div>

            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={typedValue}
                onChange={(e) => {
                  setTypedValue(e.target.value);
                }}
                placeholder="键入听到的单词，按回车核对..."
                className={`w-full px-4 py-2.5 text-sm sm:text-base font-medium rounded-xl border transition-all focus:outline-none focus:ring-2 pr-20 ${
                  isCorrect === true
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 ring-2 ring-emerald-500/20'
                    : isCorrect === false
                    ? 'border-rose-500 bg-rose-50/60 text-rose-950 ring-2 ring-rose-500/20'
                    : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />

              <div className="absolute right-2 flex items-center gap-1">
                {isCorrect === true && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg animate-scale-up">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>正确</span>
                  </span>
                )}
                {isCorrect === false && (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded-lg animate-scale-up">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                    <span>错误</span>
                  </span>
                )}
                {isCorrect === null && (
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm transition-all"
                  >
                    核对 ↵
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

