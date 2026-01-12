import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class FcmToken extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, token: true })
  token: string;

  @Prop({ default: true })
  active: boolean;
}
export const FcmTokenSchema = SchemaFactory.createForClass(FcmToken);
