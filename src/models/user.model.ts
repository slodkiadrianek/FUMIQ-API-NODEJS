import { Document, Schema, model, Types, Model } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstname: string;
  lastname: string;
  password: string;
  email: string;
  isActivated: boolean;
}

const userSchema = new Schema<IUser>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isActivated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User: Model<IUser> = model<IUser>("User", userSchema);
