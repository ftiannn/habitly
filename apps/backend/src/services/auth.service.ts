import crypto from 'crypto';
import { DBContext, getPrisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { userService } from './user.service';
import {
    GoogleOAuthRequest,
    AuthResponse,
} from '@/types/auth.types';

export const authService = {
    async logout(userId: number): Promise<void> {
        const prisma = await getPrisma();

        await prisma.refreshToken.deleteMany({
            where: { userId },
        });

        console.info(`Logged out user ${userId} - cleared all refresh tokens`);
    },

    async googleOAuth(data: GoogleOAuthRequest): Promise<AuthResponse> {
        const googleProfile = await auth.verifyGoogleToken(data.idToken);
        let user = await userService.findUserByEmail(googleProfile.email);

        if (!user) {
            user = await userService.createUser({
                email: googleProfile.email,
                name: googleProfile.name,
                photoUrl: googleProfile.picture,
                googleId: googleProfile.sub,
                timezone: data.timezone,
                provider: 'google'
            });
        }

        return this.generateAuthResponse(user);
    },

    async getUserProfile(userId: number) {
        const user = await userService.findUserById(userId);

        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }

        return userService.toUserProfile(user);
    },

    async getRefreshToken(ctx: DBContext, refreshToken: string) {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const storedToken = await ctx.db.refreshToken.findFirst({
            where: {
                tokenHash,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: true,
            },
        });

        if (!storedToken) {
            throw new Error('INVALID_TOKEN');
        }

        await authService.cleanupRefreshTokens(storedToken.userId);

        const authResponse = await authService.generateAuthResponse(storedToken.user, true);

        await ctx.db.refreshToken.delete({
            where: { id: storedToken.id },
        });

        return authResponse
    },

    async generateAuthResponse(user: any, includeRefreshToken: boolean = true): Promise<AuthResponse> {
        const accessToken = await auth.generateToken({
            userId: user.id,
            email: user.email,
        });

        const response: AuthResponse = {
            user: userService.toUserProfile(user),
            accessToken,
        };

        if (includeRefreshToken) {
            const refreshToken = crypto.randomBytes(64).toString('hex');
            const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

            const prisma = await getPrisma();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await prisma.refreshToken.create({
                data: {
                    tokenHash: refreshTokenHash,
                    userId: user.id,
                    expiresAt,
                },
            });

            response.refreshToken = refreshToken;
        }

        return response;
    },

    async cleanupRefreshTokens(userId: number): Promise<void> {
        const prisma = await getPrisma();

        // Keep only the 5 most recent tokens
        const tokensToDelete = await prisma.refreshToken.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: 5,
            select: { id: true },
        });

        if (tokensToDelete.length > 0) {
            await prisma.refreshToken.deleteMany({
                where: {
                    id: { in: tokensToDelete.map(t => t.id) },
                },
            });
        }
    },
};