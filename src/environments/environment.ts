import { config } from 'dotenv';

config();
const { env } = process;

export const environment = {
  port: env.PORT || 4000,
  mongoUri: env.DATABASE_URL,
};
