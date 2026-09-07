import toast from 'react-hot-toast';
import { getErrorMessage } from './errors';

/**
 * Thin wrapper over react-hot-toast — the one seam every feature imports,
 * mirroring the "single exported entry point" convention already used by
 * coachService.ts and planService.ts.
 */
export function showSuccessToast(message: string) {
  toast.success(message);
}

export function showErrorToast(error: unknown) {
  toast.error(getErrorMessage(error));
}

export function showInfoToast(message: string) {
  toast(message);
}
