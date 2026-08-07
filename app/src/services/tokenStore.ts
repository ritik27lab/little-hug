import * as SecureStore from "expo-secure-store";

// Keychain (iOS) / Keystore (Android) backed storage — appropriate for a
// JWT, unlike AsyncStorage which is unencrypted plain text on disk.
const ACCESS_TOKEN_KEY = "little_log_access_token";
const REFRESH_TOKEN_KEY = "little_log_refresh_token";

export async function saveTokens(accessToken: string, refreshToken?: string | null): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}