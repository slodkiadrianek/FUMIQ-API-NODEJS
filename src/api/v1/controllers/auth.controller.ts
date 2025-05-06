import { NextFunction, Response, Request } from "express";
import { Logger } from "../../../utils/logger.js";
import { IUser } from "../../../models/user.model.js";
import { AuthService } from "../../../services/auth.service.js";
import { CustomRequest } from "../../../types/common.type.js";

export class AuthController {
  private logger: Logger;
  private authService: AuthService;
  constructor(logger: Logger, authService: AuthService) {
    this.logger = logger;
    this.authService = authService;
  }
  registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { firstname, lastname, email, password } = req.body as {
        firstname: string;
        lastname: string;
        email: string;
        password: string;
      };
      this.logger.info(`Attempting to register new user`, { email });
      const isActivated: boolean = false;
      const result: IUser = await this.authService.registerUser({
        firstname,
        lastname,
        email,
        password,
        isActivated,
      } as Omit<IUser, "_id">);
      this.logger.info(`User succesfully created`, {
        userId: result._id,
      });
      res.status(201).json({
        success: true,
        data: {
          user: result,
        },
      });
      return;
    } catch (err) {
      next(err);
    }
  };
  checkUser = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: (req as CustomRequest).user.id,
          firstname: (req as CustomRequest).user.firstname,
          lastname: (req as CustomRequest).user.lastname,
        },
      },
    });
  };
  loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };
      this.logger.info("Attempting to login user", { email });
      const result: { user: IUser; token: string } =
        await this.authService.loginUser(email, password);
      this.logger.info("User succesfully logged", {
        userId: result.user._id,
      });
      res.status(200).json({
        success: true,
        data: {
          token: result.token,
        },
      });
    } catch (err) {
      next(err);
    }
  };
  logoutUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      this.logger.info("Trying to logout user");
      res.status(204).send();
      return;
    } catch (error) {
      next(error);
    }
  };
  sendEmailToResetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email } = req.body as { email: string };
      this.logger.info("Attempt to send email with reset password link");
      await this.authService.sendEmailToResetPassword(email);
      this.logger.info("Email sent successfully");
      res.status(201).send();
      return;
    } catch (error) {
      next(error);
    }
  };
  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token } = req.params as { token: string };
      const { password } = req.body as { password: string };
      this.logger.info("Attempting to change password");
      await this.authService.resetPassword(token, password);
      this.logger.info("Password changed succesfully", { token });
      res.status(204).send();
      return;
    } catch (error) {
      next(error);
    }
  };
  activateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token } = req.params as { token: string };
      this.logger.info("Attempting to activate user");
      const result: IUser = await this.authService.activateUser(token);
      this.logger.info("User activated", { token });
      res.status(204).send();
      return;
    } catch (error) {
      next(error);
    }
  };
}
