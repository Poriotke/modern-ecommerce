import { NextRequest, NextResponse } from 'next/server';

// Access the same global OTP store
declare global {
  var otpStore: Map<string, { code: string; expiresAt: number }> | undefined;
}

if (!global.otpStore) {
  global.otpStore = new Map<string, { code: string; expiresAt: number }>();
}

const otpStore = global.otpStore;

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const stored = otpStore.get(email.toLowerCase());

    if (!stored) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return NextResponse.json(
        { error: 'Verification code expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (stored.code !== otp.trim()) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // OTP verified - remove from store
    otpStore.delete(email.toLowerCase());

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
