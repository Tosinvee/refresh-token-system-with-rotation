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
    private firebaseService: FirebaseService,
    private userService: UserService,
  ) {}

  async send(
    userId: string,
    title: string,
    body: string,
    options?: { guaranteed?: boolean },
  ) {
    await this.notificationQueue.add('push-notificaton', {
      userId,
      title,
      message: body,
      guaranteed: options?.guaranteed ?? false,
    });
    return { status: 'queued' };
  }
}
