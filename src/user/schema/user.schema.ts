import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  refreshToken: string;

  @Prop({ default: false })
  emailVerified?: boolean;

  @Prop()
  resetPasswordExpiresAt?: Date;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  emailVerifiedAt?: Date;

  @Prop()
  accessCode?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
