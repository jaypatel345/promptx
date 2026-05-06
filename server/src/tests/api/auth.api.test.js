import request from "supertest";
import app from "../../../app.js";
import mongoose from "mongoose";
import { signupUser } from "../../controllers/auth.controller.js";

describe("Auth API - Register", () => {
  // Connect to test DB
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
  });
  // Clean DB after each test
  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });
  // Close DB connection
  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("should register user successfully", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "test@test.com",
      username: "testuser",
      password: "123456",
    });

    //  Status check
    expect(res.statusCode).toBe(201);

    //  Response structure
    expect(res.body).toHaveProperty("success", true);

    expect(res.body.data).toHaveProperty("user");

    expect(res.body.data.user).toHaveProperty("email", "test@test.com");
  });
  test("should fail if user allready exists", async () => {
    await request(app).post("/api/auth/signup").send({
      email: "test@test.com",
      username: "testuser",
      password: "123456",
    });
    const res = await request(app).post("/api/auth/signup").send({
      email: "test@test.com",
      username: "testuser",
      password: "123456",
    });
    expect(res.statusCode).toBe(400);
  });
  test("should not return password in response", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "test@test.com",
      username: "testuser",
      password: "123456",
    });
    expect(res.body.data.user.password).toBeUndefined();
  });
  test("should fail on wrong password", async () => {
    await request(app).post("/api/auth/signup").send({
      email: "test@test.com",
      username: "testuser",
      password: "123456",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "wrong",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid email or password");
  });
});
