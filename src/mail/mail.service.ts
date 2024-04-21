import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailVerification,
  EmailVerificationDocument,
} from 'src/auth/schema/emailVerification.schema';

type confirmationEmailProps = {
  email: string;
  username: string;
  emailToken: string;
};

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
  ) {}

  async sendUserConfirmation(props: confirmationEmailProps) {
    const { email, username, emailToken } = props;
    try {
      if (email && username) {
        const host = 'localhost'; // Update with your production URL
        const port = 3000;
        // const url = `http://${host}:${port}/auth/email/verify/${emailToken}`;
        const url = `https://thunder-backend-production.up.railway.app/auth/email/verify/${emailToken}`;

        return await this.mailerService.sendMail({
          to: email,
          from: '"Support Team Thunder" <ghulamhussain.software@gmail.com>',
          subject: 'Welcome to Thunder App! Confirm your Email',
          template: './confirmation', // Assuming you have confirmation.hbs template
          context: {
            name: username,
            url,
          },
        });
      } else {
        throw new HttpException(
          'REGISTER.USER_NOT_REGISTERED',
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      Logger.error(
        `Error sending confirmation email: ${error.message}`,
        error.stack,
        'MailService',
      );
      throw new HttpException(
        'Failed to send confirmation email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
