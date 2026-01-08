import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post()
  send(@Body() dto: SendNotificationDto) {
    return this.service.send(dto);
  }
}
