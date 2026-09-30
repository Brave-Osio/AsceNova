import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useTheme } from '../../../context/ThemeContext';
import { getErrorMessage } from '../../../lib/errors';
import { showErrorToast } from '../../../lib/toast';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleSignInButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

function GoogleButton({ text }: GoogleSignInButtonProps) {
  const { theme } = useTheme();
  const { mutate, isPending, error } = useGoogleSignIn();

  return (
    <div className="space-y-2">
      <div
        className={`flex justify-center ${isPending ? 'pointer-events-none opacity-60' : ''}`}
        aria-busy={isPending}
      >
        <GoogleLogin
          onSuccess={(response) => {
            if (response.credential) {
              mutate(response.credential);
            } else {
              showErrorToast(new Error('Google did not return a credential. Please try again.'));
            }
          }}
          onError={() => showErrorToast(new Error('Google sign-in was cancelled or failed. Please try again.'))}
          text={text}
          theme={theme === 'dark' ? 'filled_black' : 'outline'}
          shape="rectangular"
          size="large"
        />
      </div>
      {error && <p className="text-center text-sm text-red-400 light:text-red-700">{getErrorMessage(error)}</p>}
    </div>
  );
}

/**
 * Renders nothing unless VITE_GOOGLE_CLIENT_ID is configured, so the app (and every
 * environment that hasn't set it up yet) keeps working with email/password only.
 * The provider lives here rather than in AppProviders so Google's script only loads
 * on the auth pages.
 */
export default function GoogleSignInButton({ text = 'continue_with' }: GoogleSignInButtonProps) {
  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-xs text-brand-text-secondary">
          <span className="h-px flex-1 bg-current opacity-20" />
          or
          <span className="h-px flex-1 bg-current opacity-20" />
        </div>
        <GoogleButton text={text} />
      </div>
    </GoogleOAuthProvider>
  );
}
