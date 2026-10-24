import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserPublicProfile, AuthResponse } from '../types/auth';
import {
  getCurrentAuthenticatedUser,
  authenticateUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  changeUserPassword,
  verifyEmailToken,
  resendVerificationToken,
  requestPasswordReset,
  completePasswordReset,
} from '../utils/auth';

interface AuthContextType {
  currentUser: UserPublicProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<AuthResponse>;
  register: (name: string, email: string, pass: string) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<UserPublicProfile, 'fullName' | 'phone' | 'bio' | 'favoriteBrand' | 'drivingPreference' | 'avatarUrl'>>) => { success: boolean; message: string };
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => { success: boolean; message: string };
  resendVerification: (email: string) => { success: boolean; message: string; cooldownRemaining?: number; otp?: string };
  requestPasswordReset: (email: string) => { success: boolean; message: string; demoToken?: string };
  resetPassword: (token: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserPublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = () => {
    const user = getCurrentAuthenticatedUser();
    setCurrentUser(user);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAuth();

    const handleAuthChange = () => {
      refreshAuth();
    };

    window.addEventListener('autoverse_auth_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('autoverse_auth_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const login = async (email: string, pass: string, rememberMe = false): Promise<AuthResponse> => {
    setIsLoading(true);
    const res = await authenticateUser(email, pass, rememberMe);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    }
    setIsLoading(false);
    return res;
  };

  const register = async (name: string, email: string, pass: string): Promise<AuthResponse> => {
    setIsLoading(true);
    const res = await registerUser(name, email, pass);
    setIsLoading(false);
    return res;
  };

  const logout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<Pick<UserPublicProfile, 'fullName' | 'phone' | 'bio' | 'favoriteBrand' | 'drivingPreference' | 'avatarUrl'>>) => {
    if (!currentUser) return { success: false, message: 'You must be logged in to update your profile.' };
    const res = updateUserProfile(currentUser.id, updates);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!currentUser) return { success: false, message: 'Authentication required.' };
    return changeUserPassword(currentUser.id, oldPass, newPass);
  };

  const verifyEmail = (token: string) => {
    const res = verifyEmailToken(token);
    if (res.success) {
      refreshAuth();
    }
    return res;
  };

  const resendVerification = (email: string) => {
    return resendVerificationToken(email);
  };

  const reqPasswordReset = (email: string) => {
    return requestPasswordReset(email);
  };

  const resetPassword = (token: string, newPass: string) => {
    return completePasswordReset(token, newPass);
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    verifyEmail,
    resendVerification,
    requestPasswordReset: reqPasswordReset,
    resetPassword,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
