const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API Documentation',
    version: '1.0.0',
    description: 'Documentation for Express.js API',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development Server',
    },
  ],
  components: {
    schemas: {
      TokenResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Tokens generated successfully',
          },
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR...',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR...',
          },
        },
      },
      RefreshResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Token refreshed successfully',
          },
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR...',
          },
        },
      },
      CreateQuoteRequest: {
        type: 'object',
        required: ['userId', 'type', 'token', 'pairToken'],
        properties: {
          userId: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of the user creating the quote',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          type: {
            type: 'string',
            enum: ['BUY', 'SELL'],
            description: 'The type of quote (BUY or SELL)',
            example: 'BUY',
          },
          token: {
            type: 'string',
            description: 'The token symbol for the quote',
            example: 'ETH',
          },
          tokenAmount: {
            type: 'number',
            description:
              'The amount of the token for the quote (required for SELL)',
            example: 1.5,
          },
          pairToken: {
            type: 'string',
            description: 'The pair token symbol for the quote',
            example: 'USDC',
          },
          pairTokenAmount: {
            type: 'number',
            description:
              'The amount of the pair token for the quote (required for BUY)',
            example: 3000,
          },
        },
      },
      QuoteResponse: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'The unique identifier of the quote',
            example: '123e4567-e89b-12d3-a456-426614174001',
          },
          userId: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of the user who created the quote',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          type: {
            type: 'string',
            enum: ['BUY', 'SELL'],
            description: 'The type of quote',
            example: 'BUY',
          },
          token: {
            type: 'string',
            description: 'The token symbol',
            example: 'ETH',
          },
          tokenAmount: {
            type: 'number',
            description: 'The amount of the token',
            example: 1.5,
          },
          pairToken: {
            type: 'string',
            description: 'The pair token symbol',
            example: 'USDC',
          },
          pairTokenAmount: {
            type: 'number',
            description: 'The amount of the pair token',
            example: 3000,
          },
          relayerNonce: {
            type: 'number',
            description: 'A unique nonce to track quotes',
            example: 42,
          },
        },
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['quoteId', 'signature'],
        properties: {
          quoteId: {
            type: 'string',
            format: 'uuid',
            description:
              'The unique identifier of the quote to create the order from',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          signature: {
            type: 'string',
            description: 'The cryptographic signature of the order',
            example: '0xabc123...',
          },
        },
      },
      OrderResponse: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'The unique identifier of the order',
            example: '123e4567-e89b-12d3-a456-426614174001',
          },
          quoteId: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of the associated quote',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          userId: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of the user who created the order',
            example: '123e4567-e89b-12d3-a456-426614174002',
          },
          transactionHash: {
            type: 'string',
            description: 'The transaction hash for the order execution',
            example: '0xabc123...',
          },
          status: {
            type: 'string',
            description: 'The status of the order',
            enum: ['PENDING', 'FAILED', 'CONFIRMED'],
            example: 'CONFIRMED',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'An error occurred',
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './src/controllers/*.js'], // Paths to files with Swagger annotations
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
