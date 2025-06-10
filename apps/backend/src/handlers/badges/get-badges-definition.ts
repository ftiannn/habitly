import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { successResponse, errorResponse } from '@/lib/responses';
import { createDBContext, getPrisma } from '@/lib/prisma';
import { badgeService } from '@/services/badge.service';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const prisma = await getPrisma();
    const ctx = createDBContext(prisma);

    const badges = await badgeService.getAllBadgeDefinitions(ctx);

    return successResponse({
      badges,
      message: 'Badge definitions retrieved successfully'
    });
  } catch (error: any) {
    return errorResponse(error);
  }
};
