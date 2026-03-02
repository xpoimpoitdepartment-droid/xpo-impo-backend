import { OTPModel } from "./otp.model";

export async function storeOTP(
  email: string,
  purpose: "email_verification" | "password_reset",
  otp: string,
  ttlSec: number
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlSec * 1000);
  
  // Delete any existing OTP for this email/purpose
  await OTPModel.deleteMany({ 
    email: email.toLowerCase(), 
    purpose 
  });
  
  // Store new OTP
  await OTPModel.create({
    email: email.toLowerCase(),
    purpose,
    otp,
    expiresAt,
  });
}

export async function verifyOTP(
  email: string,
  purpose: "email_verification" | "password_reset",
  otp: string
): Promise<boolean> {
  const record = await OTPModel.findOne({
    email: email.toLowerCase(),
    purpose,
    otp,
    expiresAt: { $gt: new Date() },
  });

  if (!record) return false;
  
  // Delete OTP after successful verification
  await OTPModel.deleteOne({ _id: record._id });
  return true;
}

export async function resendAllowed(
  _email: string,
  _purpose: string
): Promise<boolean> {
  // Implement rate-limiting if needed
  return true;
}
