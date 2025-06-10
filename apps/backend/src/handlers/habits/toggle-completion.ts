import { auth } from "@/lib/auth";
import { createDBContext, getPrisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/responses";
import { validateToggleHabitInput } from "@/lib/validation";
import { badgeService } from "@/services/badge.service";
import { habitService } from "@/services/habit.service";
import { ToggleHabitInput } from "@/types/habit.types";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const prisma = await getPrisma();
    const ctx = createDBContext(prisma);

    const user = await auth.authenticateRequest(event);

    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const input: ToggleHabitInput = JSON.parse(event.body);

    const validationError = validateToggleHabitInput(input);

    if (validationError) {
      return errorResponse(validationError, 400);
    }

    const result = await habitService.toggleHabitCompletion(ctx, user.userId, input);

    if (result.action === 'completed') {
      const newBadges = await badgeService.checkAndAwardBadges(ctx, user.userId);

      if (newBadges.length > 0) {
        return successResponse({
          ...result,
          newBadges,
          message: `Habit ${result.action}! You earned ${newBadges.length} new badge(s)!`
        });
      }
    }

    return successResponse({
      ...result,
      message: `Habit ${result.action} successfully`
    });

  } catch (error: any) {
    return errorResponse(error);
  }
};
