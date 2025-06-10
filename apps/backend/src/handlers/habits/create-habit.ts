import { auth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/responses";
import { validateCreateHabitInput } from "@/lib/validation";
import { badgeService } from "@/services/badge.service";
import { habitService } from "@/services/habit.service";
import { CreateHabitInput } from "@/types/habit.types";
import { withTransaction, createDBContext } from "@/lib/prisma";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const user = await auth.authenticateRequest(event);

    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const input: CreateHabitInput = JSON.parse(event.body);
    const validationError = validateCreateHabitInput(input);
    if (validationError) {
      return errorResponse(validationError, 400);
    }

    if (input.startAt) {
      input.startAt = new Date(input.startAt);
    }

    if (input.endAt) {
      input.endAt = new Date(input.endAt);
    }

    if (input.pauseUntil) {
      input.pauseUntil = new Date(input.pauseUntil);
    }

    const habit = await withTransaction(async (prisma: any) => {
      const ctx = createDBContext(prisma);
      const habit = await habitService.createHabit(ctx, user.userId, input);
      await badgeService.checkAndAwardBadges(ctx, user.userId);
      return habit;
    });

    return successResponse({
      habit,
      message: 'Habit created successfully',
      statusCode: 201,
    });

  } catch (error: any) {
    return errorResponse(error);
  }
};
