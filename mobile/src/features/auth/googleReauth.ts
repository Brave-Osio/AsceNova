/** Web build: the native Google Sign-In module doesn't exist here (see googleReauth.native.ts). */
export const googleReauthAvailable = false;

export async function getGoogleIdTokenForReauth(): Promise<string | null> {
  return null;
}
