import { Router } from "express";
import { ValidationMiddleware } from "../../../middleware/validation.middleware.js";
import { QuizController } from "../controllers/quiz.controller.js";
import { Authentication } from "../../../middleware/auth.middleware.js";
import {
  createQuiz,
  endQuizSession,
  quizId,
} from "../../../schemas/quiz.schema.js";
export class QuizRoutes {
  constructor(
    private quizController: QuizController,
    private auth: Authentication,
    public router: Router = Router()
  ) {
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    /**
     * @swagger
     * /api/v1/quizzes/:
     *   post:
     *     summary: Create a new quiz
     *     tags: [Quiz]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - description
     *               - timeLimit
     *               - questions
     *             properties:
     *               title:
     *                 type: string
     *                 example: TEST
     *               description:
     *                 type: string
     *                 example: TEST
     *               timeLimit:
     *                 type: number
     *                 example: 12
     *               questions:
     *                 type: array
     *                 items:
     *                   type: object
     *                   required:
     *                     - options
     *                     - questionText
     *                     - questionType
     *                   properties:
     *                     photoUrl:
     *                       type: string
     *                       format: uri
     *                       nullable: true
     *                       description: URL to a photo for the question (optional).
     *                     correctAnswer:
     *                       oneOf:
     *                         - type: string
     *                         - type: array
     *                           items:
     *                             type: string
     *                         - type: "null"
     *                       description: The correct answer, can be a string, array of strings, or null.
     *                     options:
     *                       type: array
     *                       items:
     *                         oneOf:
     *                           - type: string
     *                           - type: "null"
     *                       description: Array of possible answer options.
     *                     questionText:
     *                       type: string
     *                       description: The text of the question.
     *                     questionType:
     *                       type: string
     *                       description: The type of the question.
     *     responses:
     *       201:
     *         description: Successfully created quiz
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
     *                     _id:
     *                       type: string
     *                       example: 64f8e4b2c9d3f4a1b2c3d4e5
     *                     title:
     *                       type: string
     *                       example: TEST
     *                     description:
     *                       type: string
     *                       example: TEST
     *                     timeLimit:
     *                       type: number
     *                       example: 12
     *                     questions:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           photoUrl:
     *                             type: string
     *                             format: uri
     *                             nullable: true
     *                           correctAnswer:
     *                             oneOf:
     *                               - type: string
     *                               - type: array
     *                                 items:
     *                                   type: string
     *                               - type: "null"
     *                           options:
     *                             type: array
     *                             items:
     *                               oneOf:
     *                                 - type: string
     *                                 - type: "null"
     *                           questionText:
     *                             type: string
     *                           questionType:
     *                             type: string
     */
    this.router.post(
      "/api/v1/quizzes/",
      ValidationMiddleware.validate(createQuiz, "body"),
      this.auth.verify,
      this.quizController.createQuiz
      /**
       * @swagger
       * /api/v1/quizzes/:
       *   get:
       *     summary: Get all quizzes
       *     tags: [Quiz]
       *     responses:
       *       200:
       *         description: Quizzes retrieved successfully
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 success:
       *                   type: boolean
       *                   example: true
       *                 data:
       *                   type: array
       *                   items:
       *                     type: object
       *                     properties:
       *                       _id:
       *                         type: string
       *                         example: 64f8e4b2c9d3f4a1b2c3d4e5
       *                       title:
       *                         type: string
       *                         example: TEST
       *                       description:
       *                         type: string
       *                         example: TEST
       *                       timeLimit:
       *                         type: number
       *                         example: 12
       *                       questions:
       *                         type: array
       *                         items:
       *                           type: object
       *                           required:
       *                             - options
       *                             - questionText
       *                             - questionType
       *                           properties:
       *                             photoUrl:
       *                               type: string
       *                               format: uri
       *                               nullable: true
       *                               description: URL to a photo for the question (optional).
       *                             correctAnswer:
       *                               oneOf:
       *                                 - type: string
       *                                 - type: array
       *                                   items:
       *                                     type: string
       *                                 - type: "null"
       *                               description: The correct answer, can be a string, array of strings, or null.
       *                             options:
       *                               type: array
       *                               items:
       *                                 oneOf:
       *                                   - type: string
       *                                   - type: "null"
       *                               description: Array of possible answer options.
       *                             questionText:
       *                               type: string
       *                               description: The text of the question.
       *                             questionType:
       *                               type: string
       *                               description: The type of the question.
       */
    );
    this.router.get(
      "/api/v1/quizzes/",
      this.auth.verify,
      this.quizController.getAllQuizez
    );
    /**
     * @swagger
     * /api/v1/quizzes/{quizId}:
     *   get:
     *     summary: Get a quiz by ID
     *     tags: [Quiz]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the quiz to retrieve
     *     responses:
     *       200:
     *         description: Quiz retrieved successfully
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
     *                     _id:
     *                       type: string
     *                       example: 64f8e4b2c9d3f4a1b2c3d4e5
     *                     title:
     *                       type: string
     *                       example: TEST
     *                     description:
     *                       type: string
     *                       example: TEST
     *                     timeLimit:
     *                       type: number
     *                       example: 12
     *                     questions:
     *                       type: array
     *                       items:
     *                         type: object
     *                         required:
     *                           - options
     *                           - questionText
     *                           - questionType
     *                         properties:
     *                           photoUrl:
     *                             type: string
     *                             format: uri
     *                             nullable: true
     *                             description: URL to a photo for the question (optional).
     *                           correctAnswer:
     *                             oneOf:
     *                               - type: string
     *                               - type: array
     *                                 items:
     *                                   type: string
     *                               - type: "null"
     *                             description: The correct answer, can be a string, array of strings, or null.
     *                           options:
     *                             type: array
     *                             items:
     *                               oneOf:
     *                                 - type: string
     *                                 - type: "null"
     *                             description: Array of possible answer options.
     *                           questionText:
     *                             type: string
     *                             description: The text of the question.
     *                           questionType:
     *                             type: string
     *                             description: The type of the question.
     */
    this.router.get(
      "/api/v1/quizzes/:quizId",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.getQuizById
    );
    /**
     * @swagger
     * /api/v1/quizzes/{quizId}:
     *   put:
     *     summary: Update a quiz by ID
     *     tags: [Quiz]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the quiz to retrieve
     *     responses:
     *       204:
     *         description: Quiz updated successfully
     */
    this.router.put(
      "/api/v1/quizzes/:quizId",
      this.auth.verify,
      ValidationMiddleware.validate(createQuiz, "body"),
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.updateQuiz
    );
    /**
     * @swagger
     * /api/v1/quizzes/{quizId}:
     *   delete:
     *     summary: Delete a quiz by ID
     *     tags: [Quiz]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the quiz to retrieve
     *     responses:
     *       204:
     *         description: Quiz deleted successfully
     */
    this.router.delete(
      "/api/v1/quizzes/:quizId",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.deleteQuizById
    );
    /**
     * @swagger
     * /api/v1/quizzes/{quizId}/sessions:
     *   post:
     *     summary: Start quiz session
     *     tags: [Session]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the quiz to retrieve
     *     responses:
     *       201:
     *         description: Quiz retrieved successfully
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
     *                           format: uuid
     *                           description: The unique identifier for the quiz session
     *                           example: 60d21b4667d0d8992e610c85
     *                         userId:
     *                           type: string
     *                           format: uuid
     *                           description: ID of the user who created the session
     *                           example: 60d21b4667d0d8992e610c86
     *                         quizId:
     *                           type: string
     *                           format: uuid
     *                           description: ID of the quiz associated with this session
     *                           example: 60d21b4667d0d8992e610c87
     *                         code:
     *                           type: string
     *                           description: Unique code for joining the quiz session
     *                           example: "QUIZ123"
     *                         isActive:
     *                           type: boolean
     *                           description: Indicates if the quiz session is currently active
     *                           example: true
     *                         competitors:
     *                           type: array
     *                           description: List of users participating in the quiz session
     *                           items:
     *                             type: object
     *                             properties:
     *                               userId:
     *                                 type: string
     *                                 format: uuid
     *                                 description: ID of the competitor
     *                                 example: 60d21b4667d0d8992e610c88
     *                               startedAt:
     *                                 type: string
     *                                 format: date-time
     *                                 description: Timestamp when the competitor started the quiz
     *                                 example: "2023-05-05T14:30:00Z"
     *                               answers:
     *                                 type: array
     *                                 description: List of answers submitted by the competitor
     *                                 items:
     *                                   type: object
     *                                   properties:
     *                                     questionId:
     *                                       type: string
     *                                       format: uuid
     *                                       description: ID of the question being answered
     *                                       example: 60d21b4667d0d8992e610c89
     *                                     answer:
     *                                       type: string
     *                                       description: The competitor's answer to the question
     *                                       example: "Paris"
     *                               finished:
     *                                 type: boolean
     *                                 description: Indicates if the competitor has completed the quiz
     *                                 example: false
     *
     */
    this.router.post(
      "/api/v1/quizzes/:quizId/sessions",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.startQuizSession
    );
    /**
     * @swagger
     * /api/v1/quizzes/{quizId}/sessions/{sessionId}:
     *   patch:
     *     summary: End quiz session
     *     tags: [Session]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the quiz to retrieve
     *       - in: path
     *         name: sessionId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the session to retrieve
     *     responses:
     *       204:
     *         description: Quiz ended successfully
     *
     */
    this.router.patch(
      "/api/v1/quizzes/:quizId/sessions/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(endQuizSession, "params"),
      this.quizController.endQuizSession
    );
    /**
     * @swagger
     * /api/v1/quizzes/{quizId}/sessions/{sessionId}/results:
     *   get:
     *     summary: Get scores of all competitors
     *     tags: [Session]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the quiz to retrieve
     *       - in: path
     *         name: sessionId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the session to retrieve
     *     responses:
     *       200:
     *         description: Quiz retrieved successfully
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
     *                       type: object
     *                       properties:
     *                         scores:
     *                           type: number
     *                           description: score of the user
     *                           example: 67
     *                         name:
     *                           type: string
     *                           description: Full name of the user
     *                           example: "Joe Doe"
     *                         userAnswers:
     *                           type: array
     *                           description: List of answers submitted by the competitor
     *                           items:
     *                             type: object
     *                             properties:
     *                               questionText:
     *                                 type: string
     *                                 description: Question text
     *                                 example: "2+2=?"
     *                               answer:
     *                                 type: string
     *                                 description: The competitor's answer to the question
     *                                 example: "4"
     */
    this.router.get(
      "/api/v1/quizzes/:quizId/sessions/:sessionId/results",
      this.auth.verify,
      ValidationMiddleware.validate(endQuizSession, "params"),
      this.quizController.getQuizResults
    );
    /**
     * @swagger
     * /api/v1/quizzes/{quizId}/sessions:
     *   get:
     *     summary: Get info about sessions
     *     tags: [Session]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the quiz to retrieve
     *     responses:
     *       200:
     *         description: Quiz retrieved successfully
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
     *                      sessions:
     *                        type: array
     *                        description: List of quiz sessions
     *                        items:
     *                         type: object
     *                         properties:
     *                           startedAt:
     *                             type: string
     *                             description: Started at date of the quiz session
     *                             example: "2023-05-05T14:30:00Z"
     *                           endedAt:
     *                             type: string
     *                             description: Ended at date of the quiz session
     *                             example: "2023-05-05T14:30:00Z"
     *                           amountOfParticipants:
     *                             type: number
     *                             description: Amount of participants in the quiz
     *                             example: 23
     *
     */
    this.router.get(
      "/api/v1/quizzes/:quizId/sessions",
      this.auth.verify,
      ValidationMiddleware.validate(quizId, "params"),
      this.quizController.getAllSessions
    );
    /**
     * @swagger
     * /api/v1/quizzes/{quizId}/sessions/{sessionId}:
     *   get:
     *     summary: Get info about session
     *     tags: [Session]
     *     parameters:
     *       - in: path
     *         name: quizId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the quiz to retrieve
     *       - in: path
     *         name: sessionId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID of the session to retrieve
     *     responses:
     *       200:
     *         description: Quiz retrieved successfully
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
     *                         userId:
     *                           type: string
     *                           description: ID of the user who created the session
     *                           example: 124f34ffsd1247832947fsdf324
     *                         firstName:
     *                           type: string
     *                           description: First name of the user
     *                           example: "Joe"
     *                         lastName:
     *                           type: string
     *                           description: Last name of the user
     *                           example: "Doe"
     *                         finished:
     *                           type: boolean
     *                           description: Is session finished
     *                           example: true
     *                         answers:
     *                           type: array
     *                           description: List of answers submitted by the competitor
     *                           items:
     *                             type: object
     *                             properties:
     *                               userId:
     *                                 type: string
     *                                 description: ID of the user who created the session
     *                                 example: 124f34ffsd1247832947fsdf324
     *                               questionId:
     *                                 type: string
     *                                 description: ID of the question
     *                                 example: 124f34ffsd124783294ftvy7fsdf324
     *                               question:
     *                                 type: string
     *                                 description: question text
     *                                 example: 124f34ffsd124783294ftvy7fsdf324
     *                               status:
     *                                 type: string
     *                                 example: "success"
     *                               answer:
     *                                 type: string
     *                                 description: The competitor's answer to the question
     *                                 example: "4"
     *                               timestamp:
     *                                 type: string
     *                                 description: Timestamp of the answer
     *                                 example: "2023-05-05T14:30:00Z"
     *
     */
    this.router.get(
      "/api/v1/quizzes/:quizId/sessions/:sessionId",
      this.auth.verify,
      ValidationMiddleware.validate(endQuizSession, "params"),
      this.quizController.getSession
    );
    this.router.get(
      "/api/v1/quizzes/:quizId/sessions/:sessionId/analytics",
      this.auth.verify,
      ValidationMiddleware.validate(endQuizSession, "params"),
      this.quizController.AnalyzeQuestions
    );
  }
}
