export default {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/src/tests/jest.setup.js"],
  testMatch: ["**/src/tests/**/*.test.js"],
  testTimeout: 30000,
  maxWorkers: process.env.CI ? 1 : undefined,
};
