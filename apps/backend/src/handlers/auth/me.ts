import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { authService } from '@/services/auth.service';
import { auth } from '@/lib/auth';
import { successResponse, handleAuthError } from '@/lib/responses';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const user = await auth.authenticateRequest(event);
        const userProfile = await authService.getUserProfile(user.userId);

        return successResponse(userProfile);
    } catch (error: any) {
        return handleAuthError(error);
    }
};

export { handler as default };
