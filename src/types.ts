export interface WordItem {
  id: string;
  word: string;
  meaning?: string;
  phonetic?: string;
  isStarred?: boolean;
  userInput?: string;
  isCorrect?: boolean | null;
}

export interface DictationSettings {
  intervalSeconds: number;     // Pause duration between words (e.g. 5s)
  repeatCount: number;         // Times to read each word (1, 2, or 3)
  repeatGapSeconds: number;    // Short pause between repetitions of the same word (e.g. 1.2s)
  speechRate: number;          // 0.6 to 1.4
  speechPitch: number;         // 0.8 to 1.2
  voiceURI: string;            // Selected speech synthesis voice URI
  voiceAccent: 'us' | 'uk' | 'system'; // 'us' = 美式真人原声, 'uk' = 英式真人原声, 'system' = 系统合成
  enableChime: boolean;        // Play soft chime before reading
  isBlindMode: boolean;        // Hide the current and future words during dictation
  interactiveTyping: boolean;  // Show typing input box to spell while listening
  shuffleOrder: boolean;       // Randomize playback order
  autoLoop: boolean;           // Loop through list when done
}

export interface SavedWordList {
  id: string;
  title: string;
  rawText: string;
  words: WordItem[];
  createdAt: number;
  lastUsedAt: number;
}

export interface DictationRecord {
  id: string;
  listTitle: string;
  timestamp: number;
  totalWords: number;
  correctCount: number;
  accuracy: number;
  items: {
    word: string;
    meaning?: string;
    phonetic?: string;
    userInput: string;
    isCorrect: boolean;
  }[];
}

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'waiting' | 'completed';
