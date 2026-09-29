import React from 'react';

export default function Toast({ show, title, message, icon = 'check_circle', onClose, type = 'success' }) {
  if (!show) return null;

  const typeStyles = {
    success: 'bg-surface-container-lowest border-emerald-500/40 text-emerald-800',
    info: 'bg-surface-container-lowest border-secondary/40 text-primary',
    warning: 'bg-surface-container-lowest border-amber-500/40 text-amber-900',
    error: 'bg-surface-container-lowest border-error/40 text-error',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[120] max-w-md animate-bounce-short">
      <div className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 ${typeStyles[type] || typeStyles.success}`}>
        <span className="material-symbols-outlined text-[24px] text-secondary shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          {title && <h5 className="font-label-lg font-semibold text-on-surface text-sm">{title}</h5>}
          <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>
    </div>
  );
}
