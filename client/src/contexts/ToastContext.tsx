"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import '../styles/toast-animations.css';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  replaceToast: (oldId: string, newToast: Omit<Toast, 'id'>) => void;
  removeToastsByType: (type: Toast['type']) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 4000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const replaceToast = useCallback((oldId: string, newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToastWithId: Toast = {
      ...newToast,
      id,
      duration: newToast.duration || 4000,
    };

    setToasts(prev => prev.map(toast => 
      toast.id === oldId ? newToastWithId : toast
    ));

    // Auto remove new toast after duration
    if (newToastWithId.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToastWithId.duration);
    }
  }, []);

  const removeToastsByType = useCallback((type: Toast['type']) => {
    setToasts(prev => prev.filter(toast => toast.type !== type));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => {
    addToast({
      title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info'),
      message,
      type,
      duration: 4000
    });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts, replaceToast, removeToastsByType, showToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={removeToast}
          index={index}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void; index: number }> = ({ toast, onRemove, index }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  // Auto-dismiss progress
  React.useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (toast.duration! / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          container: 'bg-white border-l-4 border-green-500 shadow-lg',
          icon: 'text-green-500',
          title: 'text-gray-900',
          message: 'text-gray-600'
        };
      case 'error':
        return {
          container: 'bg-white border-l-4 border-red-500 shadow-lg',
          icon: 'text-red-500',
          title: 'text-gray-900',
          message: 'text-gray-600'
        };
      case 'warning':
        return {
          container: 'bg-white border-l-4 border-yellow-500 shadow-lg',
          icon: 'text-yellow-500',
          title: 'text-gray-900',
          message: 'text-gray-600'
        };
      case 'info':
        return {
          container: 'bg-white border-l-4 border-blue-500 shadow-lg',
          icon: 'text-blue-500',
          title: 'text-gray-900',
          message: 'text-gray-600'
        };
      default:
        return {
          container: 'bg-white border-l-4 border-gray-500 shadow-lg',
          icon: 'text-gray-500',
          title: 'text-gray-900',
          message: 'text-gray-600'
        };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
          </svg>
        );
    }
  };

  const styles = getToastStyles();

  return (
    <div 
      className={`
        ${styles.container}
        ${isExiting ? 'toast-exit' : 'toast-enter'}
        max-w-sm w-full 
        rounded-lg 
        p-4 
        pointer-events-auto
        toast-shadow
        toast-backdrop
        border
        border-gray-200
        toast-hover
        relative
        overflow-hidden
      `}
      style={{
        transform: `translateY(${index * 8}px)`,
        animationDelay: `${index * 100}ms`
      }}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${styles.title}`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className={`mt-1 text-sm ${styles.message}`}>
              {toast.message}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleRemove}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-colors hover:bg-gray-100"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress bar - only show for toasts with duration > 0 */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div 
            className={`h-full transition-all duration-100 ease-linear ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-yellow-500' :
              toast.type === 'info' ? 'bg-blue-500' : 'bg-gray-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
