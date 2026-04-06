export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@pages/(.*)$': '<rootDir>/src/pages/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@store/(.*)$': '<rootDir>/src/store/$1',
        '^@styles/(.*)$': '<rootDir>/src/styles/$1',
        '^@assets/(.*)$': '<rootDir>/src/assets/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1'
    },
    transform: {
        '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react'] }]
    },
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/**/*.test.{js,jsx}',
        '!src/**/*.stories.{js,jsx}',
        '!src/main.jsx',
        '!src/vite-env.d.ts',
        '!src/tests/**/*'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    coverageReporters: ['text', 'html', 'lcov'],
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    verbose: true,
    testPathIgnorePatterns: ['/node_modules/', '/dist/']
};