import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { environment } from '../environments/environment';
import { Queue } from 'bull';
import { SendNotificationDto } from './dto/send-notification.dto';
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
    if (!options?.guaranteed) {
      await this.firebaseService.sendViaTopic(userId, title, body);
      return;
    }

    const tokens = await this.userService.getActiveToken(userId);

    const results = await this.firebaseService.sendViaToken(
      tokens.map((t) => t.token),
      title,
      body,
    );

    results.forEach((res, index) => {
      if (
        res.status === 'rejected' &&
        res.reason?.code === 'messaging/registration-token-not-registered'
      ) {
        this.userService.deactivateToken(tokens[index].token);
      }
    });
    return { status: 'queued' };
  }
}
