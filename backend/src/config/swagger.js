import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TransitOps Enterprise API',
      version: '1.0.0',
      description: 'API documentation for the TransitOps Fleet & Logistics Management System',
      contact: {
        name: 'TransitOps Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
      {
        url: 'https://api.transitops.com/api/v1',
        description: 'Production Server',
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format **Bearer &lt;token&gt;**'
        }
      },
      responses: {
        BadRequest: {
          description: 'Validation Error or Business Rule Violation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Validation Error: ...' },
                  errorCode: { type: 'string', example: 'ERR_VALIDATION' },
                  errors: { type: 'array', items: { type: 'object' } },
                  timestamp: { type: 'string' },
                  requestId: { type: 'string' }
                }
              }
            }
          }
        },
        Unauthorized: {
          description: 'Authentication required or invalid token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Authentication required. Please provide a valid Bearer token.' },
                  errorCode: { type: 'string', example: 'ERR_UNAUTHENTICATED' },
                  errors: { type: 'array', items: { type: 'object' } },
                  timestamp: { type: 'string' },
                  requestId: { type: 'string' }
                }
              }
            }
          }
        },
        Forbidden: {
          description: 'Permission denied',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'You do not have permission to perform this action.' },
                  errorCode: { type: 'string', example: 'ERR_UNAUTHORIZED' },
                  errors: { type: 'array', items: { type: 'object' } },
                  timestamp: { type: 'string' },
                  requestId: { type: 'string' }
                }
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Resource not found' },
                  errorCode: { type: 'string', example: 'ERR_NOT_FOUND' },
                  errors: { type: 'array', items: { type: 'object' } },
                  timestamp: { type: 'string' },
                  requestId: { type: 'string' }
                }
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Internal Server Error' },
                  errorCode: { type: 'string', example: 'ERR_INTERNAL' },
                  errors: { type: 'array', items: { type: 'object' } },
                  timestamp: { type: 'string' },
                  requestId: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ],
  },
  // Scan all route files in all features for JSDoc annotations
  apis: ['./src/features/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "TransitOps API Documentation"
  }));
};
