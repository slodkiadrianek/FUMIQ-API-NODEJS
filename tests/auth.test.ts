import { describe, it, expect, afterAll } from "vitest";
import { registerData, loginData, resetPasswordData } from "./data/auth.js";
import { User } from "../src/models/user.model.js";
import { Db } from "../src/config/database.config.js";
import dotenv from "dotenv";
dotenv.config();
describe("AUTH", () => {
  let userId: string;
  let token: string;
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

  it("should register a new user", async () => {
    const response = await fetch("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });
    expect(response.status).toBe(201);
    const data = await response.json();
    userId = data.data.user._id;
    new Db(process.env.DB_LINK || "");
    await User.updateOne(
      {
        _id: userId,
      },
      {
        isActivated: true,
      },
    );
  });

  it("should login a user", async () => {
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

  it("should check is user logged in", async () => {
    const response = await fetch("http://localhost:3000/api/v1/auth/check", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.status).toBe(200);
  });

  it("should logout a user", async () => {
    const response = await fetch("http://localhost:3000/api/v1/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.status).toBe(204);
  });

  it("should send link to reset password", async () => {
    const response = await fetch(
      "http://localhost:3000/api/v1/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resetPasswordData),
      },
    );
    expect(response.status).toBe(204);
  });
});
