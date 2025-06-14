import { Db } from "../src/config/database.config.js";
import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { registerData, loginData, createQuizData } from "./data/auth.js";
import dotenv from "dotenv";
import { Quiz } from "../src/models/quiz.model.js";
import { User } from "../src/models/user.model.js";
import { date } from "joi";
dotenv.config();

describe("QUIZ", () => {
  let userId: string;
  let token: string;
  let quizId: string;
  beforeAll(async () => {
    const responseRegister = await fetch(
      "http://localhost:3000/api/v1/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      },
    );
    const registerDataRes = await responseRegister.json();

    userId = registerDataRes.data.user._id;
    new Db(process.env.DB_LINK || "");
    await User.updateOne(
      {
        _id: userId,
      },
      {
        isActivated: true,
      },
    );
    const response = await fetch("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    token = data.data.token;
  });
  afterAll(async () => {
    try {
      if (userId) {
        new Db(process.env.DB_LINK || "");
        await User.deleteOne({ _id: userId });
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });
  it("should create a quiz", async () => {
    const response = await fetch("http://localhost:3000/api/v1/quizzes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createQuizData),
    });
    expect(response.status).toBe(201);
  });
  it("should display all user quizzes", async () => {

  })
});
