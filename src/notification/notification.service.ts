import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { environment } from '../environments/environment';
import { Queue } from 'bull';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UserService } from 'src/user/user.service';
const { NOTIFICATION } = environment.queues;

@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue(NOTIFICATION) private readonly notificationQueue: Queue,
  ) {}

  async send(userId: string, title: string, body: string) {
    await this.notificationQueue.add('push-notification', {
      userId,
      title,
      message: body,
    });

    return { status: 'queued' };
  }
}
