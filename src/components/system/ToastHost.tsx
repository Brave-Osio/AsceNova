import { Toaster } from 'react-hot-toast';

/**
 * Mounts react-hot-toast's portal once near the app root. Styled inline
 * (not via Tailwind classes) since portal-rendered toasts sit outside
 * the normal DOM tree and can't inherit ambient styles the same way.
 */
export default function ToastHost() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--color-brand-card)',
          color: '#e2e8f0',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
        },
        success: {
          iconTheme: { primary: '#06d6a0', secondary: 'var(--color-brand-card)' },
        },
        error: {
          iconTheme: { primary: '#f72585', secondary: 'var(--color-brand-card)' },
        },
      }}
    />
  );
}
