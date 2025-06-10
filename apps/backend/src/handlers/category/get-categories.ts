import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { successResponse, errorResponse } from '@/lib/responses';
import { categoryService } from '@/services/category.service';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const categories = categoryService.getAllCategories();

    return successResponse({
      categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error: any) {
    return errorResponse(error);
  }
};
