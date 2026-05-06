export default {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/src/tests/jest.setup.js"],
  testMatch: ["**/src/tests/**/*.test.js"],
  testTimeout: 30000,
};
