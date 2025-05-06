import { Request, Response, NextFunction } from "express";
import { UserService } from "../../../services/user.service.js";
import { Logger } from "../../../utils/logger.js";
import { IUser } from "../../../models/user.model.js";
import { Authentication } from "../../../middleware/auth.middleware.js";

export class UserController {
  constructor(
    private logger: Logger,
    private userService: UserService,
    private authenticator: Authentication
  ) {}

  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      this.logger.info(`Attempting to get user information`, { userId });
      const result: IUser = await this.userService.getUserById(userId);
      this.logger.info("User data downloaded", { result });
      res.status(200).json({
        success: true,
        data: {
          user: result,
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  };
  joinQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const code = req.body.code as string;
      const userId = req.params.userId as string;
      this.logger.info(`Attempting to join quiz with code ${code}`);
      const result: string = await this.userService.joinQuiz(userId, code);
      this.logger.info(`User joined quiz with code ${code}`);
      res.status(200).json({
        success: true,
        data: {
          quiz: {
            _id: result,
          },
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  };
  getQuestions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId: string = req.params.userId;
      const sessionId: string = req.params.sessionId;
      this.logger.info(`Attempting get questions for quiz`, { userId });
      const result = await this.userService.getQuestions(sessionId, userId);
      this.logger.info(`Quiz loaded successfully`, { result });
      res.status(200).json({
        success: true,
        data: {
          quiz: result,
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  };
  submitQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId: string = req.params.userId;
      const sessionId: string = req.params.sessionId;
      this.logger.info(`Attempting to end test`, { userId, sessionId });
      await this.userService.endQuiz(userId, sessionId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId: string = req.params.userId;
      const oldPassword: string = req.body.oldPassword;
      const newPassword: string = req.body.newPassword;
      this.logger.info("Attempting to change password", { userId });
      await this.userService.changePassword(userId, oldPassword, newPassword);
      this.logger.info("Password changed successfully", { userId });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
  deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId: string = req.params.userId;
      const password: string = req.body.password;
      this.logger.info("Attempting to delete user", { userId });
      await this.userService.deleteUser(userId, password);
      this.logger.info(`Account deleted successfully`, { userId });
      this.authenticator.blacklist(req, res, next);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
  updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId: string = req.params.userId;
      const updatedUser: Omit<IUser, "_id"> = req.body;
      this.logger.info("Attempting to update user", { userId });
      await this.userService.updateUser(userId, updatedUser);
      this.logger.info(`User updated successfully`, { userId });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
  getResult = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId: string = req.params.userId;
      const sessionId: string = req.params.sessionId;
      this.logger.info(`Attempting to get result`, { userId, sessionId });
      const result: number = await this.userService.getResult(
        userId,
        sessionId
      );
      this.logger.info(`Result loaded successfully`, { userId, sessionId });
      res.status(200).json({
        success: true,
        data: {
          score: result,
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  };
}
