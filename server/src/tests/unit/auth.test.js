import { expect, jest } from "@jest/globals";

// Mock service layer (controller calls `register`, not the User model directly)
jest.unstable_mockModule("../../services/user.service.js", () => ({
  login: jest.fn(),
  refreshAccessToken: jest.fn(),
  register: jest.fn(),
  googleLogin: jest.fn(),
  getGoogleAuthUrl: jest.fn(),
  verifyUserEmail: jest.fn(),
}));

// STEP 2: import AFTER mocking (dynamic import required for ESM)
const { signupUser } = await import("../../controllers/auth.controller.js");
const { register } = await import("../../services/user.service.js");
const { default: ApiError } = await import("../../utils/ApiError.js");

describe("Auth Controller - register", () => {
  test("should register user successfully", async () => {
    const mockUser = {
      _id: "123",
      email: "test@test.com",
      username: "testuser",
      joined: new Date(),
    };
    register.mockResolvedValue(mockUser);

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

    expect(register).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({
            _id: "123",
            email: "test@test.com",
            username: "testuser",
          }),
        }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });
  test("should throw error if user exists", async () => {
    register.mockRejectedValue(new ApiError(400, "User already exists"));

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
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: "User already exists",
      }),
    );
  });
  test("should throw validation error if required fields missing", async () => {
    register.mockRejectedValue(
      new ApiError(400, "Username, email, and password are required"),
    );

    const req = { body: {} };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();
    await signupUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: "Username, email, and password are required",
      }),
    );
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should register call with correct payload", async () => {
    register.mockResolvedValue({});

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

    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith(req.body);
  });
  test("should handle unexpected error", async () => {
    register.mockRejectedValue(new ApiError(500, "something broke"));
    const req = {
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await signupUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "something broke",
      }),
    );
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  test("should not call next on success", async () => {
    register.mockResolvedValue({});
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
    expect(next).not.toHaveBeenCalledWith();
  });
  test("should not send response if error occurs", async () => {
    register.mockRejectedValue(new ApiError(400, "Error"));

    const res = {
      status: jest.fn(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await signupUser({ body: {} }, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  test("should fail if email missing", async () => {
    register.mockRejectedValue(
      new ApiError(400, "Username, email, and password are required"),
    );

    const req = {
      body: {
        username: "test",
        password: "123456",
      },
    };

    const next = jest.fn();

    await signupUser(req, {}, next);

    expect(next).toHaveBeenCalled();
  });
  test("should fail if fields are empty strings", async () => {
    register.mockRejectedValue(
      new ApiError(400, "Username, email, and password are required"),
    );
    const req = {
      body: {
        email: "",
        username: "",
        password: "",
      },
    };
    const next = jest.fn();

    await signupUser(req, {}, next);

    expect(next).toHaveBeenCalled();
  });
});
