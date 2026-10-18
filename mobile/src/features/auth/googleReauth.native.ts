import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';

// Must be the *web* OAuth client ID, same as GoogleSignInButton.native.tsx: the server verifies the token's audience.
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export const googleReauthAvailable = !!WEB_CLIENT_ID;

/** Native-only: asks Google for a fresh ID token to re-confirm identity. Returns null if the user cancels. */
export async function getGoogleIdTokenForReauth(): Promise<string | null> {
  if (!WEB_CLIENT_ID) return null;
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    return isSuccessResponse(response) ? (response.data.idToken ?? null) : null;
  } catch (err) {
    if (isErrorWithCode(err) && (err.code === statusCodes.SIGN_IN_CANCELLED || err.code === statusCodes.IN_PROGRESS)) {
      return null;
    }
    throw err;
  }
}
