import React from 'react';
import { Volume2, Plus, Settings, HelpCircle, FolderOpen, Eye, EyeOff, Trophy, Globe } from 'lucide-react';

interface NavbarProps {
  onOpenPasteModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenShortcutsModal: () => void;
  onOpenSavedListsModal: () => void;
  onOpenReviewModal: () => void;
  onOpenInstallModal: () => void;
  isBlindMode: boolean;
  onToggleBlindMode: () => void;
  wordCount: number;
  recordsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPasteModal,
  onOpenSettingsModal,
  onOpenShortcutsModal,
  onOpenSavedListsModal,
  onOpenReviewModal,
  onOpenInstallModal,
  isBlindMode,
  onToggleBlindMode,
  wordCount,
  recordsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              WordDictate
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-normal">
              单词听写助手
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation / Quick Mode switches */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Toggle blind mode */}
          <button
            onClick={onToggleBlindMode}
            title={isBlindMode ? '当前为盲听模式（单词隐藏），点击显示' : '当前为公开模式，点击切换为听写盲听模式'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              isBlindMode
                ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {isBlindMode ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isBlindMode ? '盲听听写中' : '单词显示'}</span>
          </button>

          {/* Saved lists */}
          <button
            onClick={onOpenSavedListsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
            title="词库管理"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">词库</span>
            {wordCount > 0 && (
              <span className="text-[11px] text-slate-400 font-mono">({wordCount})</span>
            )}
          </button>

          {/* Keyboard shortcuts */}
          <button
            onClick={onOpenShortcutsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
            title="快捷键指南"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">快捷键</span>
          </button>

          {/* Review & History */}
          <button
            onClick={onOpenReviewModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
            title="查看听写回顾与前3次成绩"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">回顾</span>
            {recordsCount > 0 && (
              <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 rounded font-mono font-bold">
                {recordsCount}
              </span>
            )}
          </button>

          {/* Voice & Sound settings */}
          <button
            onClick={onOpenSettingsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
            title="发音与语速设置"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">设置</span>
          </button>

          {/* Standalone Web / Install App */}
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-colors whitespace-nowrap"
            title="独立网页使用与桌面/手机APP安装指南"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold">独立网页</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={onOpenPasteModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-200 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>粘贴单词</span>
          </button>
        </div>
      </div>
    </header>
  );
};
