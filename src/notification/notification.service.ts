import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { environment } from '../environments/environment';
import { Queue } from 'bull';
const { NOTIFICATION } = environment.queues;

@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue(NOTIFICATION) private readonly notificationQueue: Queue,
  ) {}

  async pushNotification(userId: string, title: string, body: string) {
    await this.notificationQueue.add('push-notification', {
      userId,
      title,
      message: body,
    });

    return { status: 'queued' };
  }
}
