import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { Model } from 'mongoose';
import {
  EmailVerification,
  EmailVerificationDocument,
} from './schema/emailVerification.schema';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { JWTService } from './jwt.service';
import { CreateUserDto, CreateUserPartialDto } from 'src/dto/create-user.dto';
import { JwtService as JwtServicePassport } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // private config: ConfigService;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
    private mailService: MailService,
    private userService: UserService,
    private jwtService: JWTService,
    private jwtServicePassport: JwtServicePassport,
  ) {
    // this.config = new ConfigService();
  }

  async createEmailToken(email: string): Promise<boolean> {
    const emailVerification = await this.emailVerificationModel.findOne({
      email: email,
    });
    if (
      emailVerification &&
      (new Date().getTime() - emailVerification.timestamp.getTime()) / 60000 <
        15
    ) {
      throw new HttpException(
        'LOGIN.EMAIL_SENT_RECENTLY',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      await this.emailVerificationModel.findOneAndUpdate(
        { email: email },
        {
          email: email,
          emailToken: (
            Math.floor(Math.random() * 9000000) + 1000000
          ).toString(), //Generate 7 digits number
          timestamp: new Date(),
        },
        { upsert: true },
      );
      return true;
    }
  }

  async checkPassword(email: string, password: string) {
    const userFromDb = await this.userModel.findOne({ email: email });
    if (!userFromDb)
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    return await bcrypt.compare(password, userFromDb.password);
  }

  async sendEmailVerification(email: string): Promise<boolean> {
    // const model = await this.emailVerificationModel.findOne({ email: email });
    // const user = await this.userModel.findOne({ email: email });
    const [model, user] = await Promise.all([
      this.emailVerificationModel.findOne({ email: email }),
      this.userModel.findOne({ email: email }),
    ]);

    if (model && model.emailToken) {
      return this.mailService.sendUserConfirmation({
        email: model.email,
        emailToken: model.emailToken,
        username: `${user.firstName} ${user.lastName}`,
      });
    } else {
      throw new HttpException(
        'REGISTER.USER_NOT_REGISTERED',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    const emailVerify = await this.emailVerificationModel.findOne({
      emailToken: token,
    });

    Logger.log({ emailVerify });

    if (!emailVerify || !emailVerify.email) {
      throw new HttpException(
        'LOGIN.EMAIL_CODE_NOT_VALID',
        HttpStatus.FORBIDDEN,
      );
    }
    const userFromDb = await this.userModel.findOne({
      email: emailVerify.email,
    });

    if (!userFromDb) {
      throw new HttpException('LOGIN.EMAIL_NOT_VALID', HttpStatus.FORBIDDEN);
    }

    userFromDb.isEmailVerified = true;
    const savedUser = await userFromDb.save();
    await emailVerify.deleteOne();
    return !!savedUser;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email: email });

    if (!user) {
      throw new NotFoundException(`LOGIN.USER_NOT_FOUND ${email}`);
    }
    if (!user.isEmailVerified) {
      throw new HttpException('LOGIN.EMIL_NOT_VERIFIED', HttpStatus.NOT_FOUND);
    }
    const isValidUser = await this.checkPassword(email, password);
    if (!isValidUser) {
      return null;
    } else {
      return user;
    }
  }

  async validateLogin(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new HttpException('LOGIN.ERROR', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = await this.jwtService.createToken(user.email);

    let isProfileCompleted = false;

    if (user.interest.length > 0) {
      isProfileCompleted = true;
    } else {
      isProfileCompleted = false;
    }

    const newUser = {
      username: user.username,
      campus: user.username,
      email: user.email,
      enrollmentYear: user.enrollmentYear,
      firstName: user.firstName,
      image: user?.image || { public_id: '', url: '' },
      lastName: user.lastName,
      isProfileCompleted,
    };
    return {
      token: accessToken,
      user: newUser,
    };
  }
}
