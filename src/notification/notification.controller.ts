import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { JwtAuthGuards } from 'src/auth/guard/jwt-auth.guard';

@Controller('notification')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post()
  @UseGuards(JwtAuthGuards)
  send(@Body() dto: SendNotificationDto) {
    return this.service.send(dto.userId, dto.title, dto.message);
  }
}
