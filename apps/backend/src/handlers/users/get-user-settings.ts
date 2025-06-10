import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responses';
import { createDBContext, getPrisma } from '@/lib/prisma';
import { userService } from '@/services/user.service';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const prisma = await getPrisma();
    const ctx = createDBContext(prisma);
    
    const user = await auth.authenticateRequest(event);

    const settings = await userService.getUserSettings(ctx, user.userId);

    return successResponse({
      settings,
      message: 'Settings retrieved successfully'
    });
  } catch (error: any) {
    return errorResponse(error);
  }
};
