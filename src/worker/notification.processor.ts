import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { environment } from 'src/environments/environment';
import { FirebaseService } from 'src/firebase/firebase.service';

const { NOTIFICATION } = environment.queues;

@Processor(NOTIFICATION)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  constructor(
    private configService: ConfigService,
    private firebaseService: FirebaseService,
  ) {}

  @Process('push-notification')
  async handleSendPush(
    job: Job<{
      title: string;
      message: string;
      fcmToken: string;
      userId: string;
    }>,
  ) {
    const { title, message, fcmToken, userId } = job.data;
    this.logger.log('Processing Notification...');
    this.logger.log({ title, message, fcmToken, userId });

    await this.firebaseService.sendPushToken(fcmToken, title, message);
    this.logger.log('Notification sent');
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    console.error(
      `❌ Job ${job.id} failed after ${job.attemptsMade} attempts`,
      err.message,
    );
  }
}
