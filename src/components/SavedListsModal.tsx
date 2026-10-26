import React from 'react';
import { X, FolderOpen, Trash2, ArrowRight, Plus } from 'lucide-react';
import { SavedWordList } from '../types';

interface SavedListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedLists: SavedWordList[];
  onLoadList: (list: SavedWordList) => void;
  onDeleteList: (id: string) => void;
  onOpenPasteModal: () => void;
}

export const SavedListsModal: React.FC<SavedListsModalProps> = ({
  isOpen,
  onClose,
  savedLists,
  onLoadList,
  onDeleteList,
  onOpenPasteModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">历史与保存的词单</h2>
              <p className="text-xs text-slate-500">随时切换不同的听写测试列表</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {savedLists.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-xs text-slate-500">暂无保存的自定义词单</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPasteModal();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>立即粘贴录入新词单</span>
              </button>
            </div>
          ) : (
            savedLists.map((list) => (
              <div
                key={list.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{list.title}</h4>
                    <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0">
                      {list.words.length} 词
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    保存于 {new Date(list.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadList(list);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
                  >
                    <span>载入</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteList(list.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="删除此词单"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPasteModal();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加新词单</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
