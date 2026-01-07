import { config } from 'dotenv';

config();
const { env } = process;

export const environment = {
  port: env.PORT || 4000,
  mongoUri: env.DATABASE_URL,
  jwtAccessTokenSecret: env.JWT_ACCESS_TOKEN_SECRET,
  jwtAccessTokenExpiration: Number(env.JWT_ACCESS_TOKEN_EXPIRATION),
};
