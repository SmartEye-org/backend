export default () => ({
  // Application
  port: parseInt(process.env.PORT ?? '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // AI Service
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    apiPrefix: process.env.AI_SERVICE_API_PREFIX || '/api/v1',
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT ?? '30000', 10),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3001',
      'http://localhost:3000',
    ],
    credentials: true,
  },

  // Database
  database: {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'smart_residential',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },

  // Application info
  app: {
    name: 'Smart eyes Backend',
    version: '0.1.0',
    description: 'Backend service for Smart Residential Monitoring System',
  },
});
