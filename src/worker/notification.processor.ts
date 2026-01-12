import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { environment } from 'src/environments/environment';
import { NotificationService } from 'src/notification/notification.service';

const { NOTIFICATION } = environment.queues;

@Processor(NOTIFICATION)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  @Process('push-notification')
  async handleSendPush(
    job: Job<{
      title: string;
      message: string;
      userId: string;
    }>,
  ) {
    const { title, message, userId } = job.data;
    this.logger.log('Processing Notification...');
    this.logger.log({ title, message, userId });

    await this.notificationService.send(userId, title, message);
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
