import React, { useEffect } from 'react';

// Error notification component
const ErrorNotification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">⚠️ {message}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </div>
  );
};

export default ErrorNotification;
