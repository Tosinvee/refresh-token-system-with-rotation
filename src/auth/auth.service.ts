import {
  BadRequestException,
  Body,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { TokenPayload } from './interface/token.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  RefreshToken,
  RefreshTokenSchema,
} from 'src/user/schema/refresh-token.schema';
import redisClient from 'src/utils/redisClient';

@Injectable()
export class AuthService {
  private logger: Logger;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async onModuleDestroy() {
    await redisClient.quit();
    this.logger.log('Redis connection gracefully closed');
  }

  generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }
  hashForDb(token: string) {
    return bcrypt.hash(token, 10);
  }

  hashForRedis(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async signup(body: CreateUserDto) {
    const existingUser = await this.userService.getUser({ email: body.email });
    if (existingUser) throw new BadRequestException('User already exist');
    await this.userService.create(body);
    return { message: 'User created' };
  }

  async verifyUser(email: string, password: string): Promise<User> {
    const user = await this.userService.getUser({ email });

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    const isValid = await compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return user;
  }

  async refreshToken(userId: string, token: string) {
    const dbHash = await this.hashForDb(token);
    const redisHash = this.hashForRedis(token);
    const refreshToken = await this.refreshTokenModel.create({
      userId,
      token: dbHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await redisClient.set(
      `refresh:${redisHash}`,
      refreshToken._id.toString(),
      'EX',
      30 * 24 * 60 * 60,
    );
  }

  async login(user: User) {
    const tokenPaylod: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };
    const accessToken = this.jwtService.sign(tokenPaylod, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION'),
    });
    const refreshToken = this.generateRefreshToken();
    await this.refreshToken(user._id.toString(), refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const redisHash = this.hashForRedis(refreshToken);

    const cached = await redisClient.get(`refresh:${redisHash}`);

    if (!cached) throw new UnauthorizedException('Invalid refresh token');

    const tokenId = cached;

    const tokenRecord = await this.refreshTokenModel.findOne({
      _id: tokenId,
      revoked: false,
    });

    if (!tokenRecord)
      throw new UnauthorizedException('Refresh token already revoked');

    await this.refreshTokenModel.updateOne({ _id: tokenId }, { revoked: true });
    await redisClient.del(`refresh:${redisHash}`);

    const newRefreshToken = this.generateRefreshToken();

    const userId = tokenRecord.userId.toString();
    await this.refreshToken(userId, newRefreshToken);

    const user = await this.userModel.findById(userId);

    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION'),
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
