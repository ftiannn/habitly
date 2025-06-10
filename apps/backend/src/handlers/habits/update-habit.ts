import { auth } from "@/lib/auth";
import { createDBContext, getPrisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { validateUpdateHabitInput } from "@/lib/validation";
import { habitService } from "@/services/habit.service";
import { UpdateHabitInput } from "@/types/habit.types";
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

    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const input: UpdateHabitInput = JSON.parse(event.body);

    const validationError = validateUpdateHabitInput(input);

    if (validationError) {
      return errorResponse(validationError, 400);
    }

    if (input.endAt) {
      input.endAt = new Date(input.endAt);
    }

    if (input.pauseUntil) {
      input.pauseUntil = new Date(input.pauseUntil);
    }

    const habit = await habitService.updateHabit(ctx, habitId, user.userId, input);

    return successResponse({
      habit,
      message: 'Habit updated successfully'
    });

  } catch (error: any) {
    return errorResponse(error);
  }
};