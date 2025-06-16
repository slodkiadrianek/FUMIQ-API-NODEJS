import { IQuiz, Quiz } from "../models/quiz.model.js";
import { RedisCacheService } from "../types/common.type.js";
import { Logger } from "../utils/logger.js";
import { BaseService } from "./base.service.js";
import { ITakenQuiz, TakenQuiz } from "../models/takenQuiz.model.js";
import { IUser } from "../models/user.model.js";
import { AppError } from "../models/error.model.js";

export class QuizService extends BaseService {
  constructor(logger: Logger, caching: RedisCacheService) {
    super(logger, caching);
  }
  createQuiz = async (data: Omit<IQuiz, "_id">): Promise<IQuiz> => {
    return this.insertToDatabaseAndCache("Quiz", data, Quiz);
  };
  getAllQuizez = async (userId: string): Promise<IQuiz[]> => {
    const result: IQuiz[] = await this.getAllItems("Quizez", userId, Quiz);

    if (result[0].userId.toString() !== userId) {
      throw new AppError(
        403,
        "Quiz",
        "You are not  permitted to do this operation"
      );
    } else {
      return result;
    }
  };
  getQuizById = async (userId: string, quizId: string): Promise<IQuiz> => {
    const result: IQuiz = await this.getItemById("Quiz", quizId, Quiz);
    if (result.userId.toString() !== userId) {
      throw new AppError(
        403,
        "Quiz",
        "You are not permitted to do this operation"
      );
    } else {
      return result;
    }
  };
  updateQuiz = async (
    quizId: string,
    quizData: Omit<IQuiz, "_id">
  ): Promise<IQuiz> => {
    console.log(quizId);

    console.log(quizData);

    return this.updateItem("Quiz", quizId, quizData, Quiz);
  };
  deleteQuizById = async (quizId: string): Promise<string> => {
    return this.deleteItem("Quiz", quizId, Quiz);
  };
  startQuizSession = async (
    quizId: string,
    userId: string
  ): Promise<ITakenQuiz> => {
    const quiz: IQuiz | null = await Quiz.findOne({
      _id: quizId,
      userId: userId
    })
    if (!quiz) {
      this.logger.error("Quiz not found", { userId, quizId })
      throw new AppError(400, "Quiz", "Quiz not found")
    }
    const quizCheck: ITakenQuiz | null = await TakenQuiz.findOne({
      quizId,
      userId,
      isActive: true,
    });
    if (quizCheck) {
      return quizCheck;
    }
    let error: number = 0;
    let code: string;
    do {
      code = `${Math.floor(100000 + Math.random() * 900000)}`;
      const codeCheck: ITakenQuiz | null = await TakenQuiz.findOne({
        code,
      });
      if (codeCheck) {
        this.logger.error(`Code is already in use`);
        error = 1;
      }
    } while (error === 1);
    const result: ITakenQuiz = await TakenQuiz.create({
      userId,
      quizId,
      code,
    });
    return result;
  };
  endQuizSession = async (sessionId: string): Promise<void> => {
    const quizSession: ITakenQuiz | null = await TakenQuiz.findOne({
      _id: sessionId,
    });
    if (!quizSession) {
      this.logger.error(`Quiz with id ${sessionId} not found`);
      throw new Error(`Quiz with id ${sessionId} not found`);
    }
    quizSession.isActive = false;
    await quizSession.save();
  };
  showQuizResults = async (
    quizId: string,
    sessionId: string
  ): Promise<
    {
      name: string;
      score: number;
      userAnswers: {
        questionText: string;
        answer: string;
      }[];
    }[]
  > => {
    if (await this.caching.exists(`Quiz-Results-${sessionId}`)) {
      const result:
        | {
          name: string;
          score: number;
          userAnswers: {
            questionText: string;
            answer: string;
          }[];
        }[]
        | null = JSON.parse(
          (await this.caching.get(`Quiz-Results-${sessionId}`)) || ""
        );
      if (!result) {
        this.logger.error(
          `An error occurred while retrieving Quiz-Results-${sessionId}  from the cache.`
        );
        throw new AppError(
          404,
          "Quiz-Result",
          `An error occurred while retrieving Quiz-Results-${sessionId}  from the cache.`
        );
      }
      return result;
    }
    const result: {
      name: string;
      score: number;
      userAnswers: {
        questionText: string;
        answer: string;
      }[];
    }[] = [];
    const quizSession = await TakenQuiz.findOne({
      _id: sessionId,
      quizId: quizId,
      isActive: false,
    })
      .populate([
        { path: "quizId", model: "Quiz" },
        { path: "competitors.userId", model: "User" },
      ])
      .lean<
        ITakenQuiz & { quizId: IQuiz } & { competitors: { userId: IUser }[] }
      >();
    if (!quizSession) {
      this.logger.error(`Quiz with id ${sessionId} not found`);
      throw new Error(`Quiz with id ${sessionId} not found`);
    }
    const answers = quizSession.quizId.questions.map((el) => ({
      questionId: el._id,
      question: el.questionText,
      answer: el.correctAnswer,
    }));
    for (const el of quizSession.competitors) {
      const userAnswersInfo: {
        questionText: string;
        answer: string;
      }[] = [];
      const name: string = `${el.userId.firstname} ${el.userId.lastname}`;
      const userAnswers = el.answers;
      let score: number = 0;
      for (const el of answers) {
        for (const userAnswer of userAnswers) {
          if (el.questionId.toString() === userAnswer.questionId.toString()) {
            userAnswersInfo.push({
              questionText: el.question.toString(),
              answer: userAnswer.answer,
            });
            if (typeof el.answer === "string") {
              if (el.answer.toLowerCase() === userAnswer.answer.toLowerCase()) {
                score++;
              }
            } else {
              if (!el.answer) {
                score++;
              } else {
                if (el.answer.join(",").toLowerCase() === userAnswer.answer.toLowerCase()) {
                  score++;
                }
              }
            }
          }
        }
      }
      score = Math.ceil((score / answers.length) * 100);
      result.push({ name, score, userAnswers: userAnswersInfo });
    }
    await this.caching.set(
      `Quiz-Results-${sessionId}`,
      JSON.stringify(result),
      {
        EX: 30,
      }
    );
    return result;
  };
  getAllSessions = async (
    quizId: string
  ): Promise<
    {
      id: string;
      quizId: string;
      startedAt: string;
      endedAt: string;
      amountOfParticipants: number;
    }[]
  > => {
    const sessions:
      | {
        _id: string;
        quizId: string;
        updatedAt: string;
        createdAt: string;
        competitors: [];
      }[]
      | null = await TakenQuiz.find(
        {
          quizId,
          isActive: false,
        },
        "_id quizId createdAt updatedAt competitors"
      );
    if (!sessions) {
      this.logger.error("No sessions with this quizId", { quizId });
      throw new AppError(400, "Session", "No session with this quizId");
    }
    const result: {
      id: string;
      quizId: string;
      startedAt: string;
      endedAt: string;
      amountOfParticipants: number;
    }[] = [];
    for (const el of sessions) {
      result.push({
        id: el._id,
        quizId: el.quizId,
        startedAt: el.createdAt,
        endedAt: el.updatedAt,
        amountOfParticipants: el.competitors.length,
      });
    }
    return result;
  };
  getSession = async (
    quizId: string,
    sessionId: string
  ): Promise<
    {
      userId: string;
      firstName: string;
      lastName: string;
      finished: boolean;
      answers: {
        userId: string;
        questionId: string;
        question: string;
        status: string;
        answer: string;
        timestamp: Date;
      }[];
    }[]
  > => {
    const session = await TakenQuiz.findOne({
      _id: sessionId,
    })
      .populate([
        {
          path: "competitors.userId",
          model: "User",
        },
      ])
      .lean<
        Omit<ITakenQuiz, "competitors"> & {
          competitors: {
            userId: IUser;
            finished: boolean;
            answers: {
              questionId: string;
              answer: string;
            }[];
          }[];
        }
      >();
    if (!session) {
      this.logger.error("No session with this id", { sessionId });
      throw new AppError(400, "Session", "No session with this id");
    }
    const quiz: IQuiz | null = await Quiz.findOne({
      _id: quizId,
    });
    if (!quiz) {
      this.logger.error("No quiz with this id", { sessionId });
      throw new AppError(400, "Quiz", "No quiz with this id");
    }
    const result: {
      userId: string;
      firstName: string;
      lastName: string;
      finished: boolean;
      answers: {
        userId: string;
        questionId: string;
        question: string;
        status: string;
        answer: string;
        timestamp: Date;
      }[];
    }[] = [];
    for (const competitor of session.competitors) {
      const answers = [];

      for (const answer of competitor.answers) {
        const question = quiz.questions.find(
          (q) => q._id.toString() === answer.questionId.toString()
        );

        if (question) {
          answers.push({
            userId: competitor.userId._id.toString(),
            questionId: question._id.toString(),
            question: question.questionText,
            status: "success",
            answer: answer.answer,
            timestamp: new Date(),
          });
        }
      }

      result.push({
        userId: competitor.userId._id.toString(),
        firstName: competitor.userId.firstname,
        lastName: competitor.userId.lastname,
        finished: competitor.finished,
        answers: answers,
      });
    }
    return result;
  };
  AnalizeQuizQuestions = async (sessionId: string, quizId: string, userId: string):
    Promise<{
      quizTitle: string;
      quizDescription: string;
      averageScore: number
      highestScore: number
      questions: { questionText: string, options: { optionText: string, percentage: number, isCorrect: boolean }[] }[]
    }> => {
    const resQuiz = await Quiz.findOne({ _id: quizId, userId: userId })
    if (!resQuiz) {
      this.logger.error("Quiz with this id does not exist", { quizId })
      throw new AppError(400, "Database", "Quiz with this id does not exist")
    }
    const resSession = await TakenQuiz.findOne({
      _id: sessionId,
      userId: userId
    })
    if (!resSession) {
      this.logger.error("Session with this id does not exist", { quizId })
      throw new AppError(400, "Database", "Session with this id does not exist")
    }
    const questions: { questionText: string, options: { optionText: string, percentage: number, isCorrect: boolean }[] }[] = []
    const usersScore: Array<number> = []
    for (const el of resQuiz.questions) {
      const options: { optionText: string, percentage: number, isCorrect: boolean }[] = []
      for (const option of el.options) {
        options.push({ optionText: option.toLowerCase(), percentage: 0, isCorrect: false })
      }
      if (Array.isArray(el.correctAnswer)) {
        for (const correctAnswer of el.correctAnswer) {
          for (const option of options) {
            if (option.optionText === correctAnswer.toLowerCase()) {
              option.isCorrect = true
            }
          }
        }
      } else {
        for (const option of options) {
          if (option.optionText === el.correctAnswer?.toLowerCase()) {
            option.isCorrect = true
          }
        }
      }
      for (const competitor of resSession.competitors) {
        for (const competitorAnswer of competitor.answers) {
          if (el._id.toString() === competitorAnswer.questionId.toString()) {
            if (typeof el.correctAnswer === "string") {
              if (el.correctAnswer.toLowerCase() === competitorAnswer.answer.toLowerCase()) {
                for (const option of options) {
                  if (option.optionText === competitorAnswer.answer.toLowerCase()) {
                    option.percentage++
                  }
                }
              } else {
                for (const option of options) {
                  if (option.optionText === competitorAnswer.answer.toLowerCase()) {
                    option.percentage++
                  }
                }
              }
            } else {
              if (el.correctAnswer) {
                if (el.correctAnswer.join(",").toLowerCase() === competitorAnswer.answer.toLowerCase()) {
                  for (const correctAnswer of el.correctAnswer) {
                    for (const option of options) {
                      if (option.optionText === correctAnswer.toLowerCase()) {
                        option.percentage++
                      }
                    }
                  }
                } else {
                  for (const option of options) {
                    if (option.optionText === competitorAnswer.answer.toLowerCase()) {
                      option.percentage++
                    }
                  }
                }
              }
            }
          }
        }
      }
      for (const option of options) {
        option.percentage = Math.floor((option.percentage / resSession.competitors.length) * 100)
      }
      questions.push({ questionText: el.questionText, options: options })
    }
    for (const competiror of resSession.competitors) {

      let competitorScore: number = 0
      for (const question of resQuiz.questions) {
        for (const competirorAnswer of competiror.answers) {
          if (question._id.toString() === competirorAnswer.questionId.toString()) {
            if (typeof question.correctAnswer === "string") {
              if (question.correctAnswer.toLowerCase() === competirorAnswer.answer.toLowerCase()) {
                competitorScore++;
              }
            } else {
              if (!question.correctAnswer) {
                competitorScore++;
              } else {
                if (question.correctAnswer.join(",").toLowerCase() === competirorAnswer.answer.toLowerCase()) {
                  competitorScore++;
                }
              }
            }
          }
        }
      }
      usersScore.push(competitorScore)
    }
    console.log(usersScore)
    const averageScore = Math.floor(
      (usersScore.reduce((acc, curr) => acc + (curr / resQuiz.questions.length), 0) / resSession.competitors.length) * 100
    );
    const highestScore = Math.floor((Math.max(...usersScore) / resQuiz.questions.length) * 100)
    return { quizTitle: resQuiz.title, quizDescription: resQuiz.description, averageScore: averageScore, highestScore: highestScore, questions: questions }
  }
}
