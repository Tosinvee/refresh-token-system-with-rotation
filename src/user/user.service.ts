import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
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
}
