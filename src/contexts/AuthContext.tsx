import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  storeAuthToken,
  getAuthToken,
  isTokenExpired,
  clearAuthToken,
} from "../utils/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  authChecked: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkTokenExpiration: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check token on initial load
  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
    setAuthChecked(true);
  }, []);

  // Set up interval to check token expiration
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isAuthenticated && isTokenExpired()) {
        logout();
        navigate("/login", { replace: true });
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [isAuthenticated, navigate]);

  const login = (token: string) => {
    storeAuthToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
  };

  const checkTokenExpiration = (): boolean => {
    const expired = isTokenExpired();
    if (expired && isAuthenticated) {
      logout();
    }
    return !expired;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        checkTokenExpiration,
        authChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
