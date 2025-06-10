require('dotenv').config({ path: '.env.test' });
require('./src/test/setup-test-env');

process.env.NODE_ENV = 'test';
process.env.STAGE = 'test';

global.testHelper = {
    generateMockUser: (overrides = {}) => ({
        id: Math.floor(Math.random() * 1000),
        email: `test${Math.random()}@example.com`,
        name: 'Test User',
        password: 'hashedPassword123',
        photoUrl: null,
        isPremium: false,
        joinedAt: new Date(),
        provider: 'email',
        googleId: null,
        ...overrides
    }),

    generateMockAuthResponse: (user = null) => ({
        user: user || testHelper.generateMockUser(),
        accessToken: 'mock.access.token',
        refreshToken: 'mock.refresh.token'
    }),

    generateMockToken: () => 'mock.jwt.token.for.testing',
    generateValidPassword: () => 'ValidPass123',
    generateInvalidPasswords: () => ['123', 'password', 'PASSWORD123', 'Password'],

    generateMockGoogleProfile: () => ({
        sub: 'google123',
        email: 'test@gmail.com',
        name: 'Google User',
        picture: 'https://example.com/photo.jpg'
    })
};
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};
