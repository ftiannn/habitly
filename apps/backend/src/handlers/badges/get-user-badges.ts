import { auth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/responses";
import { badgeService } from "@/services/badge.service";
import { withTransaction, createDBContext } from "@/lib/prisma";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const user = await auth.authenticateRequest(event);

    const badges = await withTransaction(async (prisma: any) => {
      const ctx = createDBContext(prisma);
      return badgeService.getUserBadges(ctx, user.userId);
    });

    const earnedBadges = badges.filter(badge => badge.earnedAt);
    const lockedBadges = badges.filter(badge => !badge.earnedAt);

    return successResponse({
      badges: {
        ...badges,
        earnedBadges,
        lockedBadges,
        stats: {
          total: badges.length,
          earned: earnedBadges.length,
          locked: lockedBadges.length,
          completionRate: Math.round((earnedBadges.length / badges.length) * 100)  
        }
      },
      message: 'All user badges retrieved successfully'
    })

  } catch (error: any) {
    return errorResponse(error);
  }
};
