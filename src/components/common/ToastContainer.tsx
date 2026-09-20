import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      id="lifeops-toast-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-[#c5a059] flex-shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-[#c5a059] flex-shrink-0" />,
          info: <Info className="w-4 h-4 text-[#7a7a7a] flex-shrink-0" />,
        };

        const borderStyles = {
          success: 'border-[#c5a059]/40 bg-[#080808] text-white',
          error: 'border-rose-900/50 bg-[#080808] text-white',
          warning: 'border-[#c5a059]/30 bg-[#080808] text-white',
          info: 'border-[#1a1a1a] bg-[#080808] text-white',
        };

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-sm border ${
              borderStyles[toast.type]
            } shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-serif tracking-wide text-white truncate">{toast.title}</h5>
              {toast.message && <p className="text-[11px] text-[#7a7a7a] font-light mt-0.5">{toast.message}</p>}
            </div>
            <button
              id={`toast-close-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="text-[#555] hover:text-white p-0.5 rounded-sm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
