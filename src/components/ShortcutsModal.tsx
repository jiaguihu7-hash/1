import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space (空格键)', desc: '开始播放 / 暂停听写' },
    { key: '← (方向左键)', desc: '后退到上一个单词' },
    { key: '→ (方向右键)', desc: '前进到下一个单词' },
    { key: 'R 键', desc: '重新朗读当前单词' },
    { key: 'H 键', desc: '快速切换 盲听/显示单词' },
    { key: '↑ / ↓ (方向上下键)', desc: '快速增加/减少 1 秒听写间隔时间' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">键盘快捷键操作</h2>
              <p className="text-xs text-slate-500">听写时手无需离开键盘</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0 text-xs"
            >
              <span className="text-slate-600">{s.desc}</span>
              <kbd className="px-2.5 py-1 bg-slate-100 text-slate-800 font-mono font-semibold rounded-lg border border-slate-200 shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};
