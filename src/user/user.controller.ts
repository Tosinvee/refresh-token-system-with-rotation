import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuards } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user';
import { User } from './schema/user.schema';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuards)
  @Post('/register-fcm-token')
  async registerUserFcmToken(
    @CurrentUser()
    user: User,
    @Body('token') token: string,
  ) {
    return this.userService.registerDevice(user._id.toString(), token);
  }
}
