
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "./user";

const otpStore: Map<string, { code: string; expires: number }> = new Map();
const ADMIN_OTP = "123456";

/**
 * Generates an OTP, stores it for verification, and triggers the "Trigger Email" 
 * Firebase extension by creating a new document in the 'mail' collection.
 * 
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
    code = Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store the OTP locally for the verification step
  otpStore.set(email, { code, expires });
  
  // Trigger the email sending extension by adding a document to the 'mail' collection
  try {
    await addDoc(collection(db, "mail"), {
      to: email,
      message: {
        subject: "Your CampusConnect Verification Code",
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #007bff;">CampusConnect Verification</h2>
            <p>Hello,</p>
            <p>Your one-time password (OTP) is:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background-color: #f0f0f0; padding: 10px 15px; border-radius: 5px; display: inline-block;">
              ${code}
            </p>
            <p>This code is valid for 15 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            <br/>
            <p>Thanks,</p>
            <p>The CampusConnect Team</p>
          </div>
        `,
      },
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error triggering email:", error);
    // Re-throw the error to be caught by the frontend UI
    throw new Error("Could not send verification email. Please try again later.");
  }

  // We still return the code so the frontend can display it in a toast for easy testing if needed.
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
    return false;
  }

  if (Date.now() > storedOtp.expires) {
    otpStore.delete(email);
    return false;
  }

  if (storedOtp.code === code) {
    otpStore.delete(email);
    return true;
  }

  return false;
}
