"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeOTP = storeOTP;
exports.verifyOTP = verifyOTP;
exports.resendAllowed = resendAllowed;
const otp_model_1 = require("./otp.model");
function storeOTP(email, purpose, otp, ttlSec) {
    return __awaiter(this, void 0, void 0, function* () {
        const expiresAt = new Date(Date.now() + ttlSec * 1000);
        // Delete any existing OTP for this email/purpose
        yield otp_model_1.OTPModel.deleteMany({
            email: email.toLowerCase(),
            purpose
        });
        // Store new OTP
        yield otp_model_1.OTPModel.create({
            email: email.toLowerCase(),
            purpose,
            otp,
            expiresAt,
        });
    });
}
function verifyOTP(email, purpose, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        const record = yield otp_model_1.OTPModel.findOne({
            email: email.toLowerCase(),
            purpose,
            otp,
            expiresAt: { $gt: new Date() },
        });
        if (!record)
            return false;
        // Delete OTP after successful verification
        yield otp_model_1.OTPModel.deleteOne({ _id: record._id });
        return true;
    });
}
function resendAllowed(_email, _purpose) {
    return __awaiter(this, void 0, void 0, function* () {
        // Implement rate-limiting if needed
        return true;
    });
}
