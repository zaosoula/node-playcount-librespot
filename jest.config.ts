import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/__test__/*',
  ],
  setupFiles: [
    'dotenv/config',
  ],
  testEnvironment: 'jest-environment-node',
  preset: 'ts-jest', 
}

export default jestConfig
