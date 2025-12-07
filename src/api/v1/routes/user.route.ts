import { Authentication } from "../../../middleware/auth.middleware.js";
import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { ValidationMiddleware } from "../../../middleware/validation.middleware.js";
import {
  changePasswordUser,
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
     *       - in: header
     *         name: Authorization
     *         required: true
     *         schema:
     *           type: string
     *         description: Bearer token
     *     responses:
     *       200:
     *         description: User retrieved successfully
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
     *                           example: "1234567890abcdef12345678"
     *                         firstname:
     *                           type: string
     *                           example: "Alice"
     *                         lastname:
     *                           type: string
     *                           example: "Doe"
     *                         email:
     *                           type: string
     *                           example: "alicedoe@mail.com"
     *                         isActivated:
     *                           type: boolean
     *                           example: true
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     */
    this.router.get(
      "/api/v1/users/:userId",
      this.auth.verify,
      ValidationMiddleware.validate(userId, "params"),
      this.userController.getUserById
    );

    /**
     * @swagger
     * /api/v1/users/{userId}/sessions:
     *   post:
     *     summary: Join a quiz session
     *     tags: [User]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
     *       - in: header
     *         name: Authorization
     *         required: true
     *         schema:
     *           type: string
     *         description: Bearer token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - code
     *             properties:
     *               code:
     *                 type: string
     *                 example: "123456"
     *                 description: Quiz session code
     *     responses:
     *       200:
     *         description: Successfully joined quiz session
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
     *                     session:
     *                       type: object
     *                       properties:
     *                         _id:
     *                           type: string
     *                           example: "1234567890abcdef12345678"
     *                         quizId:
     *                           type: string
     *                           example: "1234567890abcdef12345678"
     *                         code:
     *                           type: string
     *                           example: "123456"
     *       400:
     *         description: Invalid session code
     *       401:
     *         description: Unauthorized
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
     *     summary: Load questions for quiz session
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
     *       - in: header
     *         name: Authorization
     *         required: true
     *         schema:
     *           type: string
     *         description: Bearer token
     *     responses:
     *       200:
     *         description: Quiz session data retrieved successfully
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
     *                     session:
     *                       type: object
     *                       properties:
     *                         _id:
     *                           type: string
     *                           example: "1234567890abcdef12345678"
     *                         userId:
     *                           type: string
     *                           example: "1234567890abcdef12345678"
     *                         quizId:
     *                           type: string
     *                           example: "1234567890abcdef12345678"
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
     *                               example: "1234567890abcdef12345678"
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
     *                                     example: "1234567890abcdef12345678"
     *                                   answer:
     *                                     type: string
     *                                     example: "A"
     *                     questions:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           _id:
     *                             type: string
     *                             example: "1234567890abcdef12345678"
     *                           question:
     *                             type: string
     *                             example: "What is the capital of France?"
     *                           options:
     *                             type: array
     *                             items:
     *                               type: string
     *                             example: ["Paris", "London", "Berlin", "Madrid"]
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Session not found
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
     *       - in: header
     *         name: Authorization
     *         required: true
     *         schema:
     *           type: string
     *         description: Bearer token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - answers
     *             properties:
     *               answers:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     questionId:
     *                       type: string
     *                       example: "1234567890abcdef12345678"
     *                     answer:
     *                       type: string
     *                       example: "A"
     *                 example:
     *                   - questionId: "1234567890abcdef12345678"
     *                     answer: "A"
     *                   - questionId: "1234567890abcdef12345679"
     *                     answer: "B"
     *     responses:
     *       204:
     *         description: Answers submitted successfully
     *       400:
     *         description: Invalid request body
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Session not found
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
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
     *       - in: header
     *         name: Authorization
     *         required: true
     *         schema:
     *           type: string
     *         description: Bearer token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - oldPassword
     *               - newPassword
     *               - confirmPassword
     *             properties:
     *               oldPassword:
     *                 type: string
     *                 example: "My$ecure55"
     *                 description: Current password
     *               newPassword:
     *                 type: string
     *                 example: "My$ecure54"
     *                 description: New password
     *               confirmPassword:
     *                 type: string
     *                 example: "My$ecure54"
     *                 description: Confirmation of new password
     *     responses:
     *       204:
     *         description: Password changed successfully
     *       400:
     *         description: Invalid request body or password mismatch
     *       401:
     *         description: Unauthorized or incorrect old password
     *       404:
     *         description: User not found
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
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
     *       - in: header
     *         name: Authorization
     *         required: true
     *         schema:
     *           type: string
     *         description: Bearer token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - password
     *             properties:
     *               password:
     *                 type: string
     *                 example: "My$ecure55"
     *                 description: Current password for confirmation
     *     responses:
     *       204:
     *         description: User account deleted successfully
     *       400:
     *         description: Invalid request body
     *       401:
     *         description: Unauthorized or incorrect password
     *       404:
     *         description: User not found
     */
    // this.router.delete(
    //   "/api/v1/users/:userId",
    //   this.auth.verify,
    //   ValidationMiddleware.validate(userId, "params"),
    //   ValidationMiddleware.validate(deleteUser),
    //   this.userController.deleteUser
    // );

    /**
     * @swagger
     * /api/v1/users/{userId}:
     *   put:
     *     summary: Update user account information
     *     tags: [User]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
     *       - in: header
     *         name: Authorization
     *         required: true
     *         schema:
     *           type: string
     *         description: Bearer token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - firstname
     *               - lastname
     *               - email
     *             properties:
     *               firstname:
     *                 type: string
     *                 example: "Joe"
     *                 description: User's first name
     *               lastname:
     *                 type: string
     *                 example: "Doe"
     *                 description: User's last name
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "joedoe@mail.com"
     *                 description: User's email address
     *     responses:
     *       204:
     *         description: User information updated successfully
     *       400:
     *         description: Invalid request body or email format
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     *       409:
     *         description: Email already exists
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
     *     summary: Get quiz session results
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
     *       - in: header
     *         name: Authorization
     *         required: true
     *         schema:
     *           type: string
     *         description: Bearer token
     *     responses:
     *       200:
     *         description: Quiz results retrieved successfully
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
     *                     results:
     *                       type: object
     *                       properties:
     *                         score:
     *                           type: number
     *                           example: 85
     *                           description: User's score as a percentage
     *                         totalQuestions:
     *                           type: number
     *                           example: 10
     *                           description: Total number of questions in the quiz
     *                         correctAnswers:
     *                           type: number
     *                           example: 8
     *                           description: Number of correct answers
     *                         completedAt:
     *                           type: string
     *                           format: date-time
     *                           example: "2025-06-18T10:30:00Z"
     *                           description: Timestamp when quiz was completed
     *                         ranking:
     *                           type: number
     *                           example: 2
     *                           description: User's ranking in the session
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Session or results not found
     */
    this.router.get(
      "/api/v1/users/:userId/sessions/:sessionId/results",
      this.auth.verify,
      ValidationMiddleware.validate(sessionId, "params"),
      this.userController.getResult
    );
  }
}
