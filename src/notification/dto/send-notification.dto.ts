/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  userId: string;

  @IsString()
  fcmToken: string;
}
