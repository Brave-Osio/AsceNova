interface GoogleSignInButtonProps {
  label?: string;
  onError: (message: string | null) => void;
}

/** Web build: the native Google Sign-In module doesn't exist here, so render nothing (see the .native.tsx variant). */
export default function GoogleSignInButton(_props: GoogleSignInButtonProps) {
  return null;
}
