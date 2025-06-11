import { secrets } from '@/lib/secrets';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { readFileSync } from 'fs';
import { join } from 'path';

export const handler = async (_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const specPath = join(__dirname, 'api-specs.yaml');
        const rawYaml = readFileSync(specPath, 'utf8');

        let apiUrl = await secrets.getApiUrl();

        if (!apiUrl.startsWith('http')) {
            apiUrl = `https://${apiUrl}`;
        }
        apiUrl = apiUrl.replace(/\/$/, '');

        const injectedYaml = rawYaml.replace('{{SERVER_URL}}', apiUrl);


        const swaggerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Habitly API</title>
          <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
          <script src="https://unpkg.com/js-yaml@4.1.0/dist/js-yaml.min.js"></script>
          <script>
            window.onload = function() {
              const spec = ${JSON.stringify(injectedYaml)};
              window.ui = SwaggerUIBundle({
                spec: jsyaml.load(spec),
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIBundle.presets.standalone
                ],
                plugins: [
                  SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "BaseLayout",
                // Enable interactive features
                supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'],
                tryItOutEnabled: true,
                // Enable request/response features
                requestInterceptor: (request) => {
                  console.log('Request:', request);
                  return request;
                },
                responseInterceptor: (response) => {
                  console.log('Response:', response);
                  return response;
                },
                // Enable CORS for browser requests
                requestSnippetsEnabled: true,
                requestSnippets: {
                  generators: {
                    "curl_bash": {
                      title: "cURL (bash)",
                      syntax: "bash"
                    },
                    "curl_powershell": {
                      title: "cURL (PowerShell)",
                      syntax: "powershell"
                    },
                    "curl_cmd": {
                      title: "cURL (CMD)",
                      syntax: "bash"
                    }
                  }
                }
              });
            };
          </script>
        </body>
        </html>
        `;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/html' },
            body: swaggerHTML,
        };
    } catch (error: any) {
        console.error('Error loading API docs:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Failed to load API docs',
                message: error.message
            }),
        };
    }
};