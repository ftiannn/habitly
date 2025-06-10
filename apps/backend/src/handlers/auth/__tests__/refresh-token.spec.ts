import { getPrisma, createDBContext } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/responses";
import { authService } from "@/services/auth.service";
import { handler } from '@/handlers/auth/refresh-token';

jest.mock('@/services/auth.service', () => ({
  authService: {
    getRefreshToken: jest.fn()
  }
}));

jest.mock('@/lib/prisma', () => ({
  getPrisma: jest.fn(),
  createDBContext: jest.fn()
}));

jest.mock('@/lib/responses', () => ({
  ...jest.requireActual('@/lib/responses'),
  successResponse: jest.fn(),
  errorResponse: jest.fn(),
  parseBody: jest.fn((body) => JSON.parse(body || '{}')),
  handleAuthError: jest.fn((err) => ({ statusCode: 500, body: JSON.stringify({ message: 'Internal error' }) }))
}));


describe('refresh-token.handler', () => {
  const mockPrisma = {};
  const mockCtx = { db: 'ctx' };

  beforeEach(() => {
    jest.clearAllMocks();
    (getPrisma as jest.Mock).mockResolvedValue(mockPrisma);
    (createDBContext as jest.Mock).mockReturnValue(mockCtx);
  });

  it('should return refreshed tokens on success', async () => {
    const mockAuthResponse = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      user: { id: 1, email: 'test@example.com' }
    };

    (authService.getRefreshToken as jest.Mock).mockResolvedValue(mockAuthResponse);
    (successResponse as jest.Mock).mockReturnValue({ statusCode: 200, body: 'success response' });

    const result = await handler({
      body: JSON.stringify({ refreshToken: 'valid-refresh-token' })
    } as any);

    expect(getPrisma).toHaveBeenCalled();
    expect(createDBContext).toHaveBeenCalledWith(mockPrisma);
    expect(authService.getRefreshToken).toHaveBeenCalledWith(mockCtx, 'valid-refresh-token');
    expect(successResponse).toHaveBeenCalledWith(mockAuthResponse, 'Token refreshed successfully');
    expect(result).toEqual({ statusCode: 200, body: 'success response' });
  });

  it('should return 400 if refresh token is missing', async () => {
    (errorResponse as jest.Mock).mockReturnValue({ statusCode: 400, body: 'Missing token' });

    const result = await handler({
      body: JSON.stringify({})
    } as any);

    expect(errorResponse).toHaveBeenCalledWith('Refresh token is required', 400);
    expect(result).toEqual({ statusCode: 400, body: 'Missing token' });
  });

  it('should handle known service error', async () => {
    const mockError = new Error('Invalid token');
    (authService.getRefreshToken as jest.Mock).mockRejectedValue(mockError);
    const mockHandled = { statusCode: 401, body: JSON.stringify({ message: 'Invalid token' }) };

    const { handleAuthError } = jest.requireMock('@/lib/responses');
    handleAuthError.mockReturnValue(mockHandled);

    const result = await handler({
      body: JSON.stringify({ refreshToken: 'bad-token' })
    } as any);

    expect(handleAuthError).toHaveBeenCalledWith(mockError);
    expect(result).toEqual(mockHandled);
  });

  it('should handle parse error and unexpected issues', async () => {
    const { parseBody, handleAuthError } = jest.requireMock('@/lib/responses');
    parseBody.mockImplementation(() => { throw new Error('Parse error'); });
    handleAuthError.mockReturnValue({ statusCode: 500, body: 'Internal error' });

    const result = await handler({ body: 'invalid-json' } as any);

    expect(handleAuthError).toHaveBeenCalled();
    expect(result).toEqual({ statusCode: 500, body: 'Internal error' });
  });
});
