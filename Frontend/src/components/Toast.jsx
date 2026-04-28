import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = (message, type = "info", ttl = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((s) => [...s, { id, message, type }]);
    setTimeout(() => setToasts((s) => s.filter(t => t.id !== id)), ttl);
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-6 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow-sm max-w-sm text-sm ${
              t.type === "success" ? "bg-green-50 text-green-800" :
              t.type === "error" ? "bg-red-50 text-red-800" :
              "bg-indigo-50 text-indigo-800"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
