import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responses';
import { createDBContext, getPrisma } from '@/lib/prisma';
import { validateUpdateSettingsInput } from '@/lib/validation';
import { UpdateSettingsInput } from '@/types/user.types';
import { userService } from '@/services/user.service';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const prisma = await getPrisma();
        const ctx = createDBContext(prisma);

        const user = await auth.authenticateRequest(event);

        if (!event.body) {
            return errorResponse('Request body is required', 400);
        }

        const input: UpdateSettingsInput = JSON.parse(event.body);

        const validationError = validateUpdateSettingsInput(input);
        if (validationError) {
            return errorResponse(validationError, 400);
        }

        const updatedSettings = await userService.updateUserSettings(
            ctx,
            user.userId,
            input
        );

        return successResponse({
            settings: updatedSettings,
            message: 'Settings updated successfully'
        });
    } catch (error: any) {
        return errorResponse(error);
    }
};
