import { WordItem } from '../types';

/**
 * Intelligently parse raw pasted text into WordItem objects.
 * Handles:
 * - Line-by-line words
 * - Numbered lists (1. apple, 1、apple, [1] apple)
 * - Phonetic symbols (/.../ or [...])
 * - Chinese / English definitions separated by space, tab, hyphen, colon, or parentheses
 * - Comma or semicolon separated words
 */
export function parseWordListText(rawText: string): WordItem[] {
  if (!rawText || !rawText.trim()) return [];

  // Split lines
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items: WordItem[] = [];

  for (const line of lines) {
    // If the line has multiple items separated by comma, semicolon or tabs without definitions
    // But check if it's a comma-separated list of words
    if (line.includes(',') && !line.includes('，') && !/[a-zA-Z]+\s*[-–—:]\s*[^\s,]/.test(line)) {
      const parts = line.split(/[,;]+/).map(p => p.trim()).filter(Boolean);
      for (const part of parts) {
        const parsed = parseSingleEntry(part);
        if (parsed) items.push(parsed);
      }
    } else {
      const parsed = parseSingleEntry(line);
      if (parsed) items.push(parsed);
    }
  }

  return items;
}

function parseSingleEntry(entry: string): WordItem | null {
  let cleaned = entry.trim();
  if (!cleaned) return null;

  // 1. Remove leading numbering e.g. "1.", "1、", "[1]", "(1)", "1 - "
  cleaned = cleaned.replace(/^(\d+[\.、\-\)\s]+|\[\d+\]\s*|\(\d+\)\s*)/, '').trim();
  if (!cleaned) return null;

  // 2. Extract phonetic symbol if present, e.g. /ə'bændən/ or [ə'bændən]
  let phonetic = '';
  const phoneticMatch = cleaned.match(/(\/[^\/\n\r]+\/|\[[^\x00-\x7F\s\[\]]*[a-zA-Zəɪʊʌɒæeɜːθðʃʒŋ]+[^\s\[\]]*\])/);
  if (phoneticMatch) {
    phonetic = phoneticMatch[1];
    cleaned = cleaned.replace(phoneticMatch[0], ' ').trim();
  }

  // 3. Check for separator between word and meaning (e.g. " - ", " : ", "：", "\t", or space before Chinese / pos like v. n. adj.)
  let word = '';
  let meaning = '';

  const delimiterMatch = cleaned.match(/\s*(?:[-–—:]|：|\t)\s*/);
  if (delimiterMatch && delimiterMatch.index !== undefined) {
    const left = cleaned.slice(0, delimiterMatch.index).trim();
    const right = cleaned.slice(delimiterMatch.index + delimiterMatch[0].length).trim();
    if (left) {
      word = left;
      meaning = right;
    }
  }

  if (!word) {
    // Check if word contains Chinese characters representing the meaning
    const firstChineseCharIdx = cleaned.search(/[\u4e00-\u9fa5]/);
    if (firstChineseCharIdx > 0) {
      word = cleaned.slice(0, firstChineseCharIdx).trim();
      meaning = cleaned.slice(firstChineseCharIdx).trim();
    } else {
      // Check for part-of-speech abbreviations like " n. ", " v. ", " adj. ", " vt. ", " vi. "
      const posMatch = cleaned.match(/\s+(n|v|adj|adv|prep|conj|pron|art|num|vi|vt)\.\s*/i);
      if (posMatch && posMatch.index !== undefined) {
        word = cleaned.slice(0, posMatch.index).trim();
        meaning = cleaned.slice(posMatch.index).trim();
      } else {
        word = cleaned;
      }
    }
  }

  // Final trim and punctuation cleanup
  word = word.replace(/^["'`“”‘’]+|["'`“”‘’]+$/g, '').trim();
  if (!word) return null;

  return {
    id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    word,
    phonetic: phonetic || undefined,
    meaning: meaning || undefined,
    isStarred: false,
    userInput: '',
    isCorrect: null,
  };
}

/**
 * Format word items back into clean text for export / editing
 */
export function formatWordsToText(words: WordItem[]): string {
  return words.map((w, idx) => {
    let line = `${idx + 1}. ${w.word}`;
    if (w.phonetic) line += ` ${w.phonetic}`;
    if (w.meaning) line += ` - ${w.meaning}`;
    return line;
  }).join('\n');
}
