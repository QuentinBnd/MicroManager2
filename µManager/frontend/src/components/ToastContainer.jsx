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
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 space-y-4 z-50">
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
    return (
        <div
            className={`p-4 rounded-lg shadow-md w-96 ${
                type === "success"
                    ? "bg-green-500 text-white"
                    : type === "error"
                    ? "bg-red-500 text-white"
                    : type === "confirm"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-800 text-white"
            }`}
        >
            <p className="font-semibold">{message}</p>
            {type === "confirm" && (
                <div className="flex justify-end space-x-2 mt-3">
                    <button
                        onClick={() => {
                            onConfirm?.();
                            onClose();
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
                    >
                        Confirmer
                    </button>
                    <button
                        onClick={() => {
                            onCancel?.();
                            onClose();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                    >
                        Annuler
                    </button>
                </div>
            )}
        </div>
    );
};