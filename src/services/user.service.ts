import { RedisCacheService } from "../types/common.type.js";
import { Logger } from "../utils/logger.js";
import { IUser, User } from "../models/user.model.js";
import { BaseService } from "./base.service.js";
import { ITakenQuiz, TakenQuiz } from "../models/takenQuiz.model.js";
import { Types } from "mongoose";
import { AppError } from "../models/error.model.js";
import bcrypt from "bcryptjs";
import { IQuiz } from "../models/quiz.model.js";
export class UserService extends BaseService {
  constructor(logger: Logger, caching: RedisCacheService) {
    super(logger, caching);
  }
  getUserById = async (userId: string): Promise<IUser> => {
    return this.getItemById("User", userId, User);
  };
  changePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    const user: IUser | null = await this.getUserById(userId);
    if (!user) {
      this.logger.error(`User not found`, { userId });
      throw new AppError(404, "User", "User not found");
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      this.logger.error(`Invalid password during password change`, { userId });
      throw new AppError(400, "User", "Invalid password");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.updateOne(
      {
        _id: userId,
      },
      {
        password: hashedPassword,
      }
    );
  };
  joinQuiz = async (userId: string, code: string): Promise<string> => {
    const quiz: ITakenQuiz | null = await TakenQuiz.findOne({
      code,
      isActive: true,
    }).populate("quizId");
    if (!quiz) {
      this.logger.error(`Quiz with code ${code} not found`);
      throw new Error(`Quiz with code ${code} not found`);
    }
    for (const el of quiz.competitors) {
      if (el.userId.toString() === userId) {
        if (el.finished) {
          this.logger.error(`You have already finished this quiz`, {
            userId,
            quize: quiz._id,
          });
          throw new AppError(
            400,
            "Quiz",
            "You have already finished this quiz"
          );
        }
      }
    }
    return `${quiz._id}`;
  };
  getQuestions = async (
    sessionId: string,
    userId: string
  ): Promise<
    ITakenQuiz & {
      competitor: {
        userId: Types.ObjectId;
        finished: boolean;
        answers: {
          questionId: Types.ObjectId;
          answer: string;
        }[];
      };
    } & {
      competitors: any[];
    }
  > => {
    const quizSession: ITakenQuiz | null = await TakenQuiz.findOne({
      _id: sessionId,
      isActive: true,
    }).populate({
      path: "quizId",
      select: "-questions.correctAnswer",
    });

    if (!quizSession) {
      this.logger.error(`Quiz session with this id does not exist`, {
        quizSession,
      });
      throw new AppError(
        400,
        "Quiz",
        "Quiz session with this id does not exist"
      );
    }

    let existingCompetitor = quizSession.competitors.find(
      (el) => el.userId.toString() === userId
    );

    if (existingCompetitor) {
      if (existingCompetitor.finished) {
        this.logger.error(`You have already finished this quiz`, {
          userId,
          quiz: quizSession._id,
        });
        throw new AppError(400, "Quiz", "You have already finished this quiz");
      }
      quizSession.competitors = [] as any;

      return {
        ...quizSession.toObject(),
        competitor: existingCompetitor,
      };
    }

    const userObjectId = new Types.ObjectId(userId);
    const newCompetitor = {
      userId: userObjectId,
      startedAt: new Date(),
      finished: false,
      answers: [],
    };
    quizSession.competitors.push(newCompetitor);
    await quizSession.save();
    quizSession.competitors = [] as any;
    return {
      ...quizSession.toObject(),
      competitor: newCompetitor,
    };
  };
  endQuiz = async (userId: string, sessionId: string) => {
    const sesssionQuiz = await TakenQuiz.findOne({
      _id: sessionId,
    }).populate("quizId");
    if (!sesssionQuiz) {
      this.logger.error(`Session with this id not found`, { sessionId });
      throw new AppError(400, "Session", `Session with this id not found`);
    }
    for (const el of sesssionQuiz.competitors) {
      if (el.userId.toString() === userId) {
        el.finished = true;
      }
    }
    await sesssionQuiz.save();
  };
  deleteUser = async (userId: string, password: string): Promise<void> => {
    const user: IUser | null = await User.findById(userId);
    if (!user) {
      this.logger.error(`User with this id not found`, { userId });
      throw new AppError(400, "User", `User with this id not found`);
    }
    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password
    );
    if (!isPasswordValid) {
      this.logger.error(`Invalid password provided during deleting account`, {
        userId,
      });
      throw new AppError(400, "User", "Invalid password");
    }
    await User.deleteOne({
      _id: userId,
    });
    this.logger.info(`User deleted successfully`, { userId });
  };
  updateUser = async (
    userId: string,
    data: Omit<IUser, "_id">
  ): Promise<IUser> => {
    return this.updateItem("User", userId, data, User);
  };
  getResult = async (userId: string, sessionId: string): Promise<number> => {
    if (await this.caching.exists(`Quiz-Result-${sessionId}-${userId}`)) {
      const result: number | null = JSON.parse(
        (await this.caching.get(`Quiz-Result-${sessionId}-${userId}`)) || ""
      );
      if (!result) {
        this.logger.error(
          `An error occurred while retrieving Quiz-Result-${sessionId} for ${userId} from the cache.`
        );
        throw new AppError(
          404,
          "Quiz-Result",
          `An error occurred while retrieving Quiz-Result-${sessionId} for ${userId} from the cache.`
        );
      }
      return result;
    }
    const quizSession = await TakenQuiz.findOne({ _id: sessionId })
      .populate("quizId")
      .lean<ITakenQuiz & { quizId: IQuiz }>();
    if (!quizSession) {
      this.logger.error(`Session with this id not found`, { sessionId });
      throw new AppError(400, "Session", `Session with this id not found`);
    }
    let userAnswers;
    const answers = quizSession.quizId.questions.map((el) => ({
      question: el._id,
      answer: el.correctAnswer,
    }));
    for (const el of quizSession.competitors) {
      if (el.userId.toString() === userId) {
        userAnswers = el.answers;
      }
    }
    if (!userAnswers) {
      this.logger.error(`Session with this id not found`, { sessionId });
      throw new AppError(400, "Session", `Session with this id not found`);
    }
    let score: number = 0;
    for (const el of answers) {
      for (const userAnswer of userAnswers) {
        if (el.question.toString() === userAnswer.questionId.toString()) {
          if (typeof el.answer === "string") {
            if (el.answer.toLowerCase() === userAnswer.answer) {
              score++;
            }
          } else {
            if (!el.answer) {
              score++;
            } else {
              if (el.answer.join(",").toLowerCase() === userAnswer.answer) {
                score++;
              }
            }
          }
        }
      }
    }
    score = Math.ceil((score / answers.length) * 100);
    await this.caching.set(
      `Quiz-Result-${sessionId}-${userId}`,
      JSON.stringify(score),
      300
    );
    return score;
  };
}
