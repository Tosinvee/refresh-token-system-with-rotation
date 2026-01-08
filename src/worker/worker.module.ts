import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { environment } from 'src/environments/environment';
import { NotificationProcessor } from './notification.processor';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: environment.queues.NOTIFICATION,
    }),
    FirebaseModule,
  ],
  providers: [NotificationProcessor],
})
export class WorkerModule {}
