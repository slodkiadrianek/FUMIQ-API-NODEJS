import { Authentication } from "../../../middleware/auth.middleware.js";
import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { ValidationMiddleware } from "../../../middleware/validation.middleware.js";
import {
  changePasswordUser,
  deleteUser,
  updateUser,
  userId,
} from "../../../schemas/user.schema.js";
import { code, sessionId } from "../../../schemas/session.schema.js";
export class UserRoutes {
  constructor(
    private userController: UserController,
    private auth: Authentication,
    public router: Router = Router()
  ) {
    this.initializeRoutes();
  }
  protected initializeRoutes(): void {
    /**
     * @swagger
     * /api/v1/users/{userId}:
     *   get:
     *     summary: Get user by ID
     *     tags: [User]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
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
     *                          type: string
     *                          example: 1234567890abcdef12345678
     *                         firstname:
     *                           type: string
     *                           example: Alice
     *                         lastname:
     *                           type: string
     *                           example: Doe
     *                         email:
     *                           type: string
     *                           example: alicedoe@mail.com
     *                         password:
     *                           type: string
     *                           example: 39vh04783yh0rfhdfjn2p98d23h9f
     *                         isActivated:
     *                           type: boolean
     *                           example: true
     */
    this.router.get(
      "/api/v1/users/:userId",
      this.auth.verify,
      ValidationMiddleware.validate(userId, "params"),
      this.userController.getUserById
    );
    /**
     * @swagger
     * /api/v1/users/{userId}/sessions/:
     *   post:
     *     summary: Join a quiz
     *     tags: [User]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - firstName
     *               - email
     *             properties:
     *               code:
     *                 type: string
     *                 example: 123456
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
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
     *                     quiz:
     *                       type: object
     *                       properties:
     *                         _id:
     *                          type: string
     *                          example: 1234567890abcdef12345678
     *
     */
    this.router.post(
      "/api/v1/users/:userId/sessions/",
      this.auth.verify,
      ValidationMiddleware.validate(userId, "params"),
      ValidationMiddleware.validate(code),
      this.userController.joinQuiz
    );
    /**
     * @swagger
     * /api/v1/users/{userId}/sessions/{sessionId}:
     *   get:
     *     summary: Load questions for quiz
     *     tags: [User]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
     *       - in: path
     *         name: sessionId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the session
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
     *                     quiz:
     *                       type: object
     *                       properties:
     *                         _id:
     *                           type: string
     *                           example: 1234567890abcdef12345678
     *                         userId:
     *                           type: string
     *                           example: 1234567890abcdef12345678
     *                         quizId:
     *                           type: string
     *                           example: 1234567890abcdef12345678
     *                         code:
     *                           type: string
     *                           example: "123456"
     *                         isActive:
     *                           type: boolean
     *                           example: true
     *                         competitor:
     *                           type: object
     *                           properties:
     *                             userId:
     *                               type: string
     *                               example: 1234567890abcdef12345678
     *                             finished:
     *                               type: boolean
     *                               example: false
     *                             answers:
     *                               type: array
     *                               items:
     *                                 type: object
     *                                 properties:
     *                                   questionId:
     *                                     type: string
     *                                     example: 1234567890abcdef12345678
     *                                   answer:
     *                                     type: string
     *                                     example: "A"
     *                         competitors:
     *                           type: array
     *                           items:
     *                             type: object
     */
    this.router.get(
      "/api/v1/users/:userId/sessions/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(sessionId, "params"),
      this.userController.getQuestions
    );
    /**
     * @swagger
     * /api/v1/users/{userId}/sessions/{sessionId}:
     *   patch:
     *     summary: Submit quiz answers
     *     tags: [User]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
     *       - in: path
     *         name: sessionId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the session
     *     responses:
     *       204:
     *         description: No Content
     *
     */
    this.router.patch(
      "/api/v1/users/:userId/sessions/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(sessionId, "params"),
      this.userController.submitQuiz
    );
    /**
     * @swagger
     * /api/v1/users/{userId}:
     *   patch:
     *     summary: Change user password
     *     tags: [User]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *             properties:
     *               oldPassword:
     *                 type: string
     *                 example: My$ecure55
     *               newPassword:
     *                 type: string
     *                 example: My$ecure54
     *               confirmPassword:
     *                 type: string
     *                 example: My$ecure54
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
     *     responses:
     *       204:
     *         description: No Content
     *
     */
    this.router.patch(
      "/api/v1/users/:userId",
      this.auth.verify,
      ValidationMiddleware.validate(userId, "params"),
      ValidationMiddleware.validate(changePasswordUser),
      this.userController.changePassword
    );
    /**
     * @swagger
     * /api/v1/users/{userId}:
     *   delete:
     *     summary: Delete user account
     *     tags: [User]
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
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
     *     responses:
     *       204:
     *         description: No Content
     *
     */
    this.router.delete(
      "/api/v1/users/:userId",
      this.auth.verify,
      ValidationMiddleware.validate(userId, "params"),
      ValidationMiddleware.validate(deleteUser),
      this.userController.deleteUser,
    );
    /**
     * @swagger
     * /api/v1/users/{userId}:
     *   put:
     *     summary: Update user account
     *     tags: [User]
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
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
     *     responses:
     *       204:
     *         description: No Content
     */
    this.router.put(
      "/api/v1/users/:userId",
      this.auth.verify,
      ValidationMiddleware.validate(userId, "params"),
      ValidationMiddleware.validate(updateUser),
      this.userController.updateUser
    );
    /**
     * @swagger
     * /api/v1/users/{userId}/sessions/{sessionId}/results:
     *   get:
     *     summary: Get quiz result
     *     tags: [User]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
     *       - in: path
     *         name: sessionId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the session
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
     *                     score:
     *                       type: number
     *                       example: 85
     *
     *
     */
    this.router.get(
      "/api/v1/users/:userId/sessions/:sessionId/results",
      this.auth.verify,
      ValidationMiddleware.validate(sessionId, "params"),
      this.userController.getResult
    );
  }
}
