import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { PlayerControls } from './components/PlayerControls';
import { WordDisplayCard } from './components/WordDisplayCard';
import { WordListView } from './components/WordListView';
import { WordInputModal } from './components/WordInputModal';
import { SettingsModal } from './components/SettingsModal';
import { SavedListsModal } from './components/SavedListsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { SummaryModal } from './components/SummaryModal';
import { InstallModal } from './components/InstallModal';
import { Globe, WifiOff } from 'lucide-react';
import { WordItem, DictationSettings, SavedWordList, PlaybackStatus, DictationRecord } from './types';
import { PRESET_WORD_LISTS } from './data/presets';
import { parseWordListText } from './utils/parser';
import { speakWord, stopSpeech, playChime } from './utils/audio';
import { useOnlineStatus } from './utils/useOnlineStatus';


const STORAGE_KEY_SAVED_LISTS = 'worddictate_saved_lists_v1';
const STORAGE_KEY_SETTINGS = 'worddictate_settings_v1';
const STORAGE_KEY_CURRENT_LIST = 'worddictate_current_list_v1';
const STORAGE_KEY_CURRENT_LIST_ID = 'worddictate_current_list_id_v2';
const STORAGE_KEY_CURRENT_TITLE = 'worddictate_current_title_v2';
const STORAGE_KEY_RECORDS_BY_LIST = 'worddictate_records_by_list_v2';

const DEFAULT_SETTINGS: DictationSettings = {
  intervalSeconds: 6,
  repeatCount: 2,
  repeatGapSeconds: 1.5,
  speechRate: 1.0,
  speechPitch: 1.0,
  voiceURI: '',
  voiceAccent: 'us',
  enableChime: true,
  isBlindMode: true,
  interactiveTyping: true,
  shuffleOrder: false,
  autoLoop: false,
};

