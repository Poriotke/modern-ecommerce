import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

async function sendWelcomeEmail(email: string, name: string) {
  // Using a simple fetch to a free email API (Resend, or fallback to console log)
  // In production, use Resend, SendGrid, or Nodemailer
  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'ShopNow <onboarding@resend.dev>',
          to: [email],
          subject: 'Welcome to ShopNow! 🎉',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #22c55e; margin: 0;">ShopNow</h1>
                <p style="color: #666; margin-top: 5px;">Your premium shopping destination</p>
              </div>
              <h2 style="color: #333;">Welcome, ${name}! 🎊</h2>
              <p style="color: #555; line-height: 1.6;">
                Your account has been successfully created. You're now ready to explore our curated collection of premium products.
              </p>
              <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #166534; margin-top: 0;">What you can do now:</h3>
                <ul style="color: #555; line-height: 2;">
                  <li>Browse our product gallery</li>
                  <li>Add items to your cart</li>
                  <li>Pay with Card, M-Pesa, Crypto, or WhatsApp</li>
                  <li>Track your orders in the dashboard</li>
                </ul>
              </div>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL || 'https://modern-ecommerce-blond.vercel.app'}" 
                   style="background: #22c55e; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  Start Shopping
                </a>
              </div>
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">
                Made with ❤️ by P.o.Riot🍄
              </p>
            </div>
          `,
        }),
      });
      console.log(`Welcome email sent to ${email}`);
    } else {
      console.log(`[No RESEND_API_KEY] Would send welcome email to: ${email}`);
    }
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - email failure shouldn't block registration
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email!, user.name || name);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        message: 'Account created successfully! Check your email for a welcome message.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle specific Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
