import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { auth } from '@/lib/auth';
import { secrets } from '@/lib/secrets';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('google-auth-library');
jest.mock('@/lib/secrets');

describe('auth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('generateToken', () => {
        it('should generate JWT token', async () => {
            (secrets.getJwtSecret as jest.Mock).mockResolvedValue('secret');
            (jwt.sign as jest.Mock).mockReturnValue('jwt-token');

            const payload = { userId: 123, email: 'test@example.com' };
            const result = await auth.generateToken(payload);

            expect(jwt.sign).toHaveBeenCalledWith(
                payload,
                'secret',
                {
                    expiresIn: '7d',
                    issuer: 'habitly-api',
                    audience: 'habitly-app', 
                    subject: payload.userId.toString(), 
                    algorithm: 'HS256'
                }
            );
            expect(result).toBe('jwt-token');
        });
    });

    describe('verifyToken', () => {
        it('should verify valid token', async () => {
            const mockPayload = { userId: 123, email: 'test@example.com' };
            (secrets.getJwtSecret as jest.Mock).mockResolvedValue('secret');
            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

            const result = await auth.verifyToken('valid-token');

            expect(jwt.verify).toHaveBeenCalledWith(
                'valid-token',
                'secret',
                {
                    issuer: 'habitly-api',
                    audience: 'habitly-app',
                    algorithms: ['HS256'],
                }
            );
            expect(result).toEqual(mockPayload);
        });

        it('should throw TOKEN_EXPIRED for expired token', async () => {
            (secrets.getJwtSecret as jest.Mock).mockResolvedValue('secret');
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new jwt.TokenExpiredError('Token expired', new Date());
            });

            await expect(auth.verifyToken('expired-token'))
                .rejects.toThrow('TOKEN_EXPIRED');
        });

        it('should throw INVALID_TOKEN for malformed token', async () => {
            (secrets.getJwtSecret as jest.Mock).mockResolvedValue('secret');
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new jwt.JsonWebTokenError('Invalid token');
            });

            await expect(auth.verifyToken('invalid-token'))
                .rejects.toThrow('INVALID_TOKEN');
        });

        it('should throw TOKEN_VERIFICATION_FAILED for other errors', async () => {
            (secrets.getJwtSecret as jest.Mock).mockResolvedValue('secret');
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Some other error');
            });

            await expect(auth.verifyToken('token'))
                .rejects.toThrow('TOKEN_VERIFICATION_FAILED');
        });
    });

    describe('extractTokenFromEvent', () => {
        const createMockEvent = (authHeader?: string): APIGatewayProxyEventV2 => ({
            version: '2.0',
            routeKey: 'GET /test',
            rawPath: '/test',
            rawQueryString: '',
            headers: authHeader ? { authorization: authHeader } : {},
            requestContext: {} as any,
            isBase64Encoded: false
        });

        it('should extract token from Authorization header', () => {
            const event = createMockEvent('Bearer valid-token');
            const result = auth.extractTokenFromEvent(event);
            expect(result).toBe('valid-token');
        });

        it('should extract token from authorization header (lowercase)', () => {
            const event = createMockEvent();
            event.headers.authorization = 'Bearer valid-token';
            const result = auth.extractTokenFromEvent(event);
            expect(result).toBe('valid-token');
        });

        it('should return null if no auth header', () => {
            const event = createMockEvent();
            const result = auth.extractTokenFromEvent(event);
            expect(result).toBeNull();
        });

        it('should return null if header is not Bearer format', () => {
            const event = createMockEvent('Basic user:pass');
            const result = auth.extractTokenFromEvent(event);
            expect(result).toBeNull();
        });

        it('should return null if no token after Bearer', () => {
            const event = createMockEvent('Bearer ');
            const result = auth.extractTokenFromEvent(event);
            expect(result).toBeNull();
        });

        it('should return null if only Bearer without space', () => {
            const event = createMockEvent('Bearer');
            const result = auth.extractTokenFromEvent(event);
            expect(result).toBeNull();
        });
    });

    describe('verifyGoogleToken', () => {
        const mockGoogleClient = {
            verifyIdToken: jest.fn()
        };

        beforeEach(() => {
            (OAuth2Client as unknown as jest.Mock).mockReturnValue(mockGoogleClient);
            (secrets.getGoogleClientId as jest.Mock).mockResolvedValue('google-client-id');
        });

        it('should verify valid Google token', async () => {
            const mockPayload = {
                sub: 'google-123',
                email: 'user@example.com',
                name: 'Test User',
                picture: 'https://example.com/pic.jpg',
                email_verified: true
            };

            mockGoogleClient.verifyIdToken.mockResolvedValue({
                getPayload: () => mockPayload
            });

            const result = await auth.verifyGoogleToken('valid-google-token');

            expect(mockGoogleClient.verifyIdToken).toHaveBeenCalledWith({
                idToken: 'valid-google-token',
                audience: 'google-client-id'
            });
            expect(result).toEqual(mockPayload);
        });

        it('should throw INVALID_GOOGLE_TOKEN if no email in payload', async () => {
            mockGoogleClient.verifyIdToken.mockResolvedValue({
                getPayload: () => ({ sub: 'google-123' }) // missing email
            });

            await expect(auth.verifyGoogleToken('invalid-token'))
                .rejects.toThrow('INVALID_GOOGLE_TOKEN');
        });

        it('should throw INVALID_GOOGLE_TOKEN on verification error', async () => {
            mockGoogleClient.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

            await expect(auth.verifyGoogleToken('invalid-token'))
                .rejects.toThrow('INVALID_GOOGLE_TOKEN');
        });
    });

    describe('authenticateRequest', () => {
        const createMockEvent = (authHeader?: string): APIGatewayProxyEventV2 => ({
            version: '2.0',
            routeKey: 'GET /test',
            rawPath: '/test',
            rawQueryString: '',
            headers: authHeader ? { authorization: authHeader } : {},
            requestContext: {} as any,
            isBase64Encoded: false
        });

        it('should authenticate valid request', async () => {
            const mockPayload = { userId: 123, email: 'test@example.com' };
            (secrets.getJwtSecret as jest.Mock).mockResolvedValue('secret');
            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

            const event = createMockEvent('Bearer valid-token');
            const result = await auth.authenticateRequest(event);

            expect(result).toEqual({
                userId: 123,
                email: 'test@example.com'
            });
        });

        it('should throw AUTHENTICATION_REQUIRED if no token', async () => {
            const event = createMockEvent();

            await expect(auth.authenticateRequest(event))
                .rejects.toThrow('AUTHENTICATION_REQUIRED');
        });

        it('should propagate token verification errors', async () => {
            (secrets.getJwtSecret as jest.Mock).mockResolvedValue('secret');
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new jwt.TokenExpiredError('Token expired', new Date());
            });

            const event = createMockEvent('Bearer expired-token');

            await expect(auth.authenticateRequest(event))
                .rejects.toThrow('TOKEN_EXPIRED');
        });
    });
});
