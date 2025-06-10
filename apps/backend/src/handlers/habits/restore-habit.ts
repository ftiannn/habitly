import { auth } from "@/lib/auth";
import { createDBContext, getPrisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { habitService } from "@/services/habit.service";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const prisma = await getPrisma();
    const ctx = createDBContext(prisma);
    
    const user = await auth.authenticateRequest(event);
    const habitId = parseInt(event.pathParameters?.id || '');

    if (!habitId || isNaN(habitId)) {
      return errorResponse('Invalid habit ID', 400);
    }

    const habit = await habitService.restoreHabit(ctx, habitId, user.userId);

    return successResponse({
      habit,
      message: 'Habit restored successfully'
    });
  } catch (error: any) {
    return errorResponse(error);
  }
};