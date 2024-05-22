import { registerAs } from '@nestjs/config';

export default registerAs('base', () => ({
  port: process.env.HTTP_PORT,
  cors: process.env.CORS_ENABLED === 'true',
}));
