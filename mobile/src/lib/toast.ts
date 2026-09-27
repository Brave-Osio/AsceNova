import { Alert } from 'react-native';
import { getErrorMessage } from './errors';

/**
 * Mirrors the web app's src/lib/toast.ts call-site shape, using RN's
 * built-in Alert instead of react-hot-toast (no toast library needed —
 * revisit if a proper in-app toast is wanted later).
 */
export function showSuccessToast(message: string): void {
  Alert.alert('Success', message);
}

export function showErrorToast(err: unknown): void {
  Alert.alert('Error', getErrorMessage(err));
}
