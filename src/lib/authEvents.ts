/**
 * Tiny event bus bridging the httpClient interceptor (which can't call
 * useNavigate()/useContext() outside React) to AuthContext, which can.
 */
const target = new EventTarget();

export const AUTH_LOGOUT_EVENT = 'auth:logout';

export function emitAuthLogout() {
  target.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}

export function onAuthLogout(handler: () => void): () => void {
  target.addEventListener(AUTH_LOGOUT_EVENT, handler);
  return () => target.removeEventListener(AUTH_LOGOUT_EVENT, handler);
}
