import { Router } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
import { rateLimit } from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller.js";
import { ValidationMiddleware } from "../../../middleware/validation.middleware.js";
import {
  registerUser,
  loginUser,
  passwordUser,
  emailUser,
  token,
} from "../../../schemas/user.schema.js";
import { Authentication } from "../../../middleware/auth.middleware.js";
export class AuthRoutes {
  private readonly rateLimit: RateLimitRequestHandler = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        description: "Too many requests, please try again in 5 minutes.",
      },
    },
  });

  constructor(
    private authController: AuthController,
    private auth: Authentication,
    public router: Router = Router()
  ) {
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    /**
     * @swagger
     * /api/v1/auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *             properties:
     *               firstname:
     *                 type: string
     *                 example: Joe
     *               lastname:
     *                 type: string
     *                 example: Doe
     *               email:
     *                 type: string
     *                 example: jode@mail.com
     *               password:
     *                 type: string
     *                 example: Password123!
     *               confirmPassword:
     *                 type: string
     *                 example: Password123!
     *     responses:
     *       200:
     *         description: User
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       type: object
     *                       properties:
     *                         _id:
     *                           type: string
     *                           example: 1234567890abcdef12345678
     *                         firstname:
     *                           type: string
     *                           example: Joe
     *                         lastname:
     *                           type: string
     *                           example: Doe
     *                         email:
     *                           type: string
     *                           example: joedoe@mail.com
     *                         isActivated:
     *                           type: boolean
     *                           example: false
     *                         createdAt:
     *                           type: string
     *                           example: 2023-10-01T12:00:00.000Z
     *                         updatedAt:
     *                           type: string
     *                           example: 2023-10-01T12:00:00.000Z
     *                         password:
     *                           type: string
     *                           example: dn723udgh297380dg32pdjasidhb97823
     */
    this.router.post(
      "/api/v1/auth/register",
      this.rateLimit,
      ValidationMiddleware.validate(registerUser, "body"),
      this.authController.registerUser
    );
    /**
     * @swagger
     * /api/v1/auth/login:
     *   post:
     *     summary: Login a user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *             properties:
     *               email:
     *                 type: string
     *                 example: jode@mail.com
     *               password:
     *                 type: string
     *                 example: Password123!
     *     responses:
     *       200:
     *         description: User
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     token:
     *                       type: string
     *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     */
    this.router.post(
      "/api/v1/auth/login",
      this.rateLimit,
      ValidationMiddleware.validate(loginUser, "body"),
      this.authController.loginUser
    );
    /**
     * @swagger
     * /api/v1/auth/check:
     *   get:
     *     summary: Verify user login
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: User
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                           example: 1234567890abcdef12345678
     *                         firstname:
     *                           type: string
     *                           example: Joe
     *                         lastname:
     *                           type: string
     *                           example: Doe
     */
    this.router.get(
      "/api/v1/auth/check",
      this.auth.verify,
      this.authController.checkUser
    );
    /**
     * @swagger
     * /api/v1/auth/logout:
     *   post:
     *     summary: Logout a user
     *     tags: [Auth]
     *     responses:
     *       204:
     *         description: No Content
     */
    this.router.post(
      "/api/v1/auth/logout",
      this.auth.blacklist,
      this.authController.logoutUser
    );
    /**
     * @swagger
     * /api/v1/auth/reset-password:
     *   post:
     *     summary: Send email to reset password
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *             properties:
     *               email:
     *                 type: string
     *                 example: jode@mail.com
     *     responses:
     *       204:
     *         description: No Content
     */
    this.router.post(
      "/api/v1/auth/reset-password",
      this.rateLimit,
      ValidationMiddleware.validate(emailUser, "body"),
      this.authController.sendEmailToResetPassword
    );
    /**
     * @swagger
     * /api/v1/auth/reset-password/{token}:
     *   get:
     *     summary: Reset user password
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *             properties:
     *               password:
     *                 type: string
     *                 example: My$ecure55
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Token for password reset
     *     responses:
     *       204:
     *         description: No Content
     */
    this.router.post(
      "/api/v1/auth/reset-password/:token",
      ValidationMiddleware.validate(token, "params"),
      ValidationMiddleware.validate(passwordUser, "body"),
      this.authController.resetPassword
    );
    /**
     * @swagger
     * /api/v1/auth/activate/{token}:
     *   get:
     *     summary: Activate user account
     *     tags: [Auth]
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Token for account activation
     *     responses:
     *       204:
     *         description: No Content
     */
    this.router.get(
      "/api/v1/auth/activate/:token",
      ValidationMiddleware.validate(token, "params"),
      this.authController.activateUser
    );
  }
}
