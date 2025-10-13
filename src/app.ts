import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import { createClient } from "redis";
import { errorHandler } from "./middleware/error.middleware.js";
import { EmailService } from "./services/email.service.js";
import { AuthController } from "./api/v1/controllers/auth.controller.js";
import { Authentication } from "./middleware/auth.middleware.js";
import { AuthService } from "./services/auth.service.js";
import { RedisCacheService } from "./types/common.type.js";
import { Logger } from "./utils/logger.js";
import { AuthRoutes } from "./api/v1/routes/auth.route.js";
import { QuizService } from "./services/quiz.service.js";
import { QuizController } from "./api/v1/controllers/quiz.controller.js";
import { QuizRoutes } from "./api/v1/routes/quiz.route.js";
import { UserService } from "./services/user.service.js";
import { UserController } from "./api/v1/controllers/user.controller.js";
import { UserRoutes } from "./api/v1/routes/user.route.js";
import { swaggerUi, swaggerSpec } from "./swagger.js";
import { AppError } from "./models/error.model.js";

export const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    // origin: process.env.ORIGIN_LINK || "http://192.168.0.194:8080",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export let caching: unknown;
if (process.env.CACHE_LINK) {
  caching = await createClient({
    url: process.env.CACHE_LINK,
  })
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();
} else {
  console.error(`No cache link provided`);
  process.exit(1);
}
if (
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASS ||
  !process.env.EMAIL_FROM
) {
  console.error(`You have to specifie email data to use email service`);
  process.exit(1);
}
const emailService: EmailService = new EmailService(
  process.env.EMAIL_USER,
  process.env.EMAIL_PASS,
  process.env.EMAIL_FROM
);
export const logger: Logger = new Logger();
const auth: Authentication = new Authentication(
  process.env.JWT_SECRET || "",
  logger,
  caching as RedisCacheService
);

//AUTH
const authService: AuthService = new AuthService(
  logger,
  auth,
  caching as RedisCacheService,
  emailService
);
const authController: AuthController = new AuthController(logger, authService);
const authRoutes: AuthRoutes = new AuthRoutes(authController, auth);

//QUIZ
const quizService: QuizService = new QuizService(
  logger,
  caching as RedisCacheService
);
const quizController: QuizController = new QuizController(logger, quizService);
const quizRoutes: QuizRoutes = new QuizRoutes(quizController, auth);

//USER
const userService: UserService = new UserService(
  logger,
  caching as RedisCacheService,
  emailService,
  auth
);
const userController: UserController = new UserController(
  logger,
  userService,
  auth
);
const userRoutes: UserRoutes = new UserRoutes(userController, auth);

//USE
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/health", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const dbConnected = mongoose.connection.readyState === 1;
    if (!dbConnected) {
      throw new AppError(
        503,
        "Database",
        "Database is not connected to an app"
      );
    }
    const memoryUsage = process.memoryUsage();
    const memoryMB = {
      rss: (memoryUsage.rss / 1024 / 1024).toFixed(2),
      heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
    };
    res.status(200).json({
      succes: true,
      data: {
        dbConnected: true,
        memoryMB,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use(authRoutes.router);
app.use(quizRoutes.router);
app.use(userRoutes.router);
app.use(errorHandler);
