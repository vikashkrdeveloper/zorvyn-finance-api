import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Zorvyn Finance API',
            version: '1.0.0',
            description: 'API documentation for Dashboard Finance tracking system'
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        servers: [
            {
                url: process.env.APP_URL || `http://localhost:${process.env.PORT || 8080}`,
                description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Local Server'
            }
        ],
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    if (process.env.NODE_ENV !== 'test') {
        console.log('Swagger Docs available at /api-docs');
    }
};
