"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidations = void 0;
const zod_1 = __importDefault(require("zod"));
const registerUser = zod_1.default.object({
    name: zod_1.default
        .string()
        .min(1, "Name is required to create a user!")
        .max(40, "Name must be less than 40 characters!"),
    email: zod_1.default
        .string()
        .email("Invalid email format!")
        .max(50, "Email must be less than 50 characters!")
        .optional(),
    contactNo: zod_1.default.string().optional(),
    role: zod_1.default.string().optional(),
    address: zod_1.default.any().optional(),
    password: zod_1.default
        .string()
        .min(6, "Password must be at least 6 characters long!")
        .max(20, "Password must be less than 20 characters!"),
}).refine(data => {
    if (data.role !== 'sr' && !data.email) {
        return false;
    }
    return true;
}, {
    message: "Email is required for non-SR users",
    path: ["email"]
});
const loginUser = zod_1.default.object({
    email: zod_1.default
        .string()
        .email("Invalid email format!")
        .max(50, "Email must be less than 50 characters!")
        .optional(),
    contactNo: zod_1.default.string().optional(),
    password: zod_1.default
        .string()
        .min(6, "Password must be at least 6 characters long!")
        .max(20, "Password must be less than 20 characters!"),
}).refine(data => data.email || data.contactNo, {
    message: "Email or Mobile Number is required",
    path: ["email"]
});
const loginUserUsingProvider = zod_1.default.object({
    name: zod_1.default
        .string()
        .min(1, "Name is required to create a user!")
        .max(40, "Name must be less than 40 characters!"),
    email: zod_1.default
        .string()
        .email("Invalid email format!")
        .min(1, "Email is required to create a user!")
        .max(50, "Email must be less than 50 characters!"),
});
// OTP and Password Reset Validators
const otpSchema = zod_1.default.object({
    email: zod_1.default.email(),
    otp: zod_1.default.string().length(6),
});
//OTP Resend Validators
const resendOtpSchema = zod_1.default.object({
    email: zod_1.default.email(),
});
//Reset Password Validators
const resetPasswordSchema = zod_1.default.object({
    email: zod_1.default.email(),
    otp: zod_1.default.string().length(6),
    newPassword: zod_1.default.string().min(8),
});
exports.AuthValidations = {
    registerUser,
    loginUser,
    loginUserUsingProvider,
    otpSchema,
    resendOtpSchema,
    resetPasswordSchema,
};
