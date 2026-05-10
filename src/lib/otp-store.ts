// Global OTP store shared across serverless route handlers
// In production, replace with Redis or database storage

declare global {
  var otpStore: Map<string, { code: string; expiresAt: number }> | undefined;
}

if (!global.otpStore) {
  global.otpStore = new Map<string, { code: string; expiresAt: number }>();
}

export const otpStore = global.otpStore;
