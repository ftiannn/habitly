import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { secrets } from './secrets';

export interface JwtPayload {
    userId: number;
    email: string;
    iat?: number;
    exp?: number;
}
export interface AuthenticatedUser {
    userId: number;
    email: string;
}

export interface GoogleProfile {
    sub: string;
    email: string;
    name: string | undefined;
    picture: string | undefined;
    email_verified: boolean | undefined;
}

let googleClient: OAuth2Client | null = null;

export const auth = {
    async generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
        const secret = await secrets.getJwtSecret();

        return jwt.sign(payload, secret, {
            expiresIn: '7d',
            issuer: 'habitly-api',
            audience: 'habitly-app', 
            subject: payload.userId.toString(), 
            algorithm: 'HS256'
        });
    },

    async verifyGoogleToken(idToken: string): Promise<GoogleProfile> {
        if (!googleClient) {
            const clientId = await secrets.getGoogleClientId();
            googleClient = new OAuth2Client(clientId);
        }

        try {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: await secrets.getGoogleClientId(),
            });

            const payload = ticket.getPayload();

            if (!payload?.email) {
                throw new Error('Invalid Google token payload');
            }

            return {
                sub: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                email_verified: payload.email_verified,
            };
        } catch (error) {
            console.error('Google token verification failed:', error);
            throw new Error('INVALID_GOOGLE_TOKEN');
        }
    },

    extractTokenFromEvent(event: APIGatewayProxyEventV2): string | null {
        const authHeader = event.headers.authorization ?? event.headers.Authorization;
        if (!authHeader) return null;

        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) return null;

        return token;
    },

    async verifyToken(token: string): Promise<JwtPayload> {
        const secret = await secrets.getJwtSecret();
        try {        
            const verified = jwt.verify(token, secret, {
                issuer: 'habitly-api',
                audience: 'habitly-app', 
                algorithms: ['HS256'],            
            })

            return verified as JwtPayload;        

        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('TOKEN_EXPIRED');
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('INVALID_TOKEN');
            } else {
                throw new Error('TOKEN_VERIFICATION_FAILED');
            }
        }
    },

    async authenticateRequest(event: APIGatewayProxyEventV2): Promise<AuthenticatedUser> {
        const token = this.extractTokenFromEvent(event);
        
        if (!token) {
            throw new Error('AUTHENTICATION_REQUIRED');
        }

        const payload = await this.verifyToken(token);

        return {
            userId: payload.userId,
            email: payload.email
        };
    },
};
