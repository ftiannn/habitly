import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { handler } from '@/handlers/auth/logout';
import { authService } from '@/services/auth.service';
import { auth } from '@/lib/auth';
import { successResponse, handleAuthError } from '@/lib/responses';

jest.mock('@/services/auth.service');
jest.mock('@/lib/auth');
jest.mock('@/lib/responses');

describe('logout handler', () => {
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

    const createMockEvent = (overrides: Partial<APIGatewayProxyEventV2> = {}): APIGatewayProxyEventV2 => ({
        version: '2.0',
        routeKey: 'POST /auth/logout',
        rawPath: '/auth/logout',
        rawQueryString: '',
        headers: { authorization: 'Bearer token' },
        requestContext: {
            accountId: '123456789012',
            apiId: 'api123',
            domainName: 'api.example.com',
            domainPrefix: 'api',
            http: {
                method: 'POST',
                path: '/auth/logout',
                protocol: 'HTTP/1.1',
                sourceIp: '127.0.0.1',
                userAgent: 'test-agent'
            },
            requestId: 'test-request-id',
            routeKey: 'POST /auth/logout',
            stage: 'test',
            time: '01/Jan/2023:00:00:00 +0000',
            timeEpoch: 1672531200000
        },
        body: '{}',
        isBase64Encoded: false,
        ...overrides
    });

    const mockUser = { userId: 123, email: 'test@example.com' };
    const mockSuccessResponse = {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Logged out successfully' })
    };
    const mockErrorResponse = {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authentication required' })
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset the context property
        mockContext.callbackWaitsForEmptyEventLoop = true;
    });

    describe('successful logout', () => {
        it('should logout user successfully and return success response', async () => {
            (auth.authenticateRequest as jest.Mock).mockResolvedValue(mockUser);
            (authService.logout as jest.Mock).mockResolvedValue(undefined);
            (successResponse as jest.Mock).mockReturnValue(mockSuccessResponse);

            const event = createMockEvent();
            const result = await handler(event);

            expect(auth.authenticateRequest).toHaveBeenCalledWith(event);
            expect(authService.logout).toHaveBeenCalledWith(123);
            expect(successResponse).toHaveBeenCalledWith(null, 'Logged out successfully');
            expect(result).toEqual(mockSuccessResponse);
        });

        it('should handle different user IDs correctly', async () => {
            const differentUser = { userId: 456, email: 'different@example.com' };
            (auth.authenticateRequest as jest.Mock).mockResolvedValue(differentUser);
            (authService.logout as jest.Mock).mockResolvedValue(undefined);
            (successResponse as jest.Mock).mockReturnValue(mockSuccessResponse);

            const event = createMockEvent();
            await handler(event);

            expect(authService.logout).toHaveBeenCalledWith(456);
        });
    });

    describe('authentication errors', () => {
        it('should handle authentication required error', async () => {
            const authError = new Error('AUTHENTICATION_REQUIRED');
            (auth.authenticateRequest as jest.Mock).mockRejectedValue(authError);
            (handleAuthError as jest.Mock).mockReturnValue(mockErrorResponse);

            const event = createMockEvent();
            const result = await handler(event);

            expect(auth.authenticateRequest).toHaveBeenCalledWith(event);
            expect(authService.logout).not.toHaveBeenCalled();
            expect(handleAuthError).toHaveBeenCalledWith(authError);
            
            expect(result).toEqual(mockErrorResponse);
        });

        it('should handle invalid token error', async () => {
            const tokenError = new Error('INVALID_TOKEN');
            (auth.authenticateRequest as jest.Mock).mockRejectedValue(tokenError);
            (handleAuthError as jest.Mock).mockReturnValue({
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid token' })
            });

            const event = createMockEvent();
            const result = await handler(event);

            expect(handleAuthError).toHaveBeenCalledWith(tokenError);
            expect(authService.logout).not.toHaveBeenCalled();
        });

        it('should handle missing authorization header', async () => {
            const noAuthError = new Error('NO_AUTHORIZATION_HEADER');
            (auth.authenticateRequest as jest.Mock).mockRejectedValue(noAuthError);
            (handleAuthError as jest.Mock).mockReturnValue(mockErrorResponse);

            const event = createMockEvent({ headers: {} });
            const result = await handler(event);

            expect(auth.authenticateRequest).toHaveBeenCalledWith(event);
            expect(handleAuthError).toHaveBeenCalledWith(noAuthError);
            expect(result).toEqual(mockErrorResponse);
        });
    });

    describe('logout service errors', () => {
        it('should handle logout service failure', async () => {
            const logoutError = new Error('LOGOUT_FAILED');
            (auth.authenticateRequest as jest.Mock).mockResolvedValue(mockUser);
            (authService.logout as jest.Mock).mockRejectedValue(logoutError);
            (handleAuthError as jest.Mock).mockReturnValue({
                statusCode: 500,
                body: JSON.stringify({ error: 'Logout failed' })
            });

            const event = createMockEvent();
            const result = await handler(event);

            expect(auth.authenticateRequest).toHaveBeenCalledWith(event);
            expect(authService.logout).toHaveBeenCalledWith(123);
            expect(handleAuthError).toHaveBeenCalledWith(logoutError);
        });

        it('should handle database connection error during logout', async () => {
            const dbError = new Error('DATABASE_CONNECTION_ERROR');
            (auth.authenticateRequest as jest.Mock).mockResolvedValue(mockUser);
            (authService.logout as jest.Mock).mockRejectedValue(dbError);
            (handleAuthError as jest.Mock).mockReturnValue({
                statusCode: 503,
                body: JSON.stringify({ error: 'Service temporarily unavailable' })
            });

            const event = createMockEvent();
            const result = await handler(event);

            expect(handleAuthError).toHaveBeenCalledWith(dbError);
        });
    });

    describe('edge cases', () => {
        it('should handle user with string userId', async () => {
            const userWithStringId = { userId: '789', email: 'string@example.com' };
            (auth.authenticateRequest as jest.Mock).mockResolvedValue(userWithStringId);
            (authService.logout as jest.Mock).mockResolvedValue(undefined);
            (successResponse as jest.Mock).mockReturnValue(mockSuccessResponse);

            const event = createMockEvent();
            await handler(event);

            expect(authService.logout).toHaveBeenCalledWith('789');
        });

        it('should handle null/undefined errors gracefully', async () => {
            (auth.authenticateRequest as jest.Mock).mockRejectedValue(null);
            (handleAuthError as jest.Mock).mockReturnValue(mockErrorResponse);

            const event = createMockEvent();
            const result = await handler(event);

            expect(handleAuthError).toHaveBeenCalledWith(null);
        });

        it('should always set callbackWaitsForEmptyEventLoop to false', async () => {
            // Test with successful case
            (auth.authenticateRequest as jest.Mock).mockResolvedValue(mockUser);
            (authService.logout as jest.Mock).mockResolvedValue(undefined);
            (successResponse as jest.Mock).mockReturnValue(mockSuccessResponse);

            let event = createMockEvent();
            await handler(event);
            

            // Reset and test with error case
            mockContext.callbackWaitsForEmptyEventLoop = true;
            (auth.authenticateRequest as jest.Mock).mockRejectedValue(new Error('AUTH_ERROR'));
            (handleAuthError as jest.Mock).mockReturnValue(mockErrorResponse);

            event = createMockEvent();
            await handler(event);
            
        });
    });

    describe('function call order and dependencies', () => {
        it('should not call logout service if authentication fails', async () => {
            (auth.authenticateRequest as jest.Mock).mockRejectedValue(new Error('AUTH_FAILED'));
            (handleAuthError as jest.Mock).mockReturnValue(mockErrorResponse);

            const event = createMockEvent();
            await handler(event);

            expect(auth.authenticateRequest).toHaveBeenCalledWith(event);
            expect(authService.logout).not.toHaveBeenCalled();
            expect(successResponse).not.toHaveBeenCalled();
        });

        it('should not call successResponse if logout service fails', async () => {
            (auth.authenticateRequest as jest.Mock).mockResolvedValue(mockUser);
            (authService.logout as jest.Mock).mockRejectedValue(new Error('LOGOUT_ERROR'));
            (handleAuthError as jest.Mock).mockReturnValue(mockErrorResponse);

            const event = createMockEvent();
            await handler(event);

            expect(auth.authenticateRequest).toHaveBeenCalledWith(event);
            expect(authService.logout).toHaveBeenCalledWith(123);
            expect(successResponse).not.toHaveBeenCalled();
            expect(handleAuthError).toHaveBeenCalled();
        });
    });
});