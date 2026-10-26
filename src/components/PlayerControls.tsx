import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Clock, Volume2, Shuffle, Plus } from 'lucide-react';
import { PlaybackStatus } from '../types';

interface PlayerControlsProps {
  status: PlaybackStatus;
  currentIndex: number;
  totalWords: number;
  intervalSeconds: number;
  onChangeInterval: (seconds: number) => void;
  repeatCount: number;
  onChangeRepeatCount: (count: number) => void;
  shuffleOrder: boolean;
  onToggleShuffle: () => void;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onReplayCurrent: () => void;
  onAddIntervalTime?: (additionalSeconds: number) => void;
  countdownRemaining: number | null;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  status,
  currentIndex,
  totalWords,
  intervalSeconds,
  onChangeInterval,
  repeatCount,
  onChangeRepeatCount,
  shuffleOrder,
  onToggleShuffle,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onReplayCurrent,
  onAddIntervalTime,
  countdownRemaining,
}) => {
  const isPlaying = status === 'playing' || status === 'waiting';
  const hasWords = totalWords > 0;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalWords - 1;

  const quickIntervals = [3, 5, 8, 10, 15, 20];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-5">
      {/* 1. Main Action Buttons: Back, Play/Pause, Forward, Replay */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Step backward & Forward with Play button in center */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
          {/* Previous / Backward Button */}
          <button
            type="button"
            onClick={onPrevious}
            disabled={!hasWords || isFirst}
            title="上一个词 (后退) [快捷键: ←]"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all text-xs sm:text-sm font-semibold"
          >
            <SkipBack className="w-4 h-4 text-slate-600" />
            <span>后退</span>
          </button>

          {/* Primary Play / Pause Button */}
          <button
            type="button"
            onClick={isPlaying ? onPause : onPlay}
            disabled={!hasWords}
            title={isPlaying ? '暂停听写 [快捷键: 空格]' : '开始听写 [快捷键: 空格]'}
            className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 text-sm sm:text-base ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            } disabled:opacity-40 disabled:pointer-events-none`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>暂停听写</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{currentIndex > 0 && currentIndex < totalWords ? '继续听写' : '开始听写'}</span>
              </>
            )}
          </button>

          {/* Next / Forward Button */}
          <button
            type="button"
            onClick={onNext}
            disabled={!hasWords || isLast}
            title="下一个词 (前进) [快捷键: →]"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all text-xs sm:text-sm font-semibold"
          >
            <span>前进</span>
            <SkipForward className="w-4 h-4 text-slate-600" />
          </button>

          {/* Replay current word */}
          <button
            type="button"
            onClick={onReplayCurrent}
            disabled={!hasWords}
            title="重读当前词 [快捷键: R]"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick timer boost if in waiting countdown */}
        {status === 'waiting' && countdownRemaining !== null && onAddIntervalTime && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl animate-fade-in">
            <span className="text-xs text-indigo-700 font-medium">写不完？</span>
            <button
              onClick={() => onAddIntervalTime(3)}
              className="text-xs bg-white text-indigo-700 font-semibold px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-100 active:scale-95 transition-all flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>+3秒</span>
            </button>
            <button
              onClick={() => onAddIntervalTime(5)}
              className="text-xs bg-white text-indigo-700 font-semibold px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-100 active:scale-95 transition-all flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>+5秒</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Interval & Repeat Settings Toolbar */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Interval Setting Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>单词朗读间隔时间:</span>
              <span className="font-mono text-indigo-600 font-bold text-sm tabular-nums">
                {intervalSeconds} 秒
              </span>
            </label>
            <span className="text-[11px] text-slate-400">词与词之间的停顿空隙</span>
          </div>

          {/* Quick presets & Stepper */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickIntervals.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => onChangeInterval(sec)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  intervalSeconds === sec
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}

            {/* Custom slider */}
            <div className="flex-1 min-w-[120px] flex items-center gap-2 ml-2">
              <input
                type="range"
                min={1}
                max={40}
                step={1}
                value={intervalSeconds}
                onChange={(e) => onChangeInterval(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Repetitions & Shuffle Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>每个单词朗读遍数</span>
            </label>
            <span className="text-[11px] text-slate-400">听写建议每词读 2 遍</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Repeat count segmented control */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChangeRepeatCount(count)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    repeatCount === count
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  读 {count} 遍
                </button>
              ))}
            </div>

            {/* Shuffle toggle */}
            <button
              type="button"
              onClick={onToggleShuffle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                shuffleOrder
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title={shuffleOrder ? '当前已开启乱序听写' : '点击开启乱序听写（打乱顺序防背题）'}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{shuffleOrder ? '乱序打乱' : '顺序听写'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
