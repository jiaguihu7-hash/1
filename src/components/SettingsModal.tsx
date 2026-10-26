import React, { useState, useEffect } from 'react';
import { X, Volume2, Bell, Sparkles, Check, Play } from 'lucide-react';
import { DictationSettings } from '../types';
import { getAvailableVoices, speakWord, playChime } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DictationSettings;
  onUpdateSettings: (settings: DictationSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [localSettings, setLocalSettings] = useState<DictationSettings>(settings);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      getAvailableVoices().then((v) => {
        setVoices(v);
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleTestVoice = async () => {
    setIsTestingVoice(true);
    if (localSettings.enableChime) {
      playChime('cue');
      await new Promise(r => setTimeout(r, 220));
    }
    await speakWord('WordDictate, listen and spell.', {
      rate: localSettings.speechRate,
      pitch: localSettings.speechPitch,
      voiceURI: localSettings.voiceURI,
      voiceAccent: localSettings.voiceAccent || 'us',
    });
    setIsTestingVoice(false);
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  // Group English and other voices
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));
  const otherVoices = voices.filter(v => !v.lang.startsWith('en'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">听写与发音设置</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              自定义朗读语音库、语速、提示音与打字模式
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 1. Pronunciation Engine & Accent Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">朗读发音音源 (Pronunciation Source)</label>
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 active:scale-95 transition-all"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isTestingVoice ? '测试朗读中...' : '试听当前音效'}</span>
              </button>
            </div>

            {/* Accent Segmented Control */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, voiceAccent: 'us' })}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all text-center ${
                  localSettings.voiceAccent === 'us' || !localSettings.voiceAccent
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇺🇸 美式真人原声 (推荐)
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, voiceAccent: 'uk' })}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all text-center ${
                  localSettings.voiceAccent === 'uk'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇬🇧 英式真人原声
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, voiceAccent: 'system' })}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all text-center ${
                  localSettings.voiceAccent === 'system'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🤖 系统内置合成
              </button>
            </div>

            {localSettings.voiceAccent === 'system' && (
              <select
                value={localSettings.voiceURI}
                onChange={(e) => setLocalSettings({ ...localSettings, voiceURI: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 mt-2"
              >
                <option value="">系统默认语音</option>
                {englishVoices.length > 0 && (
                  <optgroup label="--- 英语发音人 (English Voices) ---">
                    {englishVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                )}
                {otherVoices.length > 0 && (
                  <optgroup label="--- 其他语言发音人 ---">
                    {otherVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            )}
          </div>

          {/* 2. Speech Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">朗读语速</label>
              <span className="text-xs font-mono font-semibold text-indigo-600 tabular-nums">
                {localSettings.speechRate.toFixed(2)}x
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">慢 (0.7x)</span>
              <input
                type="range"
                min={0.6}
                max={1.4}
                step={0.05}
                value={localSettings.speechRate}
                onChange={(e) => setLocalSettings({ ...localSettings, speechRate: parseFloat(e.target.value) })}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-xs text-slate-400">快 (1.4x)</span>
            </div>
          </div>

          {/* 3. Toggles */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            {/* Chime Bell */}
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">每个单词前播放提示音</div>
                  <div className="text-[11px] text-slate-500">朗读前发出温和清脆叮咚声，提醒做好听写准备</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.enableChime}
                onChange={(e) => setLocalSettings({ ...localSettings, enableChime: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </label>

            {/* Blind Mode */}
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">盲听模式（默认隐藏单词）</div>
                  <div className="text-[11px] text-slate-500">听写时隐藏屏幕单词避免偷看，可随时点击显示答案</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.isBlindMode}
                onChange={(e) => setLocalSettings({ ...localSettings, isBlindMode: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </label>

            {/* Interactive Typing Mode */}
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">在屏幕上打字听写核对</div>
                  <div className="text-[11px] text-slate-500">提供实时输入框，听音打字自动比对拼写对错</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.interactiveTyping}
                onChange={(e) => setLocalSettings({ ...localSettings, interactiveTyping: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-200"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};
