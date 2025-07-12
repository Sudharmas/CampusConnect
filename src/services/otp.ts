
"use server";

import type { User } from "./user";

/**
 * A simple, in-memory OTP service for demonstration purposes.
 * In a real, scalable application, you would use a database like Redis or Firestore
 * to store OTPs. For this demo, a simple Map is sufficient.
 */

const otpStore: Map<string, { code: string; expires: number }> = new Map();
const ADMIN_OTP = "123456"; // Static OTP for admins for easy testing

/**
 * Stores an OTP for a given email address. This function is called by the API route.
 * @param email The user's email address.
 * @param code The OTP to store.
 * @param expires The expiration timestamp.
 */
export async function storeOtp(email: string, code: string, expires: number): Promise<void> {
  otpStore.set(email, { code, expires });
}


/**
 * Sends an OTP to the user's email by calling our internal API route.
 * It handles the special case for the 'admin' role.
 * @param email The email address to send the OTP to.
 * @param role The role of the user ('admin' or 'user').
 */
export async function sendOtp(email: string, role: User['role']): Promise<void> {
  if (role === 'admin') {
    // For admins, we use a static OTP and don't actually send an email.
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes
    otpStore.set(email, { code: ADMIN_OTP, expires });
    console.log(`Admin OTP for ${email}: ${ADMIN_OTP}`);
    return;
  }

  // For regular users, call the API route to send a real email.
  const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send OTP email.');
  }
}

/**
 * Verifies the OTP entered by the user.
 * @param email The email address the OTP was sent to.
 * @param code The 6-digit code entered by the user.
 * @returns A boolean indicating if the verification was successful.
 */
export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const storedOtp = otpStore.get(email);

  if (!storedOtp) {
    // No OTP was ever sent for this email.
    return false;
  }

  if (Date.now() > storedOtp.expires) {
    // The OTP has expired.
    otpStore.delete(email); // Clean up expired OTP
    return false;
  }

  if (storedOtp.code === code) {
    // Success! The code matches.
    otpStore.delete(email); // OTP is single-use, so delete it after successful verification.
    return true;
  }

  // The code does not match.
  return false;
}
