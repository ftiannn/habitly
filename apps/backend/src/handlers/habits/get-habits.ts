import { auth } from "@/lib/auth";
import { createDBContext, getPrisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/responses";
import { habitService } from "@/services/habit.service";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";


export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const prisma = await getPrisma();
    const ctx = createDBContext(prisma);
    
    const user = await auth.authenticateRequest(event);

    const habits = await habitService.getUserHabits(ctx, user.userId);

    return successResponse({
      habits,
      message: 'All habits retrieved successfully'
    });
  } catch (error: any) {
    return errorResponse(error);
  }
};