import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  // other token claims you might have
  sub?: string;
  iat?: number;
}

/**
 * Stores JWT token and its expiration in localStorage
 */
export const storeAuthToken = (token: string): void => {
  try {
    // Decode the JWT to get expiration
    const decoded = jwtDecode<DecodedToken>(token);

    // Store token and expiration
    localStorage.setItem("token", token);
    localStorage.setItem("tokenExpiry", decoded.exp.toString());
  } catch (error) {
    console.error("Error storing token:", error);
    clearAuthToken();
  }
};

/**
 * Checks if the stored token has expired
 */
export const isTokenExpired = (): boolean => {
  const expiry = localStorage.getItem("tokenExpiry");

  if (!expiry) {
    return true;
  }

  // Convert to number and multiply by 1000 to convert seconds to milliseconds
  const expiryTime = Number(expiry) * 1000;
  const currentTime = Date.now();
  return currentTime >= expiryTime;
};

/**
 * Removes auth token and expiry from localStorage
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("tokenExpiry");
};

/**
 * Gets the auth token if not expired, otherwise clears it and returns null
 */
export const getAuthToken = (): string | null => {
  if (isTokenExpired()) {
    clearAuthToken();
    return null;
  }
  return localStorage.getItem("token");
};
