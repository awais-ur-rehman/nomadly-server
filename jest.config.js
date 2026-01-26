/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                // Relax strict mode for tests
                noUnusedLocals: false,
                noUnusedParameters: false,
            }
        }],
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/types/**',
        '!src/**/*.d.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    testTimeout: 30000,
    verbose: true,
    forceExit: true,
    clearMocks: true,
    detectOpenHandles: true,
    // Transform ES modules in dependencies
    transformIgnorePatterns: [
        'node_modules/(?!(concaveman|rbush|@turf)/)',
    ],
    // Module name mapper to handle problematic imports
    moduleNameMapper: {
        '^@turf/turf$': '<rootDir>/tests/__mocks__/turf.ts',
    },
};
