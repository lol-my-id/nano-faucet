"use client"
import { toast, Toaster } from 'react-hot-toast';
import type { ToastOptions } from 'react-hot-toast';

import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

type ToastType = 'success' | 'error' | 'info' | 'warning';

const toastStyles: Record<ToastType, { icon: React.ReactNode; className: string }> = {
  success: {
    icon: <CheckCircleIcon sx={{ fontSize: 17 }} />,
    className: 'text-success',
  },
  error: {
    icon: <ErrorIcon sx={{ fontSize: 17 }} />,
    className: 'text-error',
  },
  info: {
    icon: <InfoIcon sx={{ fontSize: 17 }} />,
    className: 'text-info',
  },
  warning: {
    icon: <WarningIcon sx={{ fontSize: 17 }} />,
    className: 'text-warning',
  },
};

const CustomToast = ({ message, type, onClose }: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) => {
  const style = toastStyles[type];

  return (
    <div className="flex w-[min(88vw,360px)] items-start gap-2.5 rounded-lg border border-white/10 bg-base-100 p-3 shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
      <span className={`mt-px shrink-0 ${style.className}`}>
        {style.icon}
      </span>
      <p className="min-w-0 flex-1 break-words text-[13px] leading-5 text-base-content/80">
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-base-content/40 hover:bg-base-300 hover:text-base-content"
      >
        <CloseIcon sx={{ fontSize: 15 }} />
      </button>
    </div>
  );
};

export const ToasterContainer = () => (
  <Toaster
    position="top-right"
    gutter={8}
    containerStyle={{ top: 16, right: 16 }}
    toastOptions={{
      duration: 4000,
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
        maxWidth: 'none',
      },
    }}
  >
    {(t) => (
      <CustomToast
        message={t.message as string}
        type={t.type as ToastType}
        onClose={() => toast.dismiss(t.id)}
      />
    )}
  </Toaster>
);

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
