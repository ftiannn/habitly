import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responses';
import { createDBContext, getPrisma } from '@/lib/prisma';
import { habitService } from '@/services/habit.service';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const prisma = await getPrisma();
    const ctx = createDBContext(prisma);
    
    const user = await auth.authenticateRequest(event);

    const startDateStr = event.queryStringParameters?.startDate;
    const endDateStr = event.queryStringParameters?.endDate;

    if (!startDateStr || !endDateStr) {
      return errorResponse('startDate and endDate query parameters are required', 400);
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return errorResponse('Invalid date format. Use YYYY-MM-DD', 400);
    }

    if (startDate > endDate) {
      return errorResponse('startDate cannot be after endDate', 400);
    }

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 366) {
      return errorResponse('Date range cannot exceed 366 days', 400);
    }

    const dailySummaries = await habitService.getHabitHistory(
      ctx, 
      user.userId, 
      startDate, 
      endDate
    );

    return successResponse({
      dailySummaries,
      period: {
        startDate: startDateStr,
        endDate: endDateStr,
        totalDays: daysDiff + 1
      },
      message: 'Habit history retrieved successfully'
    });
  } catch (error: any) {
    return errorResponse(error);
  }
};
