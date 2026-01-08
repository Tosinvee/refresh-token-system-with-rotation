import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { BullModule } from '@nestjs/bull';
import { environment } from 'src/environments/environment';

@Module({
  imports: [
    BullModule.registerQueue({
      name: environment.queues.NOTIFICATION,
    }),
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
