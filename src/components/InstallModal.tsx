import React, { useState } from 'react';
import { X, Globe, Download, Copy, Check, ExternalLink, Smartphone, Monitor, Bookmark, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // ignore
    }
  };

  const handleOpenNewTab = () => {
    window.open(currentUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                独立网页与桌面/手机使用方式
              </h3>
              <p className="text-xs text-slate-500">
                无需打开 AI 对话界面，随时随地直接听写
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Method 1: Direct Web Page URL */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
                <Bookmark className="w-4 h-4 text-indigo-600" />
                <span>方式一：直接作为独立网页使用（推荐收藏）</span>
              </div>
            </div>
            <p className="text-xs text-indigo-700 leading-relaxed">
              这是您的专属永久网页地址。您可以将它<strong>加入浏览器书签栏（按 Ctrl+D 或 Mac Cmd+D）</strong>，以后在电脑或手机上直接点击书签就能使用！
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-indigo-200 rounded-lg text-slate-700 select-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition shadow-sm shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制！' : '复制网址'}</span>
              </button>
              <button
                onClick={handleOpenNewTab}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-xs font-medium hover:bg-indigo-50 transition shrink-0"
                title="在浏览器纯净新标签页中打开"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>新窗口打开</span>
              </button>
            </div>
          </div>

          {/* Method 2: Install as Desktop or Mobile App (PWA) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Download className="w-4 h-4 text-indigo-600" />
                <span>方式二：安装到桌面 / 手机主屏幕（像App一样）</span>
              </div>
              {isInstalled && (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  当前已安装
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              支持一键安装为独立桌面/手机客户端，无浏览器地址栏，桌面点开秒进，体验更纯粹专注。
            </p>

            {/* Direct Install Button if supported */}
            {isInstallable && !isInstalled && (
              <div className="pt-1">
                <button
                  onClick={async () => {
                    await install();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 text-white font-medium text-sm rounded-xl hover:bg-emerald-700 shadow-sm transition active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  <span>立即安装到电脑桌面 / 移动设备</span>
                </button>
              </div>
            )}

            {/* Platform Guides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              {/* PC Chrome / Edge */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                  <span>电脑 Chrome / Edge 浏览器</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  在浏览器地址栏最右侧，点击<strong>【安装 WordDictate】</strong>或<strong>【...】➔【应用】➔【将此站点作为应用安装】</strong>即可生成桌面图标。
                </p>
              </div>

              {/* iPhone / Safari */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>iPhone / iPad (Safari)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  在 Safari 中打开本网址，点击底部中间<strong>【分享】图标</strong>（带箭头的方框），下滑选择<strong>【添加到主屏幕】</strong>即可生成手机 App！
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Storage Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>数据完全同步保存在本地：</strong> 您在网页中粘贴的所有词库、自定设置以及前3次听写记录，都会安全保留在您浏览器的存储空间中，即使离线断网也能继续使用！
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            随时可在顶部导航栏点击「独立网页」查看
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
