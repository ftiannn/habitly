import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { successResponse, errorResponse } from '@/lib/responses';
import { habitService } from '@/services/habit.service';
import { auth } from '@/lib/auth';
import { createDBContext, getPrisma } from '@/lib/prisma';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const prisma = await getPrisma();
    const ctx = createDBContext(prisma);

    const user = await auth.authenticateRequest(event);

    const habitId = parseInt(event.pathParameters?.id || '');

    if (!habitId || isNaN(habitId)) {
      return errorResponse('Invalid Habit ID', 400);
    }

    const habit = await habitService.getHabitById(ctx, habitId, user.userId);

    if (!habit) {
      return errorResponse('Habit not found', 404);
    }

    return successResponse({
      habit,
      message: 'Habit retrieved successfully'
    });

  } catch (error: any) {
    return errorResponse(error);
  }
};