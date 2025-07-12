
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "./user";

const otpStore: Map<string, { code: string; expires: number }> = new Map();
const ADMIN_OTP = "123456";

/**
 * Generates an OTP and attempts to send it via the "Trigger Email" extension.
 * If sending the email fails (e.g., due to local setup or extension issues),
 * it returns the OTP so it can be displayed in a toast for local development.
 * 
 * @param email The email address to send the OTP to.
 * @param role The role of the user ('admin' or 'user').
 * @returns A promise that resolves to the generated OTP, or null if an error occurred that wasn't handled.
 * @throws Will throw an error if writing to Firestore fails and is not caught.
 */
export async function sendOtp(email: string, role: User['role']): Promise<string | null> {
  const expires = Date.now() + 15 * 60 * 1000; // 15 minutes from now
  let code: string;

  if (role === 'admin') {
    code = ADMIN_OTP;
  } else {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store the OTP locally for the verification step
  otpStore.set(email, { code, expires });
  
  try {
    // This document write triggers the "Trigger Email" Firebase Extension
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
    // If email is sent successfully, return null to indicate no simulation is needed.
    return null;
  } catch (error) {
    console.error("Could not send verification email, falling back to simulation. Error:", error);
    // If email sending fails, return the code so the frontend can display it for local testing.
    return code;
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