export default function App() {
  // 1. Initial State Initialization
  const [settings, setSettings] = useState<DictationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [savedLists, setSavedLists] = useState<SavedWordList[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_LISTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    const defaultPreset = PRESET_WORD_LISTS[0];
    return [{
      id: 'cet4-core',
      title: defaultPreset.name,
      rawText: defaultPreset.content,
      words: parseWordListText(defaultPreset.content),
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    }];
  });

  // Current active word list identity (独立词单ID)
  const [currentListId, setCurrentListId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_LIST_ID);
      if (saved) return saved;
    } catch (e) {
      // fallback
    }
    return 'cet4-core';
  });

  const [currentTitle, setCurrentTitle] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_TITLE);
      if (saved) return saved;
    } catch (e) {
      // fallback
    }
    return '大学英语四级核心词汇';
  });

  // Separate records dictionary by listId (不同词库不共享回顾与记录，各自独立保存前3次)
  const [recordsByList, setRecordsByList] = useState<Record<string, DictationRecord[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS_BY_LIST);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return {};
  });

  const [rawText, setRawText] = useState<string>(PRESET_WORD_LISTS[0].content);
  const [words, setWords] = useState<WordItem[]>(() => {
    try {
      const savedCurrent = localStorage.getItem(STORAGE_KEY_CURRENT_LIST);
      if (savedCurrent) {
        const parsed = JSON.parse(savedCurrent);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return parseWordListText(PRESET_WORD_LISTS[0].content);
  });

  // Starred-only filtering mode
  const [isStarredOnlyActive, setIsStarredOnlyActive] = useState(false);
  const [unfilteredWords, setUnfilteredWords] = useState<WordItem[]>([]);

  // 2. Playback State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRepetition, setCurrentRepetition] = useState(1);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean } | null>(null);

  // 3. Modals state
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSavedListsModalOpen, setIsSavedListsModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const isOnline = useOnlineStatus();

  // Refs for tracking async cancellation & timers
  const playbackAbortedRef = useRef(false);
  const stepIdRef = useRef(0);
  const intervalTimerRef = useRef<number | null>(null);
  const intervalStartRef = useRef<number | null>(null);
  const intervalRemainingMsRef = useRef<number | null>(null);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      // safe
    }
  }, [settings]);

  // Persist current words & list identity
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_LIST, JSON.stringify(words));
      localStorage.setItem(STORAGE_KEY_CURRENT_LIST_ID, currentListId);
      localStorage.setItem(STORAGE_KEY_CURRENT_TITLE, currentTitle);
    } catch (e) {
      // safe
    }
  }, [words, currentListId, currentTitle]);

  // Persist saved lists
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_LISTS, JSON.stringify(savedLists));
    } catch (e) {
      // safe
    }
  }, [savedLists]);

  // Persist records by list
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS_BY_LIST, JSON.stringify(recordsByList));
    } catch (e) {
      // safe
    }
  }, [recordsByList]);

  // Current list's independent records (only last 3 for this specific list)
  const currentListRecords = recordsByList[currentListId] || [];

  const clearExistingTimers = () => {
    if (intervalTimerRef.current !== null) {
      window.clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
    stopSpeech();
  };

  // Helper to save attempt record keeping only the last 3 records for THIS list
  const recordAttempt = useCallback(
    (completedWords: WordItem[]) => {
      const correct = completedWords.filter((w) => w.isCorrect === true).length;
      const tested = completedWords.filter((w) => w.isCorrect !== null && w.isCorrect !== undefined);
      const denominator = tested.length > 0 ? tested.length : completedWords.length;
      const accuracy = Math.round((correct / Math.max(1, denominator)) * 100);

      const newRecord: DictationRecord = {
        id: `rec-${currentListId}-${Date.now()}`,
        listTitle: currentTitle,
        timestamp: Date.now(),
        totalWords: completedWords.length,
        correctCount: correct,
        accuracy,
        items: completedWords.map((w) => ({
          word: w.word,
          meaning: w.meaning,
          phonetic: w.phonetic,
          userInput: w.userInput || '',
          isCorrect: w.isCorrect === true,
        })),
      };

      setRecordsByList((prev) => {
        const existing = prev[currentListId] || [];
        const updated = [...existing, newRecord].slice(-3);
        return {
          ...prev,
          [currentListId]: updated,
        };
      });
    },
    [currentListId, currentTitle]
  );

  // Helper to pronounce single word directly
  const speakCurrentWordOnce = useCallback(async (wordToSpeak: string) => {
    await speakWord(wordToSpeak, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      voiceURI: settings.voiceURI,
      voiceAccent: settings.voiceAccent || 'us',
    });
  }, [settings.speechRate, settings.speechPitch, settings.voiceURI, settings.voiceAccent]);

  // Core Play Loop Execution: Plays audio IMMEDIATELY, with step token to avoid collision on rapid skips
  const executeDictationStep = useCallback(
    async (index: number, repetition: number) => {
      const stepId = ++stepIdRef.current;
      clearExistingTimers();
      playbackAbortedRef.current = false;

      if (!words || words.length === 0 || index >= words.length) {
        setStatus('completed');
        recordAttempt(words);
        setIsSummaryModalOpen(true);
        return;
      }

      const activeWord = words[index];
      setStatus('playing');
      setCurrentIndex(index);
      setCurrentRepetition(repetition);
      setCountdownRemaining(null);

      // Play soft chime concurrently without blocking speech
      if (repetition === 1 && settings.enableChime) {
        playChime('cue');
      }

      // Speak the word immediately without delay
      await speakWord(activeWord.word, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        voiceURI: settings.voiceURI,
        voiceAccent: settings.voiceAccent || 'us',
      });

      // If a newer step was started while this was speaking, abort!
      if (stepIdRef.current !== stepId || playbackAbortedRef.current) return;

      // Check if more repetitions are needed for the same word
      if (repetition < settings.repeatCount) {
        // Short gap between repeat 1 and repeat 2
        await new Promise((r) => setTimeout(r, settings.repeatGapSeconds * 1000));
        if (stepIdRef.current !== stepId || playbackAbortedRef.current) return;
        executeDictationStep(index, repetition + 1);
        return;
      }

      // Word has finished all repetitions! NOW start the interval waiting countdown
      const nextIndex = index + 1;
      if (nextIndex >= words.length) {
        // Last word finished
        setStatus('completed');
        recordAttempt(words);
        setIsSummaryModalOpen(true);
        return;
      }

      // Start Countdown Timer for settings.intervalSeconds
      setStatus('waiting');
      const totalIntervalMs = settings.intervalSeconds * 1000;
      intervalRemainingMsRef.current = totalIntervalMs;
      intervalStartRef.current = Date.now();
      setCountdownRemaining(settings.intervalSeconds);

      intervalTimerRef.current = window.setInterval(() => {
        if (stepIdRef.current !== stepId || playbackAbortedRef.current) {
          clearExistingTimers();
          return;
        }

        const elapsed = Date.now() - (intervalStartRef.current || Date.now());
        const remaining = Math.max(0, (intervalRemainingMsRef.current || totalIntervalMs) - elapsed);
        setCountdownRemaining(remaining / 1000);

        if (remaining <= 0) {
          clearExistingTimers();
          executeDictationStep(nextIndex, 1);
        }
      }, 100);
    },
    [words, settings, recordAttempt]
  );

  // Play / Resume button handler: Always speaks the current word, then starts interval waiting!
  const handlePlay = useCallback(() => {
    if (words.length === 0) return;
    playbackAbortedRef.current = false;
    clearExistingTimers();
    // Replay current word's audio first, so user hears it upon resume
    executeDictationStep(currentIndex, 1);
  }, [words.length, executeDictationStep, currentIndex]);

  // Pause button handler
  const handlePause = useCallback(() => {
    playbackAbortedRef.current = true;
    clearExistingTimers();
    setStatus('paused');
  }, []);

  // Previous (后退) button handler: Immediately plays audio of previous word!
  const handlePrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    playbackAbortedRef.current = false;
    clearExistingTimers();
    const newIdx = currentIndex - 1;
    setCurrentIndex(newIdx);
    setCurrentRepetition(1);
    setCountdownRemaining(null);
    executeDictationStep(newIdx, 1);
  }, [currentIndex, executeDictationStep]);

  // Next (前进) button handler: Immediately plays audio of next word!
  const handleNext = useCallback(() => {
    if (currentIndex >= words.length - 1) return;
    playbackAbortedRef.current = false;
    clearExistingTimers();
    const newIdx = currentIndex + 1;
    setCurrentIndex(newIdx);
    setCurrentRepetition(1);
    setCountdownRemaining(null);
    executeDictationStep(newIdx, 1);
  }, [currentIndex, words.length, executeDictationStep]);

  // Replay current word
  const handleReplayCurrent = useCallback(() => {
    playbackAbortedRef.current = false;
    clearExistingTimers();
    setCountdownRemaining(null);
    executeDictationStep(currentIndex, 1);
  }, [currentIndex, executeDictationStep]);

  // Add extra time during interval waiting
  const handleAddIntervalTime = useCallback((extraSec: number) => {
    if (status === 'waiting' && countdownRemaining !== null) {
      const newRemaining = countdownRemaining + extraSec;
      setCountdownRemaining(newRemaining);
      intervalRemainingMsRef.current = newRemaining * 1000;
      intervalStartRef.current = Date.now();
    }
  }, [status, countdownRemaining]);

  // Jump to specific word in the list: Immediately plays audio of that word!
  const handleSelectWord = useCallback(
    (index: number) => {
      playbackAbortedRef.current = false;
      clearExistingTimers();
      setCurrentIndex(index);
      setCurrentRepetition(1);
      setCountdownRemaining(null);
      executeDictationStep(index, 1);
    },
    [executeDictationStep]
  );

  // Toggle Star / Bookmark on a word
  const handleToggleStar = useCallback((wordId: string) => {
    setWords((prev) =>
      prev.map((w) => (w.id === wordId ? { ...w, isStarred: !w.isStarred } : w))
    );
  }, []);

  // Validate typing and IMMEDIATELY advance to next word and play audio!
  const handleValidateAndAdvance = useCallback(
    (wordId: string, userInput: string) => {
      const wordIndex = words.findIndex((w) => w.id === wordId);
      if (wordIndex === -1) return;

      const currentItem = words[wordIndex];
      const cleanUser = userInput.trim().toLowerCase();
      const cleanWord = currentItem.word.trim().toLowerCase();
      const isMatch = cleanUser === cleanWord;

      // Update last result indicator
      setLastResult({ isCorrect: isMatch });

      // Play chime
      if (isMatch) {
        playChime('correct');
      } else {
        playChime('wrong');
      }

      // Update current word's validity and userInput
      const updatedWords = words.map((w, idx) =>
        idx === wordIndex
          ? {
              ...w,
              userInput,
              isCorrect: isMatch,
            }
          : w
      );
      setWords(updatedWords);

      // Stop current waiting countdown
      clearExistingTimers();

      // Immediately jump to next word and play audio!
      if (wordIndex < words.length - 1) {
        const nextIdx = wordIndex + 1;
        setCurrentIndex(nextIdx);
        setCurrentRepetition(1);
        setCountdownRemaining(null);

        // 立马播放下一个单词音频
        executeDictationStep(nextIdx, 1);
      } else {
        // Finished the last word!
        setStatus('completed');
        recordAttempt(updatedWords);
        setIsSummaryModalOpen(true);
      }
    },
    [words, executeDictationStep, recordAttempt]
  );

  // Repeat full dictation: resets user inputs and correctness for a fresh round
  const handleRestartAll = useCallback(() => {
    clearExistingTimers();
    const freshWords = words.map((w) => ({
      ...w,
      userInput: '',
      isCorrect: null,
    }));
    setWords(freshWords);
    setCurrentIndex(0);
    setCurrentRepetition(1);
    setStatus('idle');
    setCountdownRemaining(null);
    setLastResult(null);
    setTimeout(() => {
      executeDictationStep(0, 1);
    }, 120);
  }, [words, executeDictationStep]);

  // Repeat only mistake words from this round
  const handlePracticeMistakes = useCallback(
    (mistakeWords: WordItem[]) => {
      clearExistingTimers();
      const freshMistakes = mistakeWords.map((w) => ({
        ...w,
        userInput: '',
        isCorrect: null,
      }));
      setUnfilteredWords(words);
      setWords(freshMistakes);
      setIsStarredOnlyActive(true);
      setCurrentIndex(0);
      setCurrentRepetition(1);
      setStatus('idle');
      setCountdownRemaining(null);
      setLastResult(null);
      setTimeout(() => {
        executeDictationStep(0, 1);
      }, 120);
    },
    [words, executeDictationStep]
  );

  // Filter only starred words for focused practice
  const handleFilterStarredOnly = useCallback(() => {
    const starred = words.filter((w) => w.isStarred);
    if (starred.length === 0) return;
    setUnfilteredWords(words);
    setWords(starred);
    setIsStarredOnlyActive(true);
    setCurrentIndex(0);
    clearExistingTimers();
    setStatus('idle');
  }, [words]);

  const handleResetFilter = useCallback(() => {
    if (unfilteredWords.length > 0) {
      setWords(unfilteredWords);
    }
    setIsStarredOnlyActive(false);
    setCurrentIndex(0);
    clearExistingTimers();
    setStatus('idle');
  }, [unfilteredWords]);

  // Load new words from paste modal / preset with its unique listId
  const handleConfirmPaste = useCallback(
    (newWords: WordItem[], title: string, pastedRaw: string, listId?: string) => {
      clearExistingTimers();
      const effectiveListId = listId || `list-${Date.now()}`;
      setWords(newWords);
      setCurrentTitle(title);
      setCurrentListId(effectiveListId);
      setRawText(pastedRaw);
      setCurrentIndex(0);
      setCurrentRepetition(1);
      setStatus('idle');
      setCountdownRemaining(null);
      setIsStarredOnlyActive(false);
      setLastResult(null);

      // Save to savedLists if not already present
      setSavedLists((prev) => {
        const existingIdx = prev.findIndex((l) => l.id === effectiveListId || l.title === title);
        const newEntry: SavedWordList = {
          id: effectiveListId,
          title,
          rawText: pastedRaw,
          words: newWords,
          createdAt: Date.now(),
          lastUsedAt: Date.now(),
        };
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = newEntry;
          return updated;
        }
        return [newEntry, ...prev];
      });
    },
    []
  );

  // Shuffle toggle
  const handleToggleShuffle = useCallback(() => {
    const nextShuffle = !settings.shuffleOrder;
    setSettings((prev) => ({ ...prev, shuffleOrder: nextShuffle }));

    if (nextShuffle) {
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setWords(shuffled);
      setCurrentIndex(0);
      clearExistingTimers();
      setStatus('idle');
    }
  }, [settings.shuffleOrder, words]);

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'playing' || status === 'waiting') {
          handlePause();
        } else {
          handlePlay();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReplayCurrent();
      } else if (e.code === 'KeyH') {
        e.preventDefault();
        setSettings((prev) => ({ ...prev, isBlindMode: !prev.isBlindMode }));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setSettings((prev) => ({ ...prev, intervalSeconds: Math.min(60, prev.intervalSeconds + 1) }));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setSettings((prev) => ({ ...prev, intervalSeconds: Math.max(1, prev.intervalSeconds - 1) }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handlePause, handlePlay, handlePrevious, handleNext, handleReplayCurrent]);

  const currentWord = words[currentIndex] || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar with Top Bar Contract */}
      <Navbar
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onOpenSavedListsModal={() => setIsSavedListsModalOpen(true)}
        onOpenReviewModal={() => setIsSummaryModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isBlindMode={settings.isBlindMode}
        onToggleBlindMode={() => setSettings({ ...settings, isBlindMode: !settings.isBlindMode })}
        wordCount={words.length}
        recordsCount={currentListRecords.length}
      />

      {/* Offline banner if network is disconnected */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>离线模式：已缓存单词与发音，可继续无网听写，全部数据保存在本地。</span>
        </div>
      )}

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Title & Quick Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/70 p-4 rounded-2xl border border-slate-200/60 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {currentTitle}
              </h2>
              {isStarredOnlyActive && (
                <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  专注错词/生词模式
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              共 {words.length} 个单词 · 间隔 {settings.intervalSeconds} 秒 · 朗读 {settings.repeatCount} 遍 ·{' '}
              {settings.isBlindMode ? '盲听听写中' : '单词显示中'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/60 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              title="独立网页使用 / 保存到桌面 / 手机主屏幕"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>独立网页/保存</span>
            </button>
            <button
              onClick={() => setIsSummaryModalOpen(true)}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>听写回顾</span>
              {currentListRecords.length > 0 && (
                <span className="font-mono text-[11px] bg-slate-200 text-slate-700 px-1.5 rounded">
                  {currentListRecords.length}次记录
                </span>
              )}
            </button>
            <button
              onClick={() => setIsPasteModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              更换/粘贴单词
            </button>
          </div>
        </div>

        {/* Two-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Center: Interactive Stage and Controls (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Main Word Display Card */}
            <WordDisplayCard
              currentWord={currentWord}
              currentIndex={currentIndex}
              totalWords={words.length}
              status={status}
              currentRepetition={currentRepetition}
              totalRepetitions={settings.repeatCount}
              countdownRemaining={countdownRemaining}
              intervalDuration={settings.intervalSeconds}
              isBlindMode={settings.isBlindMode}
              onToggleBlindMode={() => setSettings({ ...settings, isBlindMode: !settings.isBlindMode })}
              onToggleStar={handleToggleStar}
              onReplayCurrent={handleReplayCurrent}
              interactiveTyping={settings.interactiveTyping}
              onValidateAndAdvance={handleValidateAndAdvance}
              lastResult={lastResult}
            />

            {/* 2. Ergonomic Playback Controls with customizable intervals, step back and forward */}
            <PlayerControls
              status={status}
              currentIndex={currentIndex}
              totalWords={words.length}
              intervalSeconds={settings.intervalSeconds}
              onChangeInterval={(sec) => setSettings({ ...settings, intervalSeconds: sec })}
              repeatCount={settings.repeatCount}
              onChangeRepeatCount={(count) => setSettings({ ...settings, repeatCount: count })}
              shuffleOrder={settings.shuffleOrder}
              onToggleShuffle={handleToggleShuffle}
              onPlay={handlePlay}
              onPause={handlePause}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onReplayCurrent={handleReplayCurrent}
              onAddIntervalTime={handleAddIntervalTime}
              countdownRemaining={countdownRemaining}
            />
          </div>

          {/* Right / Secondary: Word List View (5 cols on lg) */}
          <div className="lg:col-span-5 h-[620px]">
            <WordListView
              words={words}
              currentIndex={currentIndex}
              onSelectWord={handleSelectWord}
              onToggleStar={handleToggleStar}
              onSpeakWordSingle={speakCurrentWordOnce}
              onFilterStarredOnly={handleFilterStarredOnly}
              isStarredOnlyActive={isStarredOnlyActive}
              onResetFilter={handleResetFilter}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <WordInputModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onConfirm={handleConfirmPaste}
        initialText={rawText}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
      />

      <SavedListsModal
        isOpen={isSavedListsModalOpen}
        onClose={() => setIsSavedListsModalOpen(false)}
        savedLists={savedLists}
        onLoadList={(list) => {
          handleConfirmPaste(list.words, list.title, list.rawText, list.id);
        }}
        onDeleteList={(id) => {
          setSavedLists((prev) => prev.filter((l) => l.id !== id));
          // Clean up records for deleted list
          setRecordsByList((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        words={words}
        records={currentListRecords}
        onRestartAll={handleRestartAll}
        onPracticeMistakes={handlePracticeMistakes}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
        settings={settings}
      />

      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
