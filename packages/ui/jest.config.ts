import type { Config } from "jest";

/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};

export default config;
