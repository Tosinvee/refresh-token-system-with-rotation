import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { environment } from '../environments/environment';
import { Queue } from 'bull';
import { SendNotificationDto } from './dto/send-notification.dto';
const { NOTIFICATION } = environment.queues;

@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue(NOTIFICATION) private readonly notificationQueue: Queue,
  ) {}

  async send(dto: SendNotificationDto) {
    await this.notificationQueue.add('push-notification', dto, {
      attempts: 3,
      backoff: 5000,
      removeOnComplete: true,
    });
    return { status: 'queued' };
  }
}
