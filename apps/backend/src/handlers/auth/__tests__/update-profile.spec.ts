import { auth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responses';
import { getPrisma, createDBContext } from '@/lib/prisma';
import { userService } from '@/services/user.service';
import { validateUpdateProfileInput } from '@/lib/validation';
import { handler } from '@/handlers/auth/update-profile';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

jest.mock('@/lib/auth', () => ({
    auth: {
        authenticateRequest: jest.fn()
    }
}));

jest.mock('@/lib/responses', () => ({
    ...jest.requireActual('@/lib/responses'),
    successResponse: jest.fn(),
    errorResponse: jest.fn()
}));

jest.mock('@/lib/prisma', () => ({
    getPrisma: jest.fn(),
    createDBContext: jest.fn()
}));

jest.mock('@/services/user.service', () => ({
    userService: {
        updateUserProfile: jest.fn()
    }
}));

jest.mock('@/lib/validation', () => ({
    validateUpdateProfileInput: jest.fn()
}));

describe('update-profile.handler', () => {
    const mockPrisma = {};
    const mockCtx = { db: 'ctx' };
    const mockUser = { userId: 123 };
    const validInput = { name: 'New Name', bio: 'New Bio' };
    const mockProfile = { id: 123, name: 'New Name', bio: 'New Bio' };

    beforeEach(() => {
        jest.clearAllMocks();
        (getPrisma as jest.Mock).mockResolvedValue(mockPrisma);
        (createDBContext as jest.Mock).mockReturnValue(mockCtx);
        (auth.authenticateRequest as jest.Mock).mockResolvedValue(mockUser);
    });

    it('should update profile successfully', async () => {
        (validateUpdateProfileInput as jest.Mock).mockReturnValue(null);
        (userService.updateUserProfile as jest.Mock).mockResolvedValue(mockProfile);
        (successResponse as jest.Mock).mockReturnValue({
            statusCode: 200,
            headers: {},
            body: JSON.stringify({ success: true, data: { profile: mockProfile }, message: 'Profile updated successfully' })
        });

        const result = await handler({
            body: JSON.stringify(validInput)
        } as any) as APIGatewayProxyStructuredResultV2;

        expect(auth.authenticateRequest).toHaveBeenCalled();
        expect(validateUpdateProfileInput).toHaveBeenCalledWith(validInput);
        expect(userService.updateUserProfile).toHaveBeenCalledWith(mockCtx, mockUser.userId, validInput);
        expect(successResponse).toHaveBeenCalledWith(
            { profile: mockProfile, message: 'Profile updated successfully' }
        );
        expect(result.statusCode).toBe(200);
    });

    it('should return 400 if body is missing', async () => {
        (errorResponse as jest.Mock).mockReturnValue({ statusCode: 400, body: 'Missing body' });

        const result = await handler({ body: null } as any) as APIGatewayProxyStructuredResultV2;

        expect(errorResponse).toHaveBeenCalledWith('Request body is required', 400);
        expect(result.statusCode).toBe(400);
    });

    it('should return 400 if validation fails', async () => {
        (validateUpdateProfileInput as jest.Mock).mockReturnValue('Invalid input');
        (errorResponse as jest.Mock).mockReturnValue({ statusCode: 400, body: 'Validation error' });

        const result = await handler({
            body: JSON.stringify(validInput)
        } as any) as APIGatewayProxyStructuredResultV2;

        expect(errorResponse).toHaveBeenCalledWith('Invalid input', 400);
        expect(result.statusCode).toBe(400);
    });

    it('should return 500 on unexpected errors', async () => {
        const thrownError = new Error('unexpected failure');
        (auth.authenticateRequest as jest.Mock).mockRejectedValue(thrownError);
        (errorResponse as jest.Mock).mockReturnValue({ statusCode: 500, body: 'Internal error' });

        const result = await handler({
            body: JSON.stringify(validInput)
        } as any) as APIGatewayProxyStructuredResultV2;

        expect(errorResponse).toHaveBeenCalledWith(thrownError);
        expect(result.statusCode).toBe(500);
    });
});
