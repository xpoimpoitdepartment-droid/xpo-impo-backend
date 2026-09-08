import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/handleAppError";
import { TUserRole } from "../modules/user/user.interface";
import { UserModel } from "../modules/user/user.model";
import catchAsync from "../utils/catchAsync";

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token = "";
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      console.error("Auth Middleware: No token found in headers or cookie.");
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized !");
    }

    let decoded = {} as JwtPayload;
    try {
      decoded = jwt.verify(
        token as string,
        config.jwt_access_secret as string
      ) as JwtPayload;
    } catch (error: any) {
      console.error("Auth Middleware: JWT Verification Failed -", error.message);
      throw new AppError(401, "Unauthorized !");
    }
    const role = decoded.role;

    const user = await UserModel.findOne({ email: decoded?.email });

    if (!user) {
      throw new AppError(404, "The user is not found !");
    }

    const isDeleted = String(user?.status) === "banned";
    if (isDeleted) {
      throw new AppError(400, "The user is banned !");
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized !");
    }

    req.user = decoded as JwtPayload;

    next();
  });
};

export default auth;
