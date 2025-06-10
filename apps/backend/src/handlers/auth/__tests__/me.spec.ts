import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { handler } from '@/handlers/auth/me';
import { authService } from '@/services/auth.service';
import { auth } from '@/lib/auth';
import { successResponse, handleAuthError } from '@/lib/responses';

jest.mock('@/services/auth.service');
jest.mock('@/lib/auth');
jest.mock('@/lib/responses');

describe('me handler', () => {
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

    const createMockEvent = (): APIGatewayProxyEventV2 => ({
        version: '2.0',
        routeKey: 'GET /auth/me',
        rawPath: '/auth/me',
        rawQueryString: '',
        headers: { authorization: 'Bearer token' },
        requestContext: {
            accountId: '123456789012',
            apiId: 'api123',
            domainName: 'api.example.com',
            domainPrefix: 'api',
            http: {
                method: 'GET',
                path: '/auth/me',
                protocol: 'HTTP/1.1',
                sourceIp: '127.0.0.1',
                userAgent: 'test-agent'
            },
            requestId: 'test-request-id',
            routeKey: 'GET /auth/me',
            stage: 'test',
            time: '01/Jan/2023:00:00:00 +0000',
            timeEpoch: 1672531200000
        },
        body: undefined,
        isBase64Encoded: false
    });

    const mockUser = { userId: 123, email: 'test@example.com' };
    const mockUserProfile = {
        id: 123,
        email: 'test@example.com',
        name: 'Test User'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return user profile successfully', async () => {
        (auth.authenticateRequest as jest.Mock).mockResolvedValue(mockUser);
        (authService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
        (successResponse as jest.Mock).mockReturnValue({
            statusCode: 200,
            body: JSON.stringify({ data: mockUserProfile })
        });

        const event = createMockEvent();
        await handler(event);

        expect(auth.authenticateRequest).toHaveBeenCalledWith(event);
        expect(authService.getUserProfile).toHaveBeenCalledWith(123);
        expect(successResponse).toHaveBeenCalledWith(mockUserProfile);
        expect(mockContext.callbackWaitsForEmptyEventLoop).toBe(false);
    });

    it('should handle authentication errors', async () => {
        const authError = new Error('AUTHENTICATION_REQUIRED');
        (auth.authenticateRequest as jest.Mock).mockRejectedValue(authError);
        (handleAuthError as jest.Mock).mockReturnValue({
            statusCode: 401,
            body: JSON.stringify({ error: 'Authentication required' })
        });

        const event = createMockEvent();
        await handler(event);

        expect(handleAuthError).toHaveBeenCalledWith(authError);
        expect(authService.getUserProfile).not.toHaveBeenCalled();
    });

    it('should handle getUserProfile errors', async () => {
        (auth.authenticateRequest as jest.Mock).mockResolvedValue(mockUser);
        const serviceError = new Error('USER_NOT_FOUND');
        (authService.getUserProfile as jest.Mock).mockRejectedValue(serviceError);
        (handleAuthError as jest.Mock).mockReturnValue({
            statusCode: 404,
            body: JSON.stringify({ error: 'User not found' })
        });

        const event = createMockEvent();
        await handler(event);

        expect(auth.authenticateRequest).toHaveBeenCalledWith(event);
        expect(authService.getUserProfile).toHaveBeenCalledWith(123);
        expect(handleAuthError).toHaveBeenCalledWith(serviceError);
    });
});
