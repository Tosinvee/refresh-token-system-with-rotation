import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { environment } from 'src/environments/environment';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UserService } from 'src/user/user.service';

const { NOTIFICATION } = environment.queues;

@Processor(NOTIFICATION)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userService: UserService,
  ) {}

  @Process('push-notification')
  async handleSendPush(
    job: Job<{
      title: string;
      message: string;
      userId: string;
      guaranteed: boolean;
    }>,
  ) {
    const { title, message, userId, guaranteed } = job.data;

    this.logger.log(`Sending notification to ${userId}`);

    if (!guaranteed) {
      await this.firebaseService.sendViaTopic(userId, title, message);
      return;
    }

    const tokens = await this.userService.getActiveToken(userId);

    const results = await this.firebaseService.sendViaToken(
      tokens.map((t) => t.token),
      title,
      message,
    );

    results.forEach((res, index) => {
      if (
        res.status === 'rejected' &&
        res.reason?.code === 'messaging/registration-token-not-registered'
      ) {
        this.userService.deactivateToken(tokens[index].token);
      }
    });
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    console.error(
      `❌ Job ${job.id} failed after ${job.attemptsMade} attempts`,
      err.message,
    );
  }
}
