import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DEVICE_ID_KEY } from './storage/shared/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retry function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param initialDelay Initial delay (milliseconds)
 * @param maxDelay Maximum delay (milliseconds)
 * @param onRetry Callback function called on each retry
 * @returns Function result
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  initialDelay = 500,
  maxDelay = 5000,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt >= maxRetries) {
        console.error(
          `Maximum retry count (${maxRetries}) reached, no more retries`
        );
        throw error;
      }

      if (onRetry && error instanceof Error) {
        onRetry(attempt, error);
      }

      delay = Math.min(delay * 2, maxDelay);

      const jitter = Math.random() * 0.2 * delay;
      const actualDelay = delay + jitter;

      console.log(
        `Retry ${attempt}/${maxRetries}, delay ${Math.round(actualDelay)}ms`
      );

      await new Promise(resolve => setTimeout(resolve, actualDelay));
    }
  }
}

/**
 * Get device ID
 * @returns Device ID
 */
export function getDeviceId(): string {
  // Check if in browser environment
  if (typeof window === 'undefined') {
    return 'server_side';
  }

  try {
    // Try to get existing device ID from localStorage
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    // If no device ID exists, generate a new one and store it
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch (error) {
    // If localStorage is not available (e.g., in private browsing mode),
    // generate a temporary ID for the session
    console.warn('Could not access localStorage for device ID:', error);
    return `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Reset device ID (useful for testing or when user wants to clear their identity)
 */
export function resetDeviceId(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(DEVICE_ID_KEY);
    } catch (error) {
      console.warn('Could not remove device ID from localStorage:', error);
    }
  }
}
