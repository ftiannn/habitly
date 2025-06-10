import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const secretsClient = new SecretsManagerClient({
    region: process.env.AWS_REGION || 'ap-southeast-1'
});

const ssmClient = new SSMClient({
    region: process.env.AWS_REGION || 'ap-southeast-1'
});

const cache = new Map<string, { value: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getSecretName(key: string): string {
    const stage = process.env.STAGE || 'dev';
    return `${stage}/habitly/${key}`;
}

async function getSecret(key: string): Promise<string> {
    if (process.env.NODE_ENV === 'development' || process.env.IS_OFFLINE) {
        const envKey = key.toUpperCase().replace(/-/g, '_');
        const envValue = process.env[envKey];

        if (envValue) {
            return envValue;
        }

        if (key === 'database-url') return process.env.DATABASE_URL!;
        if (key === 'jwt-secret') return process.env.JWT_SECRET!;
        if (key === 'google-client-id') return process.env.GOOGLE_CLIENT_ID!;
        if (key === 'google-client-secret') return process.env.GOOGLE_CLIENT_SECRET!;

        throw new Error(`Environment variable not found for ${key} in local development`);
    }

    const secretName = getSecretName(key);
    const cached = cache.get(secretName);

    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.value;
    }

    try {
        const command = new GetSecretValueCommand({ SecretId: secretName });
        const response = await secretsClient.send(command);

        if (!response.SecretString) {
            throw new Error(`Secret ${secretName} has no value`);
        }

        cache.set(secretName, {
            value: response.SecretString,
            timestamp: Date.now()
        });

        return response.SecretString;
    } catch (error) {
        console.error(`Failed to get secret ${secretName}:`, error);
        throw new Error(`Failed to retrieve secret: ${key}`);
    }
}

async function getSSMParameter(key: string): Promise<string> {
    if (process.env.NODE_ENV === 'development' || process.env.IS_OFFLINE) {
        if (key === 'api-custom-domain') return process.env.API_BASE_URL!;
        throw new Error(`Environment variable not found for ${key} in local development`);
    }

    const stage = process.env.STAGE || 'dev';
    const parameterName = `/habitly/${stage}/${key}`;
    
    const cached = cache.get(parameterName);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.value;
    }
    
    try {
        const command = new GetParameterCommand({ Name: parameterName });
        const response = await ssmClient.send(command);
        
        if (!response.Parameter?.Value) {
            throw new Error(`SSM Parameter ${parameterName} has no value`);
        }
        
        cache.set(parameterName, {
            value: response.Parameter.Value,
            timestamp: Date.now()
        });
        
        return response.Parameter.Value;
    } catch (error) {
        console.error(`Failed to get SSM parameter ${parameterName}:`, error);
        throw new Error(`Failed to retrieve SSM parameter: ${key}`);
    }
}

export const secrets = {
    getDatabaseUrl: () => getSecret('database-url'),
    getJwtSecret: () => getSecret('jwt-secret'),
    getGoogleClientId: () => getSecret('google-client-id'),
    getGoogleClientSecret: () => getSecret('google-client-secret'),
    getApiUrl: () => getSSMParameter('api-custom-domain')
};