import { Document, Schema, model, Types, Model } from "mongoose";

export interface IQuiz extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description: string;
  timeLimit: number;
  questions: [
    {
      _id: Types.ObjectId;
      correctAnswer?: string | string[];
      photoUrl?: string;
      options: string[];
      questionText: string;
      questionType: string;
    }
  ];
}

const quizSchema = new Schema<IQuiz>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timeLimit: { type: Number, required: true },
    questions: [
      {
        correctAnswer: { type: Schema.Types.Mixed, required: false },
        photoUrl: { type: String, required: false },
        options: { type: [String], required: true },
        questionText: { type: String, required: true },
        questionType: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);
export const Quiz: Model<IQuiz> = model<IQuiz>("Quiz", quizSchema);
