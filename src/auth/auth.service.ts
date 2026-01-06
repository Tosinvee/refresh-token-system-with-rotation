import {
  BadRequestException,
  Body,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { TokenPayload } from './interface/token.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

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

  async login(user: User) {
    const tokenPaylod: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };
    const accessToken = this.jwtService.sign(tokenPaylod, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION'),
    });
    return {
      accessToken,
    };
  }
}
