
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
 * Generates and stores an OTP for a given email address.
 * It handles the special case for the 'admin' role.
 * @param email The email address to send the OTP to.
 * @param role The role of the user ('admin' or 'user').
 * @returns The generated OTP for display/testing purposes.
 */
export async function sendOtp(email: string, role: User['role']): Promise<string> {
  const expires = Date.now() + 15 * 60 * 1000; // 15 minutes from now
  let code: string;

  if (role === 'admin') {
    code = ADMIN_OTP;
  } else {
    // Generate a random 6-digit OTP for regular users
    code = Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store the OTP and its expiration time
  otpStore.set(email, { code, expires });
  
  // In a real app, you would send this code via email.
  // For this demo, we return it so the frontend can display it in a toast for easy testing.
  console.log(`(Simulation) OTP for ${email} is: ${code}`);

  return code;
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
