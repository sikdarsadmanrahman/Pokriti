import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const ToastCtx = createContext(null);

/** Lightweight global toast (success/error) — good enough for "Added to cart" / API-error feedback. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastCtx.Provider value={{ success: (m) => push(m, 'success'), error: (m) => push(m, 'error') }}>
      {children}
      <div className="fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto sm:translate-x-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-fade-in flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              t.type === 'success' ? 'bg-brand-700 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {t.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <XCircle size={18} className="shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
