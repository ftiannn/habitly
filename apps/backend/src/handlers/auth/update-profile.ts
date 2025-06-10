import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responses';
import { createDBContext, getPrisma } from '@/lib/prisma';
import { validateUpdateProfileInput } from '@/lib/validation';
import { UpdateProfileInput } from '@/types/user.types';
import { userService } from '@/services/user.service';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const prisma = await getPrisma();
        const ctx = createDBContext(prisma);

        const user = await auth.authenticateRequest(event);

        if (!event.body) {
            return errorResponse('Request body is required', 400);
        }

        const input: UpdateProfileInput = JSON.parse(event.body);

        const validationError = validateUpdateProfileInput(input);

        if (validationError) {
            return errorResponse(validationError, 400);
        }

        const updatedProfile = await userService.updateUserProfile(
            ctx,
            user.userId,
            input
        );

        return successResponse({
            profile: updatedProfile,
            message: 'Profile updated successfully'
        });
    } catch (error: any) {
        return errorResponse(error);
    }
};