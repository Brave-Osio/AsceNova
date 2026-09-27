/**
 * Tiny pub-sub so httpClient's interceptor (outside React) can tell
 * AuthContext to flip to unauthenticated when a silent refresh fails —
 * mirrors the web app's src/lib/authEvents.ts.
 */
type Listener = () => void;
const listeners = new Set<Listener>();

export function emitAuthLogout() {
  listeners.forEach((l) => l());
}

export function onAuthLogout(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
