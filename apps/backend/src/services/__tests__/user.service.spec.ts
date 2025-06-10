import { userService } from '@/services/user.service';
import { getPrisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { CreateUserData, UpdateUserData } from '@/types/auth.types';

jest.mock('@/lib/auth');
jest.mock('@/services/auth.service');

describe('userService', () => {
    const mockPrisma = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn()
        }
    };

    beforeEach(() => {
        (getPrisma as jest.Mock).mockResolvedValue(mockPrisma);
    });

    describe('createUser', () => {
        const createUserData: CreateUserData = {
            email: 'test@example.com',
            name: 'Test User',
            provider: 'google'
        };

        it('should create user successfully with all fields', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue(testHelper.generateMockUser());

            const result = await userService.createUser(createUserData);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' }
            });
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'test@example.com',
                    name: 'Test User',
                    photoUrl: null,
                    googleId: null,
                    provider: 'google'
                }
            });
            expect(result).toBeDefined();
        });

        it('should create user with minimal fields (Google OAuth)', async () => {
            const googleUserData: CreateUserData = {
                email: 'google@example.com',
                googleId: 'google123',
                provider: 'google'
            };

            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue(testHelper.generateMockUser());

            await userService.createUser(googleUserData);

            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'google@example.com',
                    name: null,
                    photoUrl: null,
                    googleId: 'google123',
                    provider: 'google'
                }
            });
        });

        it('should convert email to lowercase', async () => {
            const upperCaseData = {
                ...createUserData,
                email: 'TEST@EXAMPLE.COM'
            };

            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue(testHelper.generateMockUser());

            await userService.createUser(upperCaseData);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' }
            });
            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    email: 'test@example.com'
                })
            });
        });

        it('should throw error if user already exists', async () => {
            const existingUser = testHelper.generateMockUser();
            mockPrisma.user.findUnique.mockResolvedValue(existingUser);

            await expect(userService.createUser(createUserData))
                .rejects.toThrow('USER_ALREADY_EXISTS');

            expect(mockPrisma.user.create).not.toHaveBeenCalled();
        });

        it('should handle optional fields correctly', async () => {
            const dataWithOptionals: CreateUserData = {
                email: 'test@example.com',
                name: 'Test User',
                photoUrl: 'https://example.com/photo.jpg',
                googleId: 'google123',
                provider: 'google'
            };

            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue(testHelper.generateMockUser());

            await userService.createUser(dataWithOptionals);

            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'test@example.com',
                    name: 'Test User',
                    photoUrl: 'https://example.com/photo.jpg',
                    googleId: 'google123',
                    provider: 'google'
                }
            });
        });
    });

    describe('findUserByEmail', () => {
        it('should find user by email', async () => {
            const mockUser = testHelper.generateMockUser();
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await userService.findUserByEmail('test@example.com');

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' }
            });
            expect(result).toBe(mockUser);
        });

        it('should convert email to lowercase', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await userService.findUserByEmail('TEST@EXAMPLE.COM');

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' }
            });
        });

        it('should return null if user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const result = await userService.findUserByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });
    });

    describe('findUserById', () => {
        it('should find user by id', async () => {
            const mockUser = testHelper.generateMockUser();
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await userService.findUserById(123);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 123 }
            });
            expect(result).toBe(mockUser);
        });

        it('should return null if user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const result = await userService.findUserById(999);

            expect(result).toBeNull();
        });
    });

    describe('findUserByGoogleId', () => {
        it('should find user by Google ID', async () => {
            const mockUser = testHelper.generateMockUser();
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await userService.findUserByGoogleId('google123');

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { googleId: 'google123' }
            });
            expect(result).toBe(mockUser);
        });

        it('should return null if user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const result = await userService.findUserByGoogleId('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('updateUser', () => {
        const userId = 123;
        const mockUpdatedUser = testHelper.generateMockUser();

        beforeEach(() => {
            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);
        });


        it('should update user name', async () => {
            const updateData: UpdateUserData = {
                name: 'New Name'
            };

            await userService.updateUser(userId, updateData);

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    name: 'New Name'
                }
            });
        });

        it('should update multiple fields', async () => {
            const updateData: UpdateUserData = {
                name: 'New Name',
                photoUrl: 'https://example.com/new-photo.jpg',
                isPremium: true
            };

            await userService.updateUser(userId, updateData);

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    name: 'New Name',
                    photoUrl: 'https://example.com/new-photo.jpg',
                    isPremium: true
                }
            });
        });

        it('should handle empty string values as null', async () => {
            const updateData: UpdateUserData = {
                name: '',
                photoUrl: '',
                googleId: ''
            };

            await userService.updateUser(userId, updateData);

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    name: null,
                    photoUrl: null,
                    googleId: null
                }
            });
        });

        it('should only update provided fields', async () => {
            const updateData: UpdateUserData = {
                name: 'Only Name'
            };

            await userService.updateUser(userId, updateData);

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    name: 'Only Name'
                }
            });
        });

        it('should handle boolean isPremium correctly', async () => {
            const updateData: UpdateUserData = {
                isPremium: false
            };

            await userService.updateUser(userId, updateData);

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    isPremium: false
                }
            });
        });
    });

    describe('toUserProfile', () => {
        it('should convert user to UserProfile', () => {
            const mockUser = {
                id: 123,
                email: 'test@example.com',
                name: 'Test User',
                photoUrl: 'https://example.com/photo.jpg',
                isPremium: false,
                joinedAt: new Date('2023-01-01T00:00:00.000Z'),
                provider: 'google'
            };

            const result = userService.toUserProfile(mockUser);

            expect(result).toEqual({
                id: 123,
                email: 'test@example.com',
                name: 'Test User',
                photoUrl: 'https://example.com/photo.jpg',
                isPremium: false,
                joinedAt: '2023-01-01T00:00:00.000Z',
                provider: 'google',
                lastLoginAt: "",
                timezone: "UTC"

            });
        });

        it('should handle null values', () => {
            const mockUser = {
                id: 123,
                email: 'test@example.com',
                name: null,
                photoUrl: null,
                isPremium: false,
                joinedAt: new Date('2023-01-01T00:00:00.000Z'),
                provider: 'google'
            };

            const result = userService.toUserProfile(mockUser);

            expect(result).toEqual({
                id: 123,
                email: 'test@example.com',
                name: null,
                photoUrl: null,
                isPremium: false,
                joinedAt: '2023-01-01T00:00:00.000Z',
                provider: 'google',
                lastLoginAt: "",
                timezone: "UTC"
            });
        });
    });
});