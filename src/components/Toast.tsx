"use client"
// components/CustomToaster.tsx
import { toast, Toaster } from 'react-hot-toast';
import type { ToastOptions } from 'react-hot-toast';

import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

// Base Toast Component
const CustomToast = ({ message, type, onClose }: { 
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}) => {
  const iconSize = 'w-6 h-6';
  
  const icons = {
    success: <CheckCircleIcon className={`${iconSize} text-success`} />,
    error: <ErrorIcon className={`${iconSize} text-error`} />,
    info: <InfoIcon className={`${iconSize} text-info`} />,
    warning: <WarningIcon className={`${iconSize} text-warning`} />,
  };

  return (
    <div className={`alert alert-${type} justify-start animate-enter`}>
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button 
        onClick={onClose}
        className="btn btn-ghost btn-xs hover:bg-transparent hover:text-current"
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast container configuration
export const ToasterContainer = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 4000,
    }}
  >
    {(t) => (
      <CustomToast 
        message={t.message as string} 
        type={t.type as any} 
        onClose={() => toast.dismiss(t.id)} 
      />
    )}
  </Toaster>
);

// Custom toast functions
export const cToast = {
  success: (message: string, options?: ToastOptions) => 
    toast.custom((t) => (
      <CustomToast 
        message={message} 
        type="success" 
        onClose={() => toast.dismiss(t.id)} 
      />
    ), options),
  
  error: (message: string, options?: ToastOptions) => 
    toast.custom((t) => (
      <CustomToast 
        message={message} 
        type="error" 
        onClose={() => toast.dismiss(t.id)} 
      />
    ), options),
  
  info: (message: string, options?: ToastOptions) => 
    toast.custom((t) => (
      <CustomToast 
        message={message} 
        type="info" 
        onClose={() => toast.dismiss(t.id)} 
      />
    ), options),
  
  warning: (message: string, options?: ToastOptions) => 
    toast.custom((t) => (
      <CustomToast 
        message={message} 
        type="warning" 
        onClose={() => toast.dismiss(t.id)} 
      />
    ), options),
  
  dismiss: toast.dismiss,
};