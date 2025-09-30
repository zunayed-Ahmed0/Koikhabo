import React from 'react';
import './Toast.css';

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close">×</button>
        </div>
      ))}
    </div>
  );
};