import { useState, createContext, useContext } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext();

export const useToast = () => {
    return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message, duration = 3000, onConfirm, onCancel) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message, duration, onConfirm, onCancel }]);

        if (type !== "confirm") {
            setTimeout(() => removeToast(id), duration);
        }
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {createPortal(
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 space-y-4 z-50 w-full max-w-md px-4">
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            {...toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

const Toast = ({ id, type, message, duration, onConfirm, onCancel, onClose }) => {
    // Configuration pour chaque type de toast
    const toastConfig = {
        success: {
            gradient: "from-green-500 to-emerald-600",
            darkGradient: "dark:from-green-600 dark:to-emerald-700",
            hoverGradient: "hover:from-green-600 hover:to-emerald-700",
            darkHoverGradient: "dark:hover:from-green-700 dark:hover:to-emerald-800",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        error: {
            gradient: "from-red-500 to-pink-600",
            darkGradient: "dark:from-red-600 dark:to-pink-700",
            hoverGradient: "hover:from-red-600 hover:to-pink-700",
            darkHoverGradient: "dark:hover:from-red-700 dark:hover:to-pink-800",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        confirm: {
            gradient: "from-blue-500 to-indigo-600",
            darkGradient: "dark:from-blue-600 dark:to-indigo-700",
            hoverGradient: "hover:from-blue-600 hover:to-indigo-700",
            darkHoverGradient: "dark:hover:from-blue-700 dark:hover:to-indigo-800",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        info: {
            gradient: "from-cyan-500 to-blue-600",
            darkGradient: "dark:from-cyan-600 dark:to-blue-700",
            hoverGradient: "hover:from-cyan-600 hover:to-blue-700",
            darkHoverGradient: "dark:hover:from-cyan-700 dark:hover:to-blue-800",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    };

    // Obtenir la configuration pour ce type de toast
    const config = toastConfig[type] || toastConfig.info;

    return (
        <div 
            className={`bg-gradient-to-r ${config.gradient} ${config.darkGradient} rounded-xl shadow-lg overflow-hidden transition-all transform duration-300 animate-slideUp`}
        >
            <div className="flex items-center p-4 text-white">
                <div className="flex-shrink-0 mr-3">
                    {config.icon}
                </div>
                <div className="flex-grow">
                    <p className="font-medium">{message}</p>
                </div>
                {type !== "confirm" && (
                    <div className="flex-shrink-0 ml-3">
                        <button 
                            onClick={onClose}
                            className="text-white opacity-70 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {type === "confirm" && (
                <div className="px-4 pb-4 flex justify-end space-x-2">
                    <button
                        onClick={() => {
                            onConfirm?.();
                            onClose();
                        }}
                        className="flex items-center justify-center gap-1 rounded-full shadow-sm transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-1.5 px-4 text-sm font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmer
                    </button>
                    <button
                        onClick={() => {
                            onCancel?.();
                            onClose();
                        }}
                        className="flex items-center justify-center gap-1 rounded-full shadow-sm transition-all duration-200 bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-1.5 px-4 text-sm font-medium border border-white border-opacity-30"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Annuler
                    </button>
                </div>
            )}
        </div>
    );
};