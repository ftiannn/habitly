import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responses';
import { habitService } from '@/services/habit.service';
import { createDBContext, getPrisma } from '@/lib/prisma';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const prisma = await getPrisma();
        const ctx = createDBContext(prisma); 
    
        const user = await auth.authenticateRequest(event);
        const habitId = parseInt(event.pathParameters?.id || '');

        if (!habitId || isNaN(habitId)) {
            return errorResponse('Invalid habit ID', 400);
        }

        await habitService.deleteHabit(ctx, habitId, user.userId);

        return successResponse({
            message: 'Habit deleted successfully',
            habitId
        });
    } catch (error: any) {
        return errorResponse(error);
    }
};