import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import crypto from 'crypto';
import { createDBContext, getPrisma } from '@/lib/prisma';
import { authService } from '@/services/auth.service';
import { successResponse, errorResponse, parseBody, handleAuthError } from '@/lib/responses';

interface RefreshTokenRequest {
    refreshToken: string;
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const body = parseBody<RefreshTokenRequest>(event.body);
        const { refreshToken } = body;

        if (!refreshToken) {
            return errorResponse('Refresh token is required', 400);
        }

        const prisma = await getPrisma();
        const ctx = createDBContext(prisma);
        
        const authResponse = await authService.getRefreshToken(
            ctx,
            refreshToken,
        );

        return successResponse(authResponse, 'Token refreshed successfully');
    } catch (error) {
        console.error('Refresh token error:', error);

        return handleAuthError(error);
    }
};