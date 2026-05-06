import mongoose from "mongoose";
import { signupUser } from "../../controllers/auth.controller.js";
import { expect, jest } from "@jest/globals";
import dotenv from "dotenv";

jest.unstable_mockModule("../../services/user.service.js", () => ({
  login: jest.fn(),
  refreshAccessToken: jest.fn(),
  register: jest.fn(),
  googleLogin: jest.fn(),
  getGoogleAuthUrl: jest.fn(),
  verifyUserEmail: jest.fn(),
}));

dotenv.config({
  path: ".env.development", // or .env.test if you create one
});

describe("Auth Integration - Register", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("should register user successfully", async () => {
    const req = {
      body: {
        email: "test@test.com",
        username: "testuser",
        password: "123456",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await signupUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({
            email: "test@test.com",
          }),
        }),
      }),
    );

    expect(next).not.toHaveBeenCalled();
  });

  test("should fail if user already exists", async () => {
    const req = {
      body: {
        email: "test@test.com",
        username: "testuser",
        password: "123456",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    // First call (creates user)
    await signupUser(req, res, next);

    // Second call (should fail)
    await signupUser(req, res, next);

    expect(next).toHaveBeenCalled(); // error passed to middleware
  });
});
