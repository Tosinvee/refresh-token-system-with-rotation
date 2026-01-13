import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { FcmToken } from 'src/firebase/schema/fcm-token.schema';
import { FirebaseService } from 'src/firebase/firebase.service';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(FcmToken.name) private readonly tokenModel: Model<FcmToken>,
    private firebaseService: FirebaseService,
  ) {}

  async hashedPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async create(body: CreateUserDto): Promise<User> {
    const user = new this.userModel({
      ...body,
      password: await this.hashedPassword(body.password),
    });
    return await user.save();
  }

  async getUser(query: Record<string, any>) {
    return this.userModel.findOne(query);
  }

  async registerDevice(userId: string, token: string) {
    const existing = await this.tokenModel.findOne({ token });

    await this.tokenModel.updateOne(
      { token },
      { userId, token, active: true },
      { upsert: true },
    );

    if (!existing || !existing.active) {
      await this.firebaseService.subscribeUserToTopic(userId, token);
    }
  }

  async getActiveToken(userId: string) {
    return this.tokenModel.find({ userId, active: true });
  }

  async deactivateToken(token: string) {
    await this.tokenModel.updateOne({ token }, { active: false });
  }
}
