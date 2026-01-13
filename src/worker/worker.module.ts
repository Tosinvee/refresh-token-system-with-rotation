import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { environment } from 'src/environments/environment';
import { NotificationProcessor } from './notification.processor';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: environment.queues.NOTIFICATION,
    }),
    FirebaseModule,
    UserModule,
  ],
  providers: [NotificationProcessor],
})
export class WorkerModule {}
