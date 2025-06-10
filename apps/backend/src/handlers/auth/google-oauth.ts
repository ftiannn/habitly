import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { authService } from '@/services/auth.service';
import { successResponse, errorResponse, parseBody } from '@/lib/responses';
import { GoogleOAuthRequest } from '@/types/auth.types';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const body = parseBody<GoogleOAuthRequest>(event.body);
        const { idToken, timezone } = body;

        if (!idToken) {
            return errorResponse('Google ID token is required', 400);
        }

        const result = await authService.googleOAuth({ idToken, timezone });

        return successResponse(result, 'Google authentication successful');
    } catch (error: any) {
        console.error('Google OAuth error:', error);

        if (error.message === 'INVALID_GOOGLE_TOKEN') {
            return errorResponse('Invalid Google token', 401);
        }

        return errorResponse('Google authentication failed', 500);
    }
};

export { handler as default };
