import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Trash2, ArrowRight, Check } from 'lucide-react';
import { PRESET_WORD_LISTS, PresetList } from '../data/presets';
import { parseWordListText } from '../utils/parser';
import { WordItem } from '../types';

interface WordInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (words: WordItem[], title: string, rawText: string, listId?: string) => void;
  initialText?: string;
}

export const WordInputModal: React.FC<WordInputModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialText = '',
}) => {
  const [text, setText] = useState(initialText);
  const [title, setTitle] = useState('自定义词单');
  const [listId, setListId] = useState<string>('custom-list-' + Date.now());
  const [activeTab, setActiveTab] = useState<'paste' | 'presets'>('paste');

  if (!isOpen) return null;

  const parsedWords = parseWordListText(text);

  const handleSelectPreset = (preset: PresetList) => {
    setText(preset.content);
    setTitle(preset.name);
    setListId(preset.id);
    setActiveTab('paste');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedWords.length === 0) return;
    const effectiveId = listId || `custom-list-${Date.now()}`;
    onConfirm(parsedWords, title.trim() || '未命名词单', text, effectiveId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">导入听写单词</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              粘贴你的单词文本，或选用精品词汇库
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>自由粘贴录入</span>
            {parsedWords.length > 0 && (
              <span className="font-mono text-[11px] bg-indigo-200/70 text-indigo-800 px-1.5 rounded">
                {parsedWords.length} 词
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>选用官方精品词库</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'paste' ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">词单名称</label>
                  <span className="text-[11px] text-slate-400">将保存在本地词库中</span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="如：Unit 1 核心词听写"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">粘贴单词文本</label>
                  {text && (
                    <button
                      type="button"
                      onClick={() => setText('')}
                      className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>清空</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`支持多种常见格式，例如：
1. 每行一个单词：
apple
banana
orange

2. 包含音标与中文解释（自动提取英文朗读）：
abandon /ə'bændən/ v. 放弃
ability n. 能力

3. 逗号或编号分隔：
1. computer, 2. keyboard, 3. monitor`}
                  className="w-full p-3 text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 resize-y"
                />
              </div>

              {/* Parsing status bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    识别到 <strong className="font-bold text-slate-900 font-mono text-sm">{parsedWords.length}</strong> 个单词
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  💡 朗读时会自动过滤音标与中文，只纯正发音英文词汇
                </div>
              </div>

              {/* Preview of first 5 items if available */}
              {parsedWords.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100/70 px-3 py-1.5 font-medium text-slate-600 border-b border-slate-200 flex items-center justify-between">
                    <span>解析预览 (前 {Math.min(parsedWords.length, 4)} 词)</span>
                    <span className="text-[11px] text-slate-400">共 {parsedWords.length} 个单词</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto bg-white">
                    {parsedWords.slice(0, 4).map((w, idx) => (
                      <div key={w.id} className="px-3 py-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 text-[11px] w-5">{idx + 1}.</span>
                          <span className="font-semibold text-slate-900">{w.word}</span>
                          {w.phonetic && <span className="text-slate-400 font-mono">{w.phonetic}</span>}
                        </div>
                        {w.meaning && (
                          <span className="text-slate-500 truncate max-w-[200px]">{w.meaning}</span>
                        )}
                      </div>
                    ))}
                    {parsedWords.length > 4 && (
                      <div className="px-3 py-1 text-center text-slate-400 text-[11px] bg-slate-50/50">
                        ... 其余 {parsedWords.length - 4} 个单词将在听写列表中展示
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                点击下列预设词汇库即可一键加载开始听写练习：
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_WORD_LISTS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {preset.category}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {preset.count} 词
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {preset.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      <span>载入该词库</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
            disabled={parsedWords.length === 0}
            onClick={handleSubmit}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shadow-indigo-200 flex items-center gap-1.5"
          >
            <span>开始听写 ({parsedWords.length} 词)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
