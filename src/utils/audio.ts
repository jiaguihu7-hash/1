let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (err) {
    console.warn('AudioContext not supported or blocked:', err);
  }
  return audioCtx;
}

/**
 * Play a pleasant soft cue chime before reading a word
 */
export function playChime(type: 'cue' | 'correct' | 'wrong' = 'cue'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'cue') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.12); // G5
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.15); // C4
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.warn('Could not play chime:', e);
  }
}

/**
 * Fetch available synthesis voices
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      resolve(voices);
      return;
    }

    const onVoicesChanged = () => {
      voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = null;
      resolve(voices);
    };

    window.speechSynthesis.onvoiceschanged = onVoicesChanged;

    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 400);
  });
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  voiceAccent?: 'us' | 'uk' | 'system';
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

let activeAudio: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let currentPlayId = 0;

export function stopSpeech(): void {
  currentPlayId++;

  // Stop HTMLAudioElement
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.removeAttribute('src');
      activeAudio.load();
    } catch (e) {
      // safe
    }
    activeAudio = null;
  }

  // Stop SpeechSynthesis
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      // safe
    }
  }
  activeUtterance = null;
}

/**
 * High-reliability word pronunciation engine:
 * 1. Primary: Uses dictionary authentic native studio audio (US type=2 / UK type=1)
 *    - Never locks or freezes in Chrome
 *    - Studio-quality human pronunciation
 *    - Instant cutoff and responsive skipping
 * 2. Fallback: Uses Web Speech API if offline or for Chinese text
 */
export function speakWord(text: string, options: SpeakOptions = {}): Promise<void> {
  const playId = ++currentPlayId;

  return new Promise((resolve) => {
    stopSpeech();

    // Clean word: remove phonetic brackets, punctuation
    const cleanText = text.replace(/[\/\[\]\(\)\.,!?;:'"“”‘’]/g, '').trim();
    if (!cleanText) {
      resolve();
      return;
    }

    const isChinese = /[\u4e00-\u9fa5]/.test(cleanText);
    const useSystemTTS = options.voiceAccent === 'system' || isChinese;

    // Finish handler
    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        if (activeAudio && activeAudio === audio) {
          activeAudio = null;
        }
        options.onEnd?.();
        resolve();
      }
    };

    // If configured for system TTS or if it contains Chinese
    if (useSystemTTS) {
      speakViaSpeechSynthesis(cleanText, options, playId).then(finish);
      return;
    }

    // High quality human pronunciation from dictionary CDN
    const audioType = options.voiceAccent === 'uk' ? '1' : '2';
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=${audioType}`;
    const audio = new Audio();

    audio.playbackRate = Math.min(2.0, Math.max(0.5, options.rate ?? 1.0));
    activeAudio = audio;

    audio.onplay = () => {
      if (playId === currentPlayId) {
        options.onStart?.();
      }
    };

    audio.onended = () => {
      finish();
    };

    audio.onerror = () => {
      // Automatic seamless fallback to SpeechSynthesis if network issue
      if (playId === currentPlayId) {
        speakViaSpeechSynthesis(cleanText, options, playId).then(finish);
      } else {
        finish();
      }
    };

    // Safety timeout: max 4 seconds
    setTimeout(() => {
      if (!finished && currentPlayId === playId) {
        finish();
      }
    }, 4500);

    audio.src = audioUrl;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policy or error, fallback to SpeechSynthesis
        if (playId === currentPlayId) {
          speakViaSpeechSynthesis(cleanText, options, playId).then(finish);
        } else {
          finish();
        }
      });
    }
  });
}

/**
 * Fallback SpeechSynthesis execution
 */
function speakViaSpeechSynthesis(cleanText: string, options: SpeakOptions, playId: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      // safe
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = options.pitch ?? 1.0;

    const isChinese = /[\u4e00-\u9fa5]/.test(cleanText);
    utterance.lang = options.lang || (isChinese ? 'zh-CN' : 'en-US');

    const voices = window.speechSynthesis.getVoices();
    if (options.voiceURI) {
      const selected = voices.find((v) => v.voiceURI === options.voiceURI);
      if (selected) utterance.voice = selected;
    } else {
      const best = voices.find(
        (v) =>
          isChinese
            ? v.lang.startsWith('zh')
            : v.lang.startsWith('en') &&
              (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.default)
      ) || voices.find((v) => (isChinese ? v.lang.startsWith('zh') : v.lang.startsWith('en')));

      if (best) utterance.voice = best;
    }

    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        activeUtterance = null;
        resolve();
      }
    };

    utterance.onstart = () => {
      if (playId === currentPlayId) {
        options.onStart?.();
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    activeUtterance = utterance;

    // Safety timeout
    setTimeout(() => {
      if (!settled) finish();
    }, 4000);

    try {
      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      finish();
    }
  });
}
