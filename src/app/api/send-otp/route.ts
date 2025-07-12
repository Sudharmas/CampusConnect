
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { storeOtp, verifyOtp as checkOtp } from '@/services/otp';

const sendOtpSchema = z.object({
  email: z.string().email(),
});

// This is an API route. It's a server-side function.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = sendOtpSchema.parse(body);

    // IMPORTANT: Configure your email provider here.
    // This example uses Gmail, which requires you to set up an "App Password".
    // See: https://support.google.com/accounts/answer/185833
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes from now

    // Store the OTP and its expiration time
    await storeOtp(email, otp, otpExpires);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your CampusConnect Verification Code',
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>CampusConnect Email Verification</h2>
          <p>Your one-time verification code is:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${otp}</p>
          <p>This code is valid for 15 minutes.</p>
          <p style="font-size: 12px; color: #888;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Error in /api/send-otp:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Failed to send OTP.' }, { status: 500 });
  }
}
