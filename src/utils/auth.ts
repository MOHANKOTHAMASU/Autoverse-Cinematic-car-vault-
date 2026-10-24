// AutoVerse Stage 6: Secure Authentication & User Identity Engine
// Compliant with Web Crypto Standards, Salted SHA-256, Anti-Brute-Force Rate Limiting

import type { User, UserPublicProfile, AuthSession, AuthResponse } from '../types/auth';

const USERS_STORAGE_KEY = 'autoverse_users_db';
const SESSION_STORAGE_KEY = 'autoverse_auth_session';
const RATE_LIMIT_STORAGE_KEY = 'autoverse_auth_rate_limits';
const VERIFICATION_COOLDOWN_KEY = 'autoverse_verify_cooldowns';

// Utility: Convert ArrayBuffer to Hex String
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate cryptographically secure random salt
export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate random 6-digit numeric OTP for Gmail & SMS verification
export function generateOtp(digits = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

// Generate random secure token for verification & password reset
export function generateToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Salted SHA-256 hash using native Web Crypto API
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:autoverse_v6_secret`);
  const digestBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(digestBuffer);
}

// Seed Root Administrator Account
export const SEED_ADMIN: User = {
  id: 'usr_admin_root',
  fullName: 'AutoVerse Executive Admin',
  email: 'admin@autoverse.com',
  passwordHash: 'd47c67e8ee1e94fecd221af1fbba4873628db43886a28460ee239fd8baada766',
  salt: 'autoverse_admin_salt_2024',
  role: 'admin',
  status: 'active',
  isVerified: true,
  verificationToken: null,
  verificationTokenExpiresAt: null,
  verificationOtp: null,
  verificationPhone: '+91 98480 22338',
  otpExpiresAt: null,
  resetToken: null,
  resetTokenExpiresAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  lastLoginAt: null,
  favoriteBrand: 'Porsche',
  drivingPreference: 'High-Performance Operations',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
};

// Sanitize user for public client-side consumption (never expose hash or salt)
export function sanitizeUser(user: User): UserPublicProfile {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role || 'driver',
    status: user.status || 'active',
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    favoriteBrand: user.favoriteBrand,
    drivingPreference: user.drivingPreference,
    phone: user.phone,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
  };
}

// Database Layer: Retrieve all users, ensuring seed administrator exists
export function getUsersFromDB(): User[] {
  if (typeof window === 'undefined') return [SEED_ADMIN];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    let users: User[] = raw ? JSON.parse(raw) : [];

    // Ensure all existing records have role & status
    let modified = false;
    users = users.map((u) => {
      let changed = false;
      if (!u.role) {
        u.role = 'driver';
        changed = true;
      }
      if (!u.status) {
        u.status = 'active';
        changed = true;
      }
      if (changed) modified = true;
      return u;
    });

    // Check if at least one active administrator exists
    const hasAdmin = users.some((u) => u.role === 'admin');
    if (!hasAdmin) {
      users.unshift(SEED_ADMIN);
      modified = true;
    }

    if (modified) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
    return users;
  } catch {
    return [SEED_ADMIN];
  }
}

// Database Layer: Save users
export function saveUsersToDB(users: User[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to persist users database', err);
  }
}

// Rate Limiting: Check if email/IP is locked due to brute force
interface RateLimitRecord {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttemptAt: number;
}

export function checkRateLimit(email: string): { isLocked: boolean; remainingSeconds: number } {
  if (typeof window === 'undefined') return { isLocked: false, remainingSeconds: 0 };
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const records: Record<string, RateLimitRecord> = raw ? JSON.parse(raw) : {};
    const key = email.toLowerCase().trim();
    const record = records[key];

    if (!record || !record.lockedUntil) {
      return { isLocked: false, remainingSeconds: 0 };
    }

    const now = Date.now();
    if (now < record.lockedUntil) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    }

    // Cooldown expired
    record.lockedUntil = null;
    record.failedAttempts = 0;
    records[key] = record;
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(records));
    return { isLocked: false, remainingSeconds: 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
}

export function recordFailedLoginAttempt(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const records: Record<string, RateLimitRecord> = raw ? JSON.parse(raw) : {};
    const key = email.toLowerCase().trim();
    const now = Date.now();

    const current = records[key] || { failedAttempts: 0, lockedUntil: null, lastAttemptAt: now };
    current.failedAttempts += 1;
    current.lastAttemptAt = now;

    // After 5 failed attempts, lock for 5 minutes (300 seconds)
    if (current.failedAttempts >= 5) {
      current.lockedUntil = now + 5 * 60 * 1000;
    }

    records[key] = current;
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // silent catch
  }
}

export function clearRateLimit(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!raw) return;
    const records: Record<string, RateLimitRecord> = JSON.parse(raw);
    delete records[email.toLowerCase().trim()];
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // silent catch
  }
}

// Password Complexity Validator
export function evaluatePasswordStrength(password: string): {
  score: number; // 0 to 4
  feedback: string[];
  isStrongEnough: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('At least 8 characters required');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least 1 uppercase letter');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least 1 lowercase letter');
  }

  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include both a number and a symbol');
  }

  return {
    score,
    feedback,
    isStrongEnough: score >= 3 && password.length >= 8,
  };
}

// Register a new user
export async function registerUser(
  fullName: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedName = fullName.trim();

  // Basic validation
  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, message: 'Please provide your full legal or driver name.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  const strength = evaluatePasswordStrength(password);
  if (!strength.isStrongEnough) {
    return {
      success: false,
      message: `Password does not meet security criteria: ${strength.feedback.join(', ')}`,
    };
  }

  const users = getUsersFromDB();

  // Check duplicate email
  const existing = users.find((u) => u.email === normalizedEmail);
  if (existing) {
    return {
      success: false,
      message: 'An account is already registered with this email address. Please sign in.',
    };
  }

  // Generate secure salt, hash, verification token and 6-digit Gmail/SMS OTP
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const verificationToken = generateToken();
  const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const verificationOtp = generateOtp(6);
  const otpExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  const newUser: User = {
    id: `usr_${Date.now()}_${generateToken(8)}`,
    fullName: trimmedName,
    email: normalizedEmail,
    passwordHash,
    salt,
    role: 'driver',
    status: 'active',
    isVerified: false,
    verificationToken,
    verificationTokenExpiresAt,
    verificationOtp,
    otpExpiresAt,
    resetToken: null,
    resetTokenExpiresAt: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    favoriteBrand: 'Porsche',
    drivingPreference: 'Electric High-Performance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  };

  users.push(newUser);
  saveUsersToDB(users);

  // Initialize empty user garage and merge existing guest garage if any
  initializeUserGarage(newUser.id);

  return {
    success: true,
    message: `Account registered! Verification code dispatched to ${normalizedEmail}.`,
    user: sanitizeUser(newUser),
    verificationPending: true,
    verificationOtp,
  };
}

// Login user
export async function authenticateUser(
  email: string,
  password: string,
  rememberMe = false
): Promise<AuthResponse> {
  const normalizedEmail = email.toLowerCase().trim();

  // Rate limit check
  const rateLimit = checkRateLimit(normalizedEmail);
  if (rateLimit.isLocked) {
    return {
      success: false,
      message: `Too many failed attempts. Security cooldown active for ${rateLimit.remainingSeconds} seconds.`,
    };
  }

  const users = getUsersFromDB();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user) {
    recordFailedLoginAttempt(normalizedEmail);
    // Neutral message to prevent account enumeration
    return { success: false, message: 'Invalid driver email or security passkey.' };
  }

  const computedHash = await hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    recordFailedLoginAttempt(normalizedEmail);
    return { success: false, message: 'Invalid driver email or security passkey.' };
  }

  // Check account suspension status
  if (user.status === 'suspended') {
    return {
      success: false,
      message: 'Account suspended by AutoVerse administration. Access denied.',
    };
  }

  // Clear rate limits upon successful credential verification
  clearRateLimit(normalizedEmail);

  // Session duration: 30 days if rememberMe, else 24 hours
  const sessionDurationMs = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000;

  const sessionToken = `ses_${Date.now()}_${generateToken(16)}`;
  const expiresAt = Date.now() + sessionDurationMs;

  const session: AuthSession = {
    token: sessionToken,
    userId: user.id,
    expiresAt,
    rememberMe,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('autoverse_auth_changed', { detail: user.id }));
  }

  // Update lastLoginAt
  user.lastLoginAt = new Date().toISOString();
  saveUsersToDB(users);

  // Merge guest garage into user garage if guest saved items exist
  mergeGuestGarageIntoUser(user.id);

  return {
    success: true,
    message: 'Welcome back to AutoVerse.',
    user: sanitizeUser(user),
    token: sessionToken,
  };
}

// Retrieve active session if valid
export function getActiveSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);

    // Check expiration
    if (Date.now() > session.expiresAt) {
      logoutUser();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Retrieve active user profile
export function getCurrentUser(): UserPublicProfile | null {
  const session = getActiveSession();
  if (!session) return null;
  const users = getUsersFromDB();
  const user = users.find((u) => u.id === session.userId);
  return user ? sanitizeUser(user) : null;
}

// Retrieve currently authenticated user profile
export function getCurrentAuthenticatedUser(): UserPublicProfile | null {
  const session = getActiveSession();
  if (!session) return null;

  const users = getUsersFromDB();
  const user = users.find((u) => u.id === session.userId);
  return user ? sanitizeUser(user) : null;
}

// Logout user
export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('autoverse_auth_changed', { detail: null }));
  } catch {
    // silent catch
  }
}

// Email / Phone Verification (Supports 6-Digit OTP or 32-character security token)
export function verifyEmailToken(tokenOrOtp: string): { success: boolean; message: string } {
  if (!tokenOrOtp) return { success: false, message: 'Invalid or missing verification code or security token.' };

  const trimmed = tokenOrOtp.trim();
  const users = getUsersFromDB();
  const user = users.find(
    (u) =>
      u.verificationToken === trimmed ||
      (u.verificationOtp && u.verificationOtp === trimmed)
  );

  if (!user) {
    return { success: false, message: 'Verification code or token is invalid or has already been used.' };
  }

  // Token expiration check (24h)
  if (user.verificationToken === trimmed && user.verificationTokenExpiresAt && Date.now() > user.verificationTokenExpiresAt) {
    return { success: false, message: 'Verification security token has expired. Please request a new code.' };
  }

  // 6-digit OTP expiration check (15 mins)
  if (user.verificationOtp === trimmed && user.otpExpiresAt && Date.now() > user.otpExpiresAt) {
    return { success: false, message: '6-digit OTP has expired. Please request a fresh code.' };
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiresAt = null;
  user.verificationOtp = null;
  user.otpExpiresAt = null;
  saveUsersToDB(users);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('autoverse_auth_changed', { detail: user.id }));
  }

  return {
    success: true,
    message: 'Driver credentials successfully verified! Your account is now fully active.',
  };
}

// Resend Email / Phone Verification OTP with 60-second cooldown
export function resendVerificationToken(emailOrPhone: string): { success: boolean; message: string; cooldownRemaining?: number; otp?: string } {
  const normalized = emailOrPhone.toLowerCase().trim();
  const now = Date.now();

  // Cooldown check
  try {
    const rawCooldowns = localStorage.getItem(VERIFICATION_COOLDOWN_KEY);
    const cooldowns: Record<string, number> = rawCooldowns ? JSON.parse(rawCooldowns) : {};
    const lastSent = cooldowns[normalized];
    if (lastSent && now - lastSent < 60000) {
      const remaining = Math.ceil((60000 - (now - lastSent)) / 1000);
      return {
        success: false,
        message: `Please wait ${remaining} seconds before requesting another verification code.`,
        cooldownRemaining: remaining,
      };
    }

    const users = getUsersFromDB();
    const user = users.find((u) => u.email === normalized || (u.phone && u.phone.includes(normalized)));

    if (!user) {
      // Neutral message
      return { success: true, message: 'If this contact is registered, verification instructions have been dispatched.' };
    }

    if (user.isVerified) {
      return { success: true, message: 'This account is already verified. You may sign in directly.' };
    }

    user.verificationToken = generateToken();
    user.verificationTokenExpiresAt = now + 24 * 60 * 60 * 1000;
    user.verificationOtp = generateOtp(6);
    user.otpExpiresAt = now + 15 * 60 * 1000;
    saveUsersToDB(users);

    // Save cooldown
    cooldowns[normalized] = now;
    localStorage.setItem(VERIFICATION_COOLDOWN_KEY, JSON.stringify(cooldowns));

    return {
      success: true,
      message: `Fresh 6-digit OTP code dispatched to ${user.email}: [ ${user.verificationOtp} ]`,
      otp: user.verificationOtp,
    };
  } catch {
    return { success: false, message: 'An unexpected error occurred while dispatching verification.' };
  }
}

// Helper to inspect pending verification OTP for local sandbox & UI assist
export function getPendingVerificationData(identifier: string): { email?: string; phone?: string; otp?: string; token?: string; isVerified: boolean } | null {
  if (!identifier) return null;
  const normalized = identifier.toLowerCase().trim();
  const users = getUsersFromDB();
  const user = users.find((u) => u.email === normalized || (u.phone && u.phone.includes(normalized)));
  if (!user) return null;

  return {
    email: user.email,
    phone: user.phone || '+91 98480 22338',
    otp: user.verificationOtp || '849201',
    token: user.verificationToken || undefined,
    isVerified: user.isVerified,
  };
}

// Update driver avatar URL
export function updateUserProfilePhoto(userId: string, avatarUrl: string): boolean {
  const users = getUsersFromDB();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  user.avatarUrl = avatarUrl;
  saveUsersToDB(users);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('autoverse_auth_changed', { detail: user.id }));
  }
  return true;
}

// Password Reset: Request
export function requestPasswordReset(email: string): { success: boolean; message: string; demoToken?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const users = getUsersFromDB();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user) {
    // Neutral message to prevent account harvesting
    return {
      success: true,
      message: 'If an account exists for this email, password reset instructions will be sent.',
    };
  }

  const resetToken = generateToken();
  user.resetToken = resetToken;
  user.resetTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  saveUsersToDB(users);

  return {
    success: true,
    message: 'If an account exists for this email, password reset instructions will be sent.',
    demoToken: resetToken,
  };
}

// Password Reset: Complete
export async function completePasswordReset(
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  if (!token) return { success: false, message: 'Reset token is missing or malformed.' };

  const strength = evaluatePasswordStrength(newPassword);
  if (!strength.isStrongEnough) {
    return {
      success: false,
      message: `New passkey does not meet complexity standards: ${strength.feedback.join(', ')}`,
    };
  }

  const users = getUsersFromDB();
  const user = users.find((u) => u.resetToken === token);

  if (!user) {
    return { success: false, message: 'Password reset link is invalid or has already been used.' };
  }

  if (user.resetTokenExpiresAt && Date.now() > user.resetTokenExpiresAt) {
    return { success: false, message: 'Password reset link has expired. Please submit a new recovery request.' };
  }

  // Hash new password with fresh salt
  const salt = generateSalt();
  user.passwordHash = await hashPassword(newPassword, salt);
  user.salt = salt;
  user.resetToken = null;
  user.resetTokenExpiresAt = null;
  saveUsersToDB(users);

  return {
    success: true,
    message: 'Security passkey updated successfully. You may now sign in with your new credentials.',
  };
}

// Profile: Update non-security fields
export function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'fullName' | 'phone' | 'bio' | 'favoriteBrand' | 'drivingPreference' | 'avatarUrl'>>
): { success: boolean; message: string; user?: UserPublicProfile } {
  const users = getUsersFromDB();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return { success: false, message: 'User profile not found.' };
  }

  if (updates.fullName !== undefined) {
    const trimmed = updates.fullName.trim();
    if (trimmed.length < 2) {
      return { success: false, message: 'Full name must contain at least 2 characters.' };
    }
    user.fullName = trimmed;
  }

  if (updates.phone !== undefined) user.phone = updates.phone.trim();
  if (updates.bio !== undefined) user.bio = updates.bio.trim();
  if (updates.favoriteBrand !== undefined) user.favoriteBrand = updates.favoriteBrand.trim();
  if (updates.drivingPreference !== undefined) user.drivingPreference = updates.drivingPreference.trim();
  if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl.trim();

  saveUsersToDB(users);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('autoverse_auth_changed', { detail: user.id }));
  }

  return {
    success: true,
    message: 'Driver profile updated successfully.',
    user: sanitizeUser(user),
  };
}

// Profile: Change Password
export async function changeUserPassword(
  userId: string,
  currentPass: string,
  newPass: string
): Promise<{ success: boolean; message: string }> {
  const users = getUsersFromDB();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  const currentComputed = await hashPassword(currentPass, user.salt);
  if (currentComputed !== user.passwordHash) {
    return { success: false, message: 'Current security passkey is incorrect.' };
  }

  const strength = evaluatePasswordStrength(newPass);
  if (!strength.isStrongEnough) {
    return {
      success: false,
      message: `New passkey does not meet complexity standards: ${strength.feedback.join(', ')}`,
    };
  }

  const newSalt = generateSalt();
  user.passwordHash = await hashPassword(newPass, newSalt);
  user.salt = newSalt;
  saveUsersToDB(users);

  return { success: true, message: 'Passkey changed successfully.' };
}

// ---------------------------------------------------------------------------
// User-Specific Garage Persistence Engine
// ---------------------------------------------------------------------------
const USER_GARAGES_KEY = 'autoverse_user_garages';
const GUEST_GARAGE_KEY = 'autoverse_garage';

export function getAllUserGarages(): Record<string, { savedSlugs: string[]; favoriteSlugs: string[]; savedComparisons: any[]; savedConfigurations?: any[]; recentlyViewed: string[] }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USER_GARAGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAllUserGarages(data: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_GARAGES_KEY, JSON.stringify(data));
  } catch {
    // silent catch
  }
}

export function initializeUserGarage(userId: string): void {
  const all = getAllUserGarages();
  if (!all[userId]) {
    all[userId] = {
      savedSlugs: ['porsche-taycan-turbo-s', 'audi-rs-etron-gt'],
      favoriteSlugs: ['porsche-taycan-turbo-s'],
      savedComparisons: [
        {
          id: `cmp_${Date.now()}`,
          name: 'Taycan Turbo S vs RS e-tron GT',
          slugs: ['porsche-taycan-turbo-s', 'audi-rs-etron-gt'],
          savedAt: new Date().toISOString(),
        },
      ],
      savedConfigurations: [],
      recentlyViewed: ['porsche-taycan-turbo-s', 'audi-rs-etron-gt', 'tesla-model-s-plaid'],
    };
    saveAllUserGarages(all);
  }
}

export function mergeGuestGarageIntoUser(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const rawGuest = localStorage.getItem(GUEST_GARAGE_KEY);
    if (!rawGuest) return;
    const guestSlugs: string[] = JSON.parse(rawGuest);
    if (!Array.isArray(guestSlugs) || guestSlugs.length === 0) return;

    const all = getAllUserGarages();
    initializeUserGarage(userId);
    const userGarage = all[userId];

    // Merge unique slugs
    const combined = Array.from(new Set([...userGarage.savedSlugs, ...guestSlugs]));
    userGarage.savedSlugs = combined;
    all[userId] = userGarage;
    saveAllUserGarages(all);

    window.dispatchEvent(new CustomEvent('autoverse_garage_updated', { detail: combined }));
  } catch {
    // silent catch
  }
}

// ==========================================
// STAGE 7: SECURE ADMIN AUTHORIZATION LAYER
// ==========================================

export function isCurrentUserAdmin(): boolean {
  const session = getActiveSession();
  if (!session) return false;
  const users = getUsersFromDB();
  const user = users.find((u) => u.id === session.userId);
  return !!user && user.role === 'admin' && user.status === 'active';
}

export function getCurrentAdmin(): UserPublicProfile | null {
  const session = getActiveSession();
  if (!session) return null;
  const users = getUsersFromDB();
  const user = users.find((u) => u.id === session.userId);
  if (!user || user.role !== 'admin' || user.status !== 'active') return null;
  return sanitizeUser(user);
}

export function assertAdminAuthorized(): UserPublicProfile {
  const admin = getCurrentAdmin();
  if (!admin) {
    throw new Error('403 Forbidden: Authorized Administrator Credentials Required.');
  }
  return admin;
}

export function getAllUsersForAdmin(): UserPublicProfile[] {
  assertAdminAuthorized();
  return getUsersFromDB().map(sanitizeUser);
}

export function updateUserRoleByAdmin(
  targetUserId: string,
  newRole: 'admin' | 'driver'
): { success: boolean; message: string } {
  assertAdminAuthorized();
  const users = getUsersFromDB();
  const target = users.find((u) => u.id === targetUserId);
  if (!target) {
    return { success: false, message: 'User account not found.' };
  }

  // Prevent removing the last active administrator
  if (target.role === 'admin' && newRole === 'driver') {
    const adminCount = users.filter((u) => u.role === 'admin' && u.status === 'active').length;
    if (adminCount <= 1) {
      return {
        success: false,
        message: 'Security Policy: Cannot revoke permissions from the last active administrator.',
      };
    }
  }

  target.role = newRole;
  saveUsersToDB(users);
  return {
    success: true,
    message: `Account role updated to ${newRole.toUpperCase()} for ${target.fullName}.`,
  };
}

export function updateUserStatusByAdmin(
  targetUserId: string,
  newStatus: 'active' | 'suspended'
): { success: boolean; message: string } {
  const admin = assertAdminAuthorized();
  if (admin.id === targetUserId && newStatus === 'suspended') {
    return {
      success: false,
      message: 'Security Policy: You cannot suspend your own active administrator account.',
    };
  }

  const users = getUsersFromDB();
  const target = users.find((u) => u.id === targetUserId);
  if (!target) {
    return { success: false, message: 'User account not found.' };
  }

  target.status = newStatus;
  saveUsersToDB(users);
  return {
    success: true,
    message: `Account status updated to ${newStatus.toUpperCase()} for ${target.fullName}.`,
  };
}
