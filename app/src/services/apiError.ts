import axios from "axios";

/**
 * Turns whatever a catch block receives into a message that actually says
 * what went wrong, instead of a generic "something failed" — the
 * difference between a validation error, a wrong server URL, and the
 * server just not running looks identical from the UI otherwise.
 */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      // Server responded with an error status — surface its message.
      const data = err.response.data as
        | { message?: string; error?: string }
        | undefined;
      return (
        data?.message ?? data?.error ?? `Server error (${err.response.status}).`
      );
    }
    if (err.request) {
      // Request went out but nothing came back — almost always a wrong
      // EXPO_PUBLIC_API_URL, the backend not running, or (on a physical
      // device) using "localhost" instead of the Mac's LAN IP.
      return "Could not reach the server. Check EXPO_PUBLIC_API_URL in .env and that the backend is running.";
    }
  }
  return "Something unexpected went wrong.";
}
