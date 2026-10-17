import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import TextField from '../../../components/ui/TextField';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { ROUTES } from '../../../constants/routes';
import { getErrorMessage } from '../../../lib/errors';
import { showSuccessToast } from '../../../lib/toast';
import { modalBackdrop, modalPanel } from '../../../lib/motion';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CONFIRM_WORD = 'DELETE';

/** Removes per-user display preferences kept in this browser (e.g. hidden goal/challenge cards). */
function clearLocalAccountData(userId: string) {
  try {
    const stale: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(userId)) stale.push(key);
    }
    stale.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage can be unavailable (private mode / blocked); nothing sensitive is kept there anyway.
  }
}

/**
 * Self-service permanent account deletion. Deliberately multi-step: the user opens a dialog that
 * explains what is erased, must type DELETE, and must re-prove who they are (password, or a fresh
 * Google credential for Google-only accounts) — so a stray click or an unattended session can't delete an account.
 */
export default function DeleteAccountPanel() {
  const { user, deleteAccount } = useAuth();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLDivElement>(null);

  const usesPassword = user?.hasPassword !== false;
  const googleAvailable = !!GOOGLE_CLIENT_ID;
  const canSubmit = confirmation === CONFIRM_WORD && (usesPassword ? password.length > 0 : googleToken !== null);

  function close() {
    if (isDeleting) return;
    setIsOpen(false);
    setConfirmation('');
    setPassword('');
    setGoogleToken(null);
    setError(null);
  }

  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current?.querySelector('button')?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isDeleting) close();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isDeleting]);

  async function handleDelete() {
    if (!user || !canSubmit || isDeleting) return;
    setIsDeleting(true);
    setError(null);
    const userId = user.id;
    try {
      await deleteAccount(
        usesPassword ? { confirmation: CONFIRM_WORD, password } : { confirmation: CONFIRM_WORD, idToken: googleToken ?? '' },
      );
      // The account (and its tokens) no longer exist server-side; drop everything cached here too.
      queryClient.clear();
      clearLocalAccountData(userId);
      showSuccessToast('Your account has been deleted.');
      navigate(ROUTES.landing, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't delete your account. Please check your details and try again."));
      setPassword('');
      setGoogleToken(null);
      setIsDeleting(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm text-brand-text-secondary">
          Permanently delete your account and the personal data tied to it. This can't be undone.
        </p>
        <div className="mt-3">
          <Button variant="secondary" size="sm" onClick={() => setIsOpen(true)}>
            Delete Account
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/60"
              variants={modalBackdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={isDeleting ? undefined : close}
            />
            <motion.div
              variants={modalPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-account-title"
              aria-describedby="delete-account-description"
              className="card relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400 light:text-red-700">
                  <AlertTriangle size={18} />
                </span>
                <div>
                  <h2 id="delete-account-title" className="text-base font-bold text-brand-text">
                    Delete your account?
                  </h2>
                  <div id="delete-account-description" className="mt-1 space-y-2 text-sm text-brand-text-secondary">
                    <p>This permanently erases:</p>
                    <ul className="list-disc space-y-0.5 pl-5">
                      <li>your profile, workout plans and daily logs</li>
                      <li>weight, water and workout history, XP, ranks and achievements</li>
                      <li>your coach conversations, goals and notifications</li>
                      <li>your sign-in details and all active sessions</li>
                    </ul>
                    <p>
                      Your account is removed immediately and cannot be recovered. Encrypted database backups kept by our hosting
                      provider may retain copies until they expire on their own schedule, and anything already sent to the AI provider
                      to generate plans or coach replies is outside our control.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <TextField
                  label={`Type ${CONFIRM_WORD} to confirm`}
                  value={confirmation}
                  onChange={setConfirmation}
                  placeholder={CONFIRM_WORD}
                />

                {usesPassword ? (
                  <TextField label="Your password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                ) : googleAvailable ? (
                  <div>
                    <span className="mb-1.5 block text-sm font-medium text-brand-text-secondary">
                      Confirm with Google
                    </span>
                    {googleToken ? (
                      <p className="text-sm text-emerald-400 light:text-emerald-700" role="status">
                        Google confirmed. You can delete your account now.
                      </p>
                    ) : (
                      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                        <GoogleLogin
                          onSuccess={(response) => setGoogleToken(response.credential ?? null)}
                          onError={() => setError('Google confirmation was cancelled or failed. Please try again.')}
                          text="continue_with"
                          theme={theme === 'dark' ? 'filled_black' : 'outline'}
                          shape="rectangular"
                        />
                      </GoogleOAuthProvider>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-400 light:text-red-700" role="alert">
                    Google confirmation isn't available right now, so this account can't be deleted from here.
                  </p>
                )}

                {error && (
                  <p className="text-sm text-red-400 light:text-red-700" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <div ref={cancelRef}>
                  <Button variant="secondary" size="sm" disabled={isDeleting} onClick={close}>
                    Cancel
                  </Button>
                </div>
                <Button size="sm" loading={isDeleting} disabled={!canSubmit} onClick={handleDelete}>
                  Delete my account
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
