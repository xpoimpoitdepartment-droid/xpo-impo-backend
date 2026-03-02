import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    purpose: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTPModel = mongoose.model("OTP", otpSchema);

const otpLogSchema = new Schema(
  {
    email: { type: String, index: true },
    purpose: { type: String },
    sentAt: { type: Date, default: Date.now },
    ip: String,
    success: Boolean,
  },
  { timestamps: true }
);

export const OTPLogModel = mongoose.model("OTPLog", otpLogSchema);
