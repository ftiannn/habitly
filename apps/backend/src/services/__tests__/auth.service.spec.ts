import { userService } from '@/services/user.service';
import { auth } from '@/lib/auth';
import { authService } from '../auth.service';
import { getPrisma } from '@/lib/prisma';

jest.mock('@/lib/auth');
jest.mock('@/services/user.service');
jest.mock('@/lib/prisma');

describe('authService', () => {
    const mockUser = {
        id: 123,
        email: 'test@example.com',
        name: 'Test User',
        provider: 'email',
        googleId: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockPrisma = {
        refreshToken: {
            create: jest.fn(),
            deleteMany: jest.fn(),
            findMany: jest.fn()
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (getPrisma as jest.Mock).mockResolvedValue(mockPrisma);
    });

    describe('googleOAuth', () => {
        const mockGoogleProfile = {
            sub: 'google-123',
            email: 'google@example.com',
            name: 'Google User',
            picture: 'https://example.com/pic.jpg',
            email_verified: true
        };

        it('should create new user if not exists', async () => {
            (auth.verifyGoogleToken as jest.Mock).mockResolvedValue(mockGoogleProfile);
            (userService.findUserByEmail as jest.Mock).mockResolvedValue(null);
            (userService.createUser as jest.Mock).mockResolvedValue(mockUser);
            (auth.generateToken as jest.Mock).mockResolvedValue('access-token');
            (userService.toUserProfile as jest.Mock).mockReturnValue({
                id: mockUser.id,
                email: mockGoogleProfile.email,
                name: mockGoogleProfile.name
            });

            const result = await authService.googleOAuth({ idToken: 'google-token', timezone: 'UTC' });

            expect(userService.createUser).toHaveBeenCalledWith({
                email: mockGoogleProfile.email,
                name: mockGoogleProfile.name,
                googleId: mockGoogleProfile.sub,
                provider: 'google',
                photoUrl: 'https://example.com/pic.jpg',
                timezone: 'UTC'
            });
            expect(result.accessToken).toBe('access-token');
            expect(result.refreshToken).toBeDefined();
        });

        it('should login existing user', async () => {
            (auth.verifyGoogleToken as jest.Mock).mockResolvedValue(mockGoogleProfile);
            (userService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
            (auth.generateToken as jest.Mock).mockResolvedValue('access-token');
            (userService.toUserProfile as jest.Mock).mockReturnValue({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name
            });

            const result = await authService.googleOAuth({ idToken: 'google-token', timezone: 'UTC' });

            expect(userService.createUser).not.toHaveBeenCalled();
            expect(result.accessToken).toBe('access-token');
            expect(result.refreshToken).toBeDefined();
        });
    });

    describe('logout', () => {
        it('should delete all refresh tokens for user', async () => {
            await authService.logout(123);

            expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
                where: { userId: 123 }
            });
        });
    });

    describe('getUserProfile', () => {
        it('should throw if user is not found', async () => {
            (userService.findUserById as jest.Mock).mockResolvedValue(null);
            
            await expect(authService.getUserProfile(123))
                .rejects.toThrow('USER_NOT_FOUND');
        });

        it('should return user profile', async () => {
            const mockProfile = { id: mockUser.id, email: mockUser.email };
            (userService.findUserById as jest.Mock).mockResolvedValue(mockUser);
            (userService.toUserProfile as jest.Mock).mockReturnValue(mockProfile);

            const profile = await authService.getUserProfile(mockUser.id);
            
            expect(profile).toEqual(mockProfile);
            expect(userService.toUserProfile).toHaveBeenCalledWith(mockUser);
        });
    });

    describe('generateAuthResponse', () => {
        it('should generate response without refresh token when includeRefreshToken is false', async () => {
            (auth.generateToken as jest.Mock).mockResolvedValue('access-token');
            (userService.toUserProfile as jest.Mock).mockReturnValue({
                id: mockUser.id,
                email: mockUser.email
            });

            const result = await authService.generateAuthResponse(mockUser, false);

            expect(result.accessToken).toBe('access-token');
            expect(result.refreshToken).toBeUndefined();
            expect(mockPrisma.refreshToken.create).not.toHaveBeenCalled();
        });

        it('should generate response with refresh token by default', async () => {
            (auth.generateToken as jest.Mock).mockResolvedValue('access-token');
            (userService.toUserProfile as jest.Mock).mockReturnValue({
                id: mockUser.id,
                email: mockUser.email
            });

            const result = await authService.generateAuthResponse(mockUser);

            expect(result.accessToken).toBe('access-token');
            expect(result.refreshToken).toBeDefined();
            expect(mockPrisma.refreshToken.create).toHaveBeenCalled();
        });
    });

    describe('cleanupRefreshTokens', () => {
        it('should delete old tokens keeping only 5 most recent', async () => {
            const tokensToDelete = [{ id: 1 }, { id: 2 }, { id: 3 }];
            mockPrisma.refreshToken.findMany.mockResolvedValue(tokensToDelete);



            await authService.cleanupRefreshTokens(123);

            expect(mockPrisma.refreshToken.findMany).toHaveBeenCalledWith({
                where: { userId: 123 },
                orderBy: { createdAt: 'desc' },
                skip: 5,
                select: { id: true }
            });
            expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
                where: {
                    id: { in: [1, 2, 3] }
                }
            });
        });

        it('should not delete tokens if 5 or fewer exist', async () => {
            mockPrisma.refreshToken.findMany.mockResolvedValue([]);

            await authService.cleanupRefreshTokens(123);

            expect(mockPrisma.refreshToken.deleteMany).not.toHaveBeenCalled();
        });
    });
});
