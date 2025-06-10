import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import {
    successResponse,
    errorResponse,
    parseBody,
    validateEmail,
} from '../responses';

describe('Response Utilities', () => {

    describe('successResponse', () => {
        it('should create a success response with default status 200', () => {
            const data = { userId: 1, name: 'Test User' };
            const response = successResponse(data) as APIGatewayProxyStructuredResultV2;

            expect(response.statusCode).toBe(200);
            expect(response.headers).toEqual({
                'Content-Type': 'application/json',
            });

            const body = JSON.parse(response.body!);
            expect(body.success).toBe(true);
            expect(body.data).toEqual(data);
            expect(body.message).toBeUndefined();
        });

        it('should create a success response with custom status code', () => {
            const data = { id: 1 };
            const message = 'Created successfully';
            const response = successResponse(data, message, 201) as APIGatewayProxyStructuredResultV2;

            expect(response.statusCode).toBe(201);

            const body = JSON.parse(response.body!);
            expect(body.success).toBe(true);
            expect(body.data).toEqual(data);
            expect(body.message).toBe(message);
        });

        it('should handle null data', () => {
            const response = successResponse(null, 'No data') as APIGatewayProxyStructuredResultV2;

            const body = JSON.parse(response.body!);
            expect(body.success).toBe(true);
            expect(body.data).toBeNull();
            expect(body.message).toBe('No data');
        });

        it('should handle array data', () => {
            const data = [{ id: 1 }, { id: 2 }];
            const response = successResponse(data) as APIGatewayProxyStructuredResultV2;

            const body = JSON.parse(response.body!);
            expect(body.success).toBe(true);
            expect(body.data).toEqual(data);
        });

        it('should handle string data', () => {
            const data = 'Simple string response';
            const response = successResponse(data) as APIGatewayProxyStructuredResultV2;

            const body = JSON.parse(response.body!);
            expect(body.success).toBe(true);
            expect(body.data).toBe(data);
        });

        it('should handle boolean data', () => {
            const response = successResponse(true, 'Operation completed') as APIGatewayProxyStructuredResultV2;

            const body = JSON.parse(response.body!);
            expect(body.success).toBe(true);
            expect(body.data).toBe(true);
        });

        it('should handle empty object data', () => {
            const response = successResponse({}) as APIGatewayProxyStructuredResultV2;

            const body = JSON.parse(response.body!);
            expect(body.success).toBe(true);
            expect(body.data).toEqual({});
        });

        it('should include message when provided', () => {
            const data = { test: true };
            const message = 'Test successful';
            const response = successResponse(data, message) as APIGatewayProxyStructuredResultV2;

            const body = JSON.parse(response.body!);
            expect(body.message).toBe(message);
        });
    });

    describe('errorResponse', () => {
        it('should create an error response with default status 400', () => {
            const error = 'Something went wrong';
            const response = errorResponse(error) as APIGatewayProxyStructuredResultV2;

            expect(response.statusCode).toBe(400);
            expect(response.headers).toEqual({

                'Content-Type': 'application/json',
            });

            const body = JSON.parse(response.body!);
            expect(body.success).toBe(false);
            expect(body.error).toBe(error);
        });

        it('should create an error response with custom status code', () => {
            const error = 'Unauthorized';
            const response = errorResponse(error, 401) as APIGatewayProxyStructuredResultV2;

            expect(response.statusCode).toBe(401);

            const body = JSON.parse(response.body!);
            expect(body.success).toBe(false);
            expect(body.error).toBe(error);
        });

        it('should handle different HTTP error codes', () => {
            const testCases = [
                { error: 'Bad Request', code: 400 },
                { error: 'Unauthorized', code: 401 },
                { error: 'Forbidden', code: 403 },
                { error: 'Not Found', code: 404 },
                { error: 'Conflict', code: 409 },
                { error: 'Internal Server Error', code: 500 },
            ];

            testCases.forEach(({ error, code }) => {
                const response = errorResponse(error, code) as APIGatewayProxyStructuredResultV2;
                expect(response.statusCode).toBe(code);

                const body = JSON.parse(response.body!);
                expect(body.error).toBe(error);
            });
        });

        it('should handle empty error message', () => {
            const response = errorResponse('') as APIGatewayProxyStructuredResultV2;

            const body = JSON.parse(response.body!);
            expect(body.success).toBe(false);
            expect(body.error).toBe('');
        });

        it('should handle long error messages', () => {
            const longError = 'A'.repeat(1000);
            const response = errorResponse(longError) as APIGatewayProxyStructuredResultV2;

            const body = JSON.parse(response.body!);
            expect(body.error).toBe(longError);
        });
    });

    describe('parseBody', () => {
        it('should parse valid JSON string', () => {
            const jsonString = '{"name": "John", "age": 30}';
            const result = parseBody(jsonString);

            expect(result).toEqual({ name: 'John', age: 30 });
        });

        it('should parse array JSON', () => {
            const jsonString = '[{"id": 1}, {"id": 2}]';
            const result = parseBody(jsonString);

            expect(result).toEqual([{ id: 1 }, { id: 2 }]);
        });

        it('should parse simple values', () => {
            expect(parseBody('true')).toBe(true);
            expect(parseBody('false')).toBe(false);
            expect(parseBody('null')).toBe(null);
            expect(parseBody('123')).toBe(123);
            expect(parseBody('"hello"')).toBe('hello');
        });

        it('should throw error for null body', () => {
            expect(() => parseBody(null)).toThrow('Request body is required');
        });

        it('should throw error for undefined body', () => {
            expect(() => parseBody(undefined)).toThrow('Request body is required');
        });

        it('should throw error for empty string', () => {
            expect(() => parseBody('')).toThrow('Request body is required');
        });

        it('should throw error for invalid JSON', () => {
            const invalidJsons = [
                '{"name": "John",}',  // Trailing comma
                '{"name": John}',     // Unquoted value
                '{name: "John"}',     // Unquoted key
                '{"name": "John"',    // Missing closing brace
                'not json at all',    // Not JSON
            ];

            invalidJsons.forEach(invalidJson => {
                expect(() => parseBody(invalidJson)).toThrow();
            });
        });

        it('should handle deeply nested objects', () => {
            const deepObject = {
                level1: {
                    level2: {
                        level3: {
                            value: 'deep'
                        }
                    }
                }
            };
            const jsonString = JSON.stringify(deepObject);
            const result = parseBody(jsonString);

            expect(result).toEqual(deepObject);
        });
    });

    describe('validateEmail', () => {
        it('should return true for valid emails', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'user+tag@site.org',
                'email123@test-domain.com',
                'a@b.co',
                'very.long.email.address@very.long.domain.name.com',
                'user_name@domain.com',
                'user-name@domain.com',
                '123@domain.com',
            ];

            validEmails.forEach(email => {
                expect(validateEmail(email)).toBe(true);
            });
        });

        it('should return false for invalid emails', () => {
            const invalidEmails = [
                'invalid-email',           // No @ or domain
                'test@',                  // No domain
                '@example.com',           // No local part
                'test..test@example.com', // Double dots
                'test@example',           // No TLD
                'test @example.com',      // Space in local part
                'test@ example.com',      // Space in domain
                'test@example .com',      // Space in domain
                '',                       // Empty string
                'test@',                  // Missing domain
                '@',                      // Just @
                'test@@example.com',      // Double @
                'test@example..com',      // Double dots in domain
                '.test@example.com',      // Leading dot
                'test.@example.com',      // Trailing dot in local
                'test@example.com.',      // Trailing dot in domain
            ];

            invalidEmails.forEach(email => {
                expect(validateEmail(email)).toBe(false);
            });
        });
    });
});