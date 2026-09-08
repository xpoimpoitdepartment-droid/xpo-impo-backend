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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const http_status_codes_1 = require("http-status-codes");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const handleAppError_1 = __importDefault(require("../../errors/handleAppError"));
const email_service_1 = require("../../utils/email.service");
const generate_otp_1 = require("../../utils/generate.otp");
const otp_service_1 = require("../otp/otp.service");
const user_model_1 = require("../user/user.model");
const registerUserOnDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const role = payload.role || "customer";
    if (role !== "sr" && !payload.email) {
        throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, "Email is required");
    }
    const email = (_a = payload.email) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
    // ✅ Check if user already exists
    if (email) {
        const existing = yield user_model_1.UserModel.findOne({ email });
        if (existing) {
            throw new Error("Email already registered");
        }
    }
    if (role === "sr" && payload.contactNo) {
        const existingMobile = yield user_model_1.UserModel.findOne({
            contactNo: payload.contactNo.trim(),
        });
        if (existingMobile) {
            throw new Error("Mobile number already registered");
        }
    }
    // Only sales representatives need admin approval. All other roles can log in
    // immediately after registration.
    const status = role === "sr" ? "pending" : "active";
    // ✅ Hash password
    if (!(payload === null || payload === void 0 ? void 0 : payload.password)) {
        throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, "Password is required");
    }
    // ✅ Create user with default isEmailVerified = true (Disabled email verification)
    const userData = Object.assign(Object.assign({}, payload), { contactNo: (_b = payload.contactNo) === null || _b === void 0 ? void 0 : _b.trim(), email,
        role,
        status, isEmailVerified: true });
    const user = yield user_model_1.UserModel.create(userData);
    // ✅ Generate and store OTP (Disabled as per request)
    // const otp = generateOTP();
    // await storeOTP(
    //   email,
    //   "email_verification",
    //   otp,
    //   Number(process.env.OTP_TTL_SECONDS || 300)
    // );
    // ✅ Send verification email (Disabled)
    // await sendEmailVerification(email, otp);
    // ✅ Return user + info
    return {
        user,
    };
});
const verifyEmailOnDB = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    // ✅ Verify OTP from stored records
    const ok = yield (0, otp_service_1.verifyOTP)(email, "email_verification", otp);
    if (!ok) {
        throw new Error("Invalid or expired OTP");
    }
    // ✅ Update user's email verification status
    yield user_model_1.UserModel.updateOne({ email: email.toLowerCase() }, { $set: { isEmailVerified: true } });
    return {
        message: "Email has been verified successfully.",
    };
});
/**
 * Login a user using email/password
 */
const loginUserFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const query = payload.email
        ? { email: payload.email.trim().toLowerCase() }
        : { contactNo: (_a = payload.contactNo) === null || _a === void 0 ? void 0 : _a.trim() };
    if (!payload.email && !payload.contactNo) {
        throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, "Email or Mobile Number is required");
    }
    const isUserExists = yield user_model_1.UserModel.findOne(query).select("+password");
    if (!isUserExists) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "User does not exist!");
    }
    if (!(isUserExists === null || isUserExists === void 0 ? void 0 : isUserExists.password)) {
        throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, "This account is registered via Google login. Please use Google login.");
    }
    if (!(payload === null || payload === void 0 ? void 0 : payload.password)) {
        throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, "Password is required");
    }
    const isPasswordMatched = yield bcrypt_1.default.compare(payload.password, isUserExists.password);
    if (!isPasswordMatched) {
        throw new handleAppError_1.default(http_status_1.default.UNAUTHORIZED, "Wrong Credentials!");
    }
    // Only SR accounts remain pending until an admin approves them. This also
    // activates older non-SR accounts that were created under the old rule.
    if (isUserExists.status === "pending" && isUserExists.role === "sr") {
        throw new handleAppError_1.default(http_status_1.default.UNAUTHORIZED, "Your account is under review. Please wait for approval.");
    }
    if (isUserExists.status === "blocked") {
        throw new handleAppError_1.default(http_status_1.default.FORBIDDEN, "Your account is blocked. Contact support.");
    }
    // Update status to active on successful login
    const user = yield user_model_1.UserModel.findByIdAndUpdate(isUserExists._id, { status: "active" }, { new: true });
    return user;
});
/**
 * Login or register user via external providers (e.g. Google)
 */
const loginUserUsingProviderFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExists = yield user_model_1.UserModel.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
    if (!isUserExists) {
        // New user - create with 'sr' role for admin panel access
        const role = payload.role || "sr";
        const status = role === "sr" ? "pending" : "active";
        const result = yield user_model_1.UserModel.create(Object.assign(Object.assign({}, payload), { role, status }));
        const jwtPayload = {
            userId: result._id,
            email: result.email,
            role: result.role,
        };
        const token = jsonwebtoken_1.default.sign(jwtPayload, config_1.default.jwt_access_secret, {
            expiresIn: "24h",
        });
        return {
            user: result,
            accessToken: token,
        };
    }
    // Existing user - check role
    if (isUserExists.role === "customer") {
        throw new handleAppError_1.default(http_status_1.default.FORBIDDEN, "This account is registered as a customer. Please use the customer portal to login.");
    }
    // Check existing user's status before allowing login
    if (isUserExists.status === "pending" && isUserExists.role === "sr") {
        throw new handleAppError_1.default(http_status_1.default.UNAUTHORIZED, "Your account is under review. Please wait for approval.");
    }
    if (isUserExists.status === "blocked") {
        throw new handleAppError_1.default(http_status_1.default.FORBIDDEN, "Your account is blocked. Contact support.");
    }
    const user = yield user_model_1.UserModel.findByIdAndUpdate(isUserExists._id, { status: "active" }, { new: true });
    if (!user) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "User not found after update");
    }
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    };
    const token = jsonwebtoken_1.default.sign(jwtPayload, config_1.default.jwt_access_secret, {
        expiresIn: "24h",
    });
    return {
        user,
        accessToken: token,
    };
});
/**
 * Logout user and mark as inactive
 */
const logoutUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.UserModel.findByIdAndUpdate(id, { status: "inactive" }, { new: true });
    return {};
});
/**
 * 🔹 Resend OTP for email verification
 */
const resendOtp = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = (0, generate_otp_1.generateOTP)();
    yield (0, otp_service_1.storeOTP)(email, "email_verification", otp, Number(process.env.OTP_TTL_SECONDS || 300));
    yield (0, email_service_1.sendEmailVerification)(email, otp);
    return { message: "OTP resent successfully!" };
});
/**
 * 🔹 Forgot Password - generate OTP for password reset
 */
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
        return { message: "If account exists, OTP sent" }; // Prevent user enumeration
    }
    const otp = (0, generate_otp_1.generateOTP)();
    yield (0, otp_service_1.storeOTP)(email, "password_reset", otp, Number(process.env.OTP_TTL_SECONDS || 300));
    yield (0, email_service_1.sendPasswordResetOTP)(email, otp);
    return { message: "OTP sent successfully!" };
});
/**
 * 🔹 Reset password using OTP
 */
const resetPasswordWithOtp = (email, otp, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const ok = yield (0, otp_service_1.verifyOTP)(email, "password_reset", otp);
    if (!ok)
        throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired OTP");
    const hash = yield bcrypt_1.default.hash(newPassword, 10);
    yield user_model_1.UserModel.updateOne({ email: email.toLowerCase() }, { password: hash, tokenVersion: Date.now() });
    return { message: "Password updated successfully!" };
});
/**
 * 🔹 Reset password when logged in (no OTP)
 */
const resetPasswordLoggedIn = (userId, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = yield bcrypt_1.default.hash(newPassword, 10);
    yield user_model_1.UserModel.updateOne({ _id: userId }, { password: hash, tokenVersion: Date.now() });
    return { message: "Password updated successfully!" };
});
/**
 * Get current user info using decoded JWT
 */
const getMe = (decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const me = yield user_model_1.UserModel.findById(decodedUser.userId).select("-password");
    if (!me) {
        throw new handleAppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
    }
    return me;
});
exports.AuthServices = {
    registerUserOnDB,
    loginUserFromDB,
    logoutUserFromDB,
    loginUserUsingProviderFromDB,
    getMe,
    resendOtp,
    forgotPassword,
    resetPasswordWithOtp,
    resetPasswordLoggedIn,
    verifyEmailOnDB,
};
