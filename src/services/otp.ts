
"use server";

/**
 * A simple, simulated OTP service for demonstration purposes.
 * In a real application, this would integrate with an actual email/SMS service (e.g., Twilio, SendGrid).
 */

const otpStore: Map<string, { code: string; expires: number }> = new Map();
const OTP_VALIDITY_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const DEMO_OTP = "123456"; // For easy testing

/**
 * "Sends" an OTP to a given email address.
 * In this simulation, it just generates a code and stores it.
 * @param email The email address to send the OTP to.
 */
export async function sendOtp(email: string): Promise<void> {
  // For this demo, we will always use a static OTP for simplicity.
  // In a real app, you would generate a random 6-digit number:
  // const code = Math.floor(100000 + Math.random() * 900000).toString();
  const code = DEMO_OTP;
  
  const expires = Date.now() + OTP_VALIDITY_DURATION;
  otpStore.set(email, { code, expires });
  
  // In a real application, you would send the `code` to the `email` here.
  // For this demo, we'll just log it to the server console.
  console.log(`OTP for ${email}: ${code}`);
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
