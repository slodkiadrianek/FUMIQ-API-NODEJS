import { Document, Schema, model, Types, Model } from "mongoose";

export interface ITakenQuiz extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  code: string;
  isActive: boolean;
  competitors: [
    {
      userId: Types.ObjectId;
      startedAt: Date;
      answers: {
        questionId: Types.ObjectId;
        answer: string;
      }[];
      finished: boolean;
    }
  ];
}

const takenQuizSchema = new Schema<ITakenQuiz>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    code: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    competitors: {
      type: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          startedAt: { type: Date, required: true },
          finished: { type: Boolean, default: false },
          answers: {
            type: [
              {
                questionId: {
                  type: Schema.Types.ObjectId,
                  ref: "Quiz",
                  required: true,
                },
                answer: { type: String, required: true },
              },
            ],
            default: [],
          },
        },
      ],
    },
  },
  { timestamps: true }
);
export const TakenQuiz: Model<ITakenQuiz> = model<ITakenQuiz>(
  "TakenQuiz",
  takenQuizSchema
);
