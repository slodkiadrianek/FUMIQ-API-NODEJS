import { Logger } from "../utils/logger.js";
import { IUser, User } from "../models/user.model.js";
import { AppError } from "../models/error.model.js";
import { Authentication } from "../middleware/auth.middleware.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RedisCacheService } from "../types/common.type.js";
import { BaseService } from "./base.service.js";
import { EmailService } from "./email.service.js";

export class AuthService extends BaseService {
  constructor(
    logger: Logger,
    private auth: Authentication,
    caching: RedisCacheService,
    private emailService: EmailService
  ) {
    super(logger, caching);
    this.auth = auth;
  }
  registerUser = async (userData: Omit<IUser, "_id">): Promise<IUser> => {
    const userExist: IUser | null = await User.findOne({
      email: userData.email,
    });
    userData.password = await bcrypt.hash(userData.password, 11);
    if (userExist) {
      if (!userExist.isActivated) {
        const result: IUser = await this.updateItem<IUser>("User", userExist._id.toString(), userData, User)
        const token: string = this.auth.sign(result);
        await this.emailService.sendEmail(
          userData.email,
          "Aktywacja konta",
          `${process.env.ORIGIN_LINK}/activateUser.html?token=${token}`
        );
        return result
      } else {
        this.logger.error("User with this email already exists");
        throw new Error('User with this email already exist');
      }
    }
    const result: IUser = await this.insertToDatabaseAndCache(
      "User",
      userData,
      User
    );
    const token: string = this.auth.sign(result);
    await this.emailService.sendEmail(
      userData.email,
      "Aktywacja konta",
      `${process.env.ORIGIN_LINK}/activateUser.html?token=${token}`
    );
    return result;
  };
  loginUser = async (
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> => {
    const userExist: IUser | null = await User.findOne({
      email,
    });
    if (!userExist) {
      throw new AppError(404, "User", "User with this email does not exist");
    }
    const passwordComparison = await bcrypt.compare(
      password,
      userExist.password
    );
    if (!passwordComparison) {
      throw new AppError(401, "User", "User password is incorrect");
    }
    if (!userExist.isActivated) {
      const token: string = this.auth.sign(userExist);
      await this.emailService.sendEmail(
        userExist.email,
        "Aktywacja konta",
        `http://${process.env.SERVER_IP}:3000/api/v1/auth/activate/${token}`
      );
      throw new AppError(
        401,
        "User",
        "You have to activate your account. A new email has been sent."
      );
    }
    const token = this.auth.sign(userExist);
    return { user: userExist, token };
  };

  sendEmailToResetPassword = async (email: string): Promise<void> => {
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      throw new AppError(400, "User", "No user found with that email address");
    }
    const token: string = this.auth.sign(user);
    await this.emailService.sendEmail(
      email,
      "Password change",
      `${process.env.ORIGIN_LINK}/newPassword.html?token=${token}`
    );
    return;
  };
  resetPassword = async (token: string, password: string): Promise<IUser> => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
    const user: IUser | null = await User.findOne({
      email: (decoded as { user: { email: string } }).user.email,
    });
    if (!user) {
      throw new AppError(400, "User", "Invalid token or user not found");
    }
    user.password = await bcrypt.hash(password, 12);
    await user.save();
    return user;
  };
  activateUser = async (token: string): Promise<IUser> => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
    const user: IUser | null = await User.findOne({
      email: (decoded as { user: { email: string } }).user.email,
    });
    if (!user) {
      throw new AppError(400, "User", "Invalid token or user not found");
    }
    user.isActivated = true;
    await user.save();
    return user;
  };
}
