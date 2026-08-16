import { createContext, useCallback, useContext, useState } from "react";
import { FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  // type: "success" | "error" | "info"
  const showToast = useCallback(
    (message, type = "success") => {
      const id = ++idCounter;

      setToasts((previous) => [...previous, { id, message, type }]);

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast]
  );

  const icons = {
    success: <FiCheckCircle size={18} />,
    error: <FiXCircle size={18} />,
    info: <FiInfo size={18} />,
  };

  const styles = {
    success: "bg-black text-white",
    error: "bg-red-600 text-white",
    info: "bg-gray-800 text-white",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast stack - fixed top-right corner */}
      <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition ${styles[toast.type]}`}
          >
            {icons[toast.type]}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};
