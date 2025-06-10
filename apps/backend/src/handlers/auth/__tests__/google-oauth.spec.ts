import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { handler } from '@/handlers/auth/google-oauth';
import { authService } from '@/services/auth.service';
import { successResponse, errorResponse, parseBody } from '@/lib/responses';

jest.mock('@/lib/responses', () => ({
    successResponse: jest.fn(),
    errorResponse: jest.fn(),
    parseBody: jest.fn()
}));

describe('google-oauth handler', () => {
    const mockContext: Context = {
        callbackWaitsForEmptyEventLoop: false,
        functionName: 'test',
        functionVersion: '1',
        invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
        memoryLimitInMB: '128',
        awsRequestId: 'test-request-id',
        logGroupName: 'test-log-group',
        logStreamName: 'test-log-stream',
        getRemainingTimeInMillis: () => 1000,
        done: jest.fn(),
        fail: jest.fn(),
        succeed: jest.fn()
    };

    const createMockEvent = (body?: any): APIGatewayProxyEventV2 => ({
        version: '2.0',
        routeKey: 'POST /auth/google',
        rawPath: '/auth/google',
        rawQueryString: '',
        headers: {},
        requestContext: {
            accountId: '123456789012',
            apiId: 'api123',
            domainName: 'api.example.com',
            domainPrefix: 'api',
            http: {
                method: 'POST',
                path: '/auth/google',
                protocol: 'HTTP/1.1',
                sourceIp: '127.0.0.1',
                userAgent: 'test-agent'
            },
            requestId: 'test-request-id',
            routeKey: 'POST /auth/google',
            stage: 'test',
            time: '01/Jan/2023:00:00:00 +0000',
            timeEpoch: 1672531200000
        },
        body: body ? JSON.stringify(body) : undefined,
        isBase64Encoded: false
    });

    const validIdToken = 'valid.google.id.token';
    const validRequestBody = { idToken: validIdToken };
    const mockAuthResponse = {
        user: testHelper.generateMockUser(),
        accessToken: 'mock.access.token',
        refreshToken: 'mock.refresh.token'
    };

    // Spies
    let parseBodySpy: jest.SpyInstance;
    let googleOAuthSpy: jest.SpyInstance;
    let successResponseSpy: jest.SpyInstance;
    let errorResponseSpy: jest.SpyInstance;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        parseBodySpy = jest.spyOn({ parseBody }, 'parseBody');
        googleOAuthSpy = jest.spyOn(authService, 'googleOAuth');
        successResponseSpy = jest.spyOn({ successResponse }, 'successResponse');
        errorResponseSpy = jest.spyOn({ errorResponse }, 'errorResponse');
        consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        successResponseSpy.mockReturnValue({
            statusCode: 200,
            body: JSON.stringify({ message: 'Success' })
        });

        errorResponseSpy.mockReturnValue({
            statusCode: 400,
            body: JSON.stringify({ error: 'Error' })
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const setupSuccessfulFlow = () => {
        parseBodySpy.mockReturnValue(validRequestBody);
        googleOAuthSpy.mockResolvedValue(mockAuthResponse);
    };

    describe('successful Google OAuth', () => {
        it('should authenticate with Google successfully', async () => {
            setupSuccessfulFlow();
            const mockEvent = createMockEvent(validRequestBody);

            await handler(mockEvent);

            expect(parseBodySpy).toHaveBeenCalledWith(mockEvent.body);
            expect(googleOAuthSpy).toHaveBeenCalledWith({ idToken: validIdToken });
            expect(successResponseSpy).toHaveBeenCalledWith(
                mockAuthResponse,
                'Google authentication successful'
            );
        });

        it('should set callbackWaitsForEmptyEventLoop to false', async () => {
            setupSuccessfulFlow();
            const mockEvent = createMockEvent(validRequestBody);

            await handler(mockEvent);

            expect(mockContext.callbackWaitsForEmptyEventLoop).toBe(false);
        });

        it('should handle different valid ID token formats', async () => {
            const differentTokens = [
                'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIn0.signature',
                'short.token.format',
                'very-long-token-with-many-characters-and-special-chars-123456789'
            ];

            for (const token of differentTokens) {
                parseBodySpy.mockReturnValue({ idToken: token });
                googleOAuthSpy.mockResolvedValue(mockAuthResponse);
                const mockEvent = createMockEvent({ idToken: token });

                await handler(mockEvent);

                expect(googleOAuthSpy).toHaveBeenCalledWith({ idToken: token });
            }
        });
    });

    describe('validation errors', () => {
        it.each([
            [{}, 'missing idToken'],
            [{ idToken: '' }, 'empty idToken'],
            [{ idToken: null }, 'null idToken'],
            [{ idToken: undefined }, 'undefined idToken'],
        ])('should return 400 when %s', async (requestBody, scenario) => {
            parseBodySpy.mockReturnValue(requestBody);
            const mockEvent = createMockEvent(requestBody);

            await handler(mockEvent);

            expect(errorResponseSpy).toHaveBeenCalledWith(
                'Google ID token is required',
                400
            );

            expect(googleOAuthSpy).not.toHaveBeenCalled();
        });

        it('should handle invalid request body structure', async () => {
            parseBodySpy.mockReturnValue({ otherField: 'value' });
            const mockEvent = createMockEvent({ otherField: 'value' });

            await handler(mockEvent);

            expect(errorResponseSpy).toHaveBeenCalledWith(
                'Google ID token is required',
                400
            );
        });
    });

    describe('Google OAuth service errors', () => {
        beforeEach(() => {
            parseBodySpy.mockReturnValue(validRequestBody);
        });

        it('should return 401 for invalid Google token', async () => {
            googleOAuthSpy.mockRejectedValue(new Error('INVALID_GOOGLE_TOKEN'));
            const mockEvent = createMockEvent(validRequestBody);

            await handler(mockEvent);

            expect(googleOAuthSpy).toHaveBeenCalledWith({ idToken: validIdToken });
            expect(errorResponseSpy).toHaveBeenCalledWith('Invalid Google token', 401);
        });

        it('should return 500 for unexpected service errors', async () => {
            const error = new Error('Network timeout');
            googleOAuthSpy.mockRejectedValue(error);
            const mockEvent = createMockEvent(validRequestBody);

            await handler(mockEvent);

            expect(consoleSpy).toHaveBeenCalledWith('Google OAuth error:', error);
            expect(errorResponseSpy).toHaveBeenCalledWith('Google authentication failed', 500);
        });

        it('should handle service throwing non-Error objects', async () => {
            googleOAuthSpy.mockRejectedValue('String error');
            const mockEvent = createMockEvent(validRequestBody);

            await handler(mockEvent);

            expect(consoleSpy).toHaveBeenCalledWith('Google OAuth error:', 'String error');
            expect(errorResponseSpy).toHaveBeenCalledWith('Google authentication failed', 500);
        });

    });

    describe('edge cases', () => {
        it('should handle null request body', async () => {
            parseBodySpy.mockReturnValue({});
            const mockEvent = createMockEvent(null);

            await handler(mockEvent);

            expect(parseBodySpy).toHaveBeenCalledWith(undefined);
            expect(errorResponseSpy).toHaveBeenCalledWith(
                'Google ID token is required',
                400
            );
        });

        it('should handle parseBody throwing error', async () => {
            parseBodySpy.mockImplementation(() => {
                throw new Error('Invalid JSON');
            });
            const mockEvent = createMockEvent(validRequestBody);

            await handler(mockEvent);

            expect(consoleSpy).toHaveBeenCalledWith('Google OAuth error:', expect.any(Error));
            expect(errorResponseSpy).toHaveBeenCalledWith('Google authentication failed', 500);
        });

        it('should handle malformed JSON in request body', async () => {
            parseBodySpy.mockImplementation(() => {
                throw new SyntaxError('Unexpected token in JSON');
            });
            const mockEvent = createMockEvent('invalid-json');

            await handler(mockEvent);

            expect(errorResponseSpy).toHaveBeenCalledWith('Google authentication failed', 500);
        });

        it('should handle very large idToken', async () => {
            const largeToken = 'a'.repeat(10000);
            parseBodySpy.mockReturnValue({ idToken: largeToken });
            googleOAuthSpy.mockResolvedValue(mockAuthResponse);
            const mockEvent = createMockEvent({ idToken: largeToken });

            await handler(mockEvent);

            expect(googleOAuthSpy).toHaveBeenCalledWith({ idToken: largeToken });
            expect(successResponseSpy).toHaveBeenCalledWith(
                mockAuthResponse,
                'Google authentication successful'
            );
        });
    });

    describe('integration tests', () => {
        it('should call dependencies in correct order for successful flow', async () => {
            let callOrder: string[] = [];

            parseBodySpy.mockImplementation(() => {
                callOrder.push('parseBody');
                return validRequestBody;
            });

            googleOAuthSpy.mockImplementation(async () => {
                callOrder.push('googleOAuth');
                return mockAuthResponse;
            });

            successResponseSpy.mockImplementation(() => {
                callOrder.push('successResponse');
                return { statusCode: 200, body: '{}' };
            });

            const mockEvent = createMockEvent(validRequestBody);
            await handler(mockEvent);

            expect(callOrder).toEqual(['parseBody', 'googleOAuth', 'successResponse']);
        });

        it('should not call googleOAuth when idToken is missing', async () => {
            parseBodySpy.mockReturnValue({});
            const mockEvent = createMockEvent({});

            await handler(mockEvent);

            expect(parseBodySpy).toHaveBeenCalled();
            expect(googleOAuthSpy).not.toHaveBeenCalled();
            expect(errorResponseSpy).toHaveBeenCalled();
            expect(successResponseSpy).not.toHaveBeenCalled();
        });

        it('should not call successResponse when googleOAuth fails', async () => {
            parseBodySpy.mockReturnValue(validRequestBody);
            googleOAuthSpy.mockRejectedValue(new Error('INVALID_GOOGLE_TOKEN'));
            const mockEvent = createMockEvent(validRequestBody);

            await handler(mockEvent);

            expect(parseBodySpy).toHaveBeenCalled();
            expect(googleOAuthSpy).toHaveBeenCalled();
            expect(errorResponseSpy).toHaveBeenCalled();
            expect(successResponseSpy).not.toHaveBeenCalled();
        });

        it('should handle multiple consecutive calls correctly', async () => {
            setupSuccessfulFlow();

            // First call
            const mockEvent1 = createMockEvent({ idToken: 'token1' });
            parseBodySpy.mockReturnValueOnce({ idToken: 'token1' });
            await handler(mockEvent1);

            // Second call  
            const mockEvent2 = createMockEvent({ idToken: 'token2' });
            parseBodySpy.mockReturnValueOnce({ idToken: 'token2' });
            await handler(mockEvent2);

            expect(googleOAuthSpy).toHaveBeenCalledTimes(2);
            expect(googleOAuthSpy).toHaveBeenNthCalledWith(1, { idToken: 'token1' });
            expect(googleOAuthSpy).toHaveBeenNthCalledWith(2, { idToken: 'token2' });
        });
    });

    describe('response format validation', () => {
        it('should return auth response with correct structure', async () => {
            const expectedResponse = {
                user: { id: 123, email: 'test@example.com' },
                accessToken: 'mock.access.token',
                refreshToken: 'mock.refresh.token'
            };

            parseBodySpy.mockReturnValue(validRequestBody);
            googleOAuthSpy.mockResolvedValue(expectedResponse);
            const mockEvent = createMockEvent(validRequestBody);

            await handler(mockEvent);

            expect(successResponseSpy).toHaveBeenCalledWith(
                expectedResponse,
                'Google authentication successful'
            );
        });
    });
});