import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { UserModule } from 'src/user/user.module';
import { JwtService } from '@nestjs/jwt';
import { LocalStrategy } from './strategy/local.strategy';
import {
  RefreshToken,
  RefreshTokenSchema,
} from 'src/user/schema/refresh-token.schema';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
    ]),
    UserModule,
  ],
  providers: [AuthService, JwtService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
