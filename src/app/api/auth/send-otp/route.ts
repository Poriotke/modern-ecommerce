import { NextRequest, NextResponse } from 'next/server';

// In-memory OTP store - shared via global scope for serverless
// In production, use Redis or database
declare global {
  var otpStore: Map<string, { code: string; expiresAt: number }> | undefined;
}

if (!global.otpStore) {
  global.otpStore = new Map<string, { code: string; expiresAt: number }>();
}

export const otpStore = global.otpStore;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email.toLowerCase(), { code: otp, expiresAt });

    // Send OTP via Resend
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'ShopNow <onboarding@resend.dev>',
          to: [email],
          subject: `${otp} - Your ShopNow Verification Code`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #22c55e; margin: 0;">ShopNow</h1>
              </div>
              <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
              <p style="color: #555; text-align: center;">Use this code to complete your registration:</p>
              <div style="background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #166534;">${otp}</span>
              </div>
              <p style="color: #999; text-align: center; font-size: 13px;">
                This code expires in 10 minutes. If you didn't request this, ignore this email.
              </p>
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">
                Made with &#10084;&#65039; by P.o.Riot&#127812;
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        console.error('Resend error:', await response.text());
        return NextResponse.json(
          { error: 'Failed to send verification email. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      // No API key - log OTP for testing
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
