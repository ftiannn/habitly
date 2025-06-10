import { DBContext, getPrisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UserProfile, CreateUserData, UpdateUserData } from '@/types/auth.types';
import { UpdateProfileInput, UpdateSettingsInput, UserSettingResponse } from '@/types/user.types';

export const userService = {
    async createUser(data: CreateUserData) {
        const prisma = await getPrisma();

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });

        if (existingUser) {
            throw new Error('USER_ALREADY_EXISTS');
        }

        const prismaData = {
            email: data.email.toLowerCase(),
            name: data.name ?? null,
            photoUrl: data.photoUrl ?? null,
            googleId: data.googleId ?? null,
            provider: data.provider,
        };

        return await prisma.user.create({
            data: prismaData,
        });
    },

    async findUserByEmail(email: string) {
        const prisma = await getPrisma();
        return await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
    },

    async findUserById(id: number) {
        const prisma = await getPrisma();
        return await prisma.user.findUnique({
            where: { id },
        });
    },

    async findUserByGoogleId(googleId: string) {
        const prisma = await getPrisma();
        return await prisma.user.findUnique({
            where: { googleId },
        });
    },

    async updateUser(id: number, data: UpdateUserData) {
        const prisma = await getPrisma();

        const prismaData: any = {};

        if (data.name !== undefined) {
            prismaData.name = data.name || null;
        }

        if (data.photoUrl !== undefined) {
            prismaData.photoUrl = data.photoUrl || null;
        }

        if (data.googleId !== undefined) {
            prismaData.googleId = data.googleId || null;
        }

        if (data.isPremium !== undefined) {
            prismaData.isPremium = data.isPremium;
        }

        return await prisma.user.update({
            where: { id },
            data: prismaData,
        });
    },

    toUserProfile(user: any): UserProfile {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            photoUrl: user.photoUrl,
            isPremium: false,
            provider: 'google',
            timezone: user.timezone || 'UTC',
            joinedAt: user.joinedAt.toISOString(),
            lastLoginAt: user.lastLoginAt?.toISOString() || '',
        };
    },

    async getUserProfile(ctx: DBContext, userId: number): Promise<UserProfile> {
        const user = await ctx.db.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name || '',
            photoUrl: user.photoUrl || '',
            isPremium: false,
            provider: 'google',
            timezone: user.timezone || 'UTC',
            joinedAt: user.joinedAt.toISOString(),
            lastLoginAt: user.lastLoginAt?.toISOString() || '',
        };
    },

    async updateUserProfile(
        ctx: DBContext,
        userId: number,
        input: UpdateProfileInput
    ): Promise<UserProfile> {
        await ctx.db.user.update({
            where: { id: userId },
            data: {
                ...(input.name && { name: input.name }),
                ...(input.timezone && { timezone: input.timezone }),
                // updatedAt: new Date() //TODO: Add updated date
            }
        });

        return this.getUserProfile(ctx, userId);
    },

    async getUserSettings(ctx: DBContext, userId: number): Promise<UserSettingResponse> {
        const settings = await ctx.db.userSettings.findUnique({
            where: { userId }
        });

        return {
            emailNotifications: settings?.emailNotifications ?? true,
            publicProfile: settings?.publicProfile ?? false,
            quietHoursEnabled: settings?.quietHoursEnabled ?? false,
            quietHoursStart: settings?.quietHoursStart || '22:00',
            quietHoursEnd: settings?.quietHoursEnd || '08:00'
        };
    },

    async updateUserSettings(
        ctx: DBContext,
        userId: number,
        input: UpdateSettingsInput
    ): Promise<UserSettingResponse> {
        await ctx.db.userSettings.upsert({
            where: { userId },
            update: {
                ...input,
                updatedAt: new Date()
            },
            create: {
                userId,
                ...input,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        return this.getUserSettings(ctx, userId);
    }
};
