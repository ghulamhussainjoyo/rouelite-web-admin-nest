import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schema/user.schema';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JWTService {
  config: ConfigService;
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    this.config = new ConfigService();
  }

  async createToken(email: any) {
    const expiresIn = 36000000;
    const secretOrKey =
      'THISAPPLICATIONISCREATEDBYGHULAMHUSSAINJOYO@11#$%^&*()';
    const userInfo = { email };
    const token = jwt.sign(userInfo, secretOrKey, { expiresIn });
    return {
      expires_in: expiresIn,
      access_token: token,
      creation_date: Date.now(),
    };
  }

  async validateUser(signedUser): Promise<User> {
    const userFromDb = await this.userModel.findOne({
      email: signedUser.email,
    });
    if (userFromDb) {
      return userFromDb;
    }
    return null;
  }
}
