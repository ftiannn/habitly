import { APIGatewayProxyResultV2 } from "aws-lambda";

const CORS_HEADERS = {
    'Content-Type': 'application/json',
};

export function successResponse<T>(
    data: T,
    message?: string,
    statusCode: number = 200
): APIGatewayProxyResultV2 {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: true,
            data,
            message,
        }),
    };
}

export function errorResponse(
    error: string,
    statusCode: number = 400
): APIGatewayProxyResultV2 {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: false,
            error,
        }),
    };
}

export function parseBody<T = any>(body: string | null | undefined): T {
    if (!body) {
        throw new Error('Request body is required');
    }

    return JSON.parse(body) as T;
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^(?!\.)(?!.*\.\.)(?!.*\.$)(?!.*\s)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

export function handleAuthError(error: any) {    
    switch (error.message) {
        case 'AUTHENTICATION_REQUIRED':
            return errorResponse('Authentication token required', 401);
        case 'TOKEN_EXPIRED':
            return errorResponse('Token expired', 401);
        case 'INVALID_TOKEN':
            return errorResponse('Invalid token', 401);
        case 'USER_NOT_FOUND':
            return errorResponse('User not found', 404);
        default:
            return errorResponse('Authentication failed', 500);
    }
}