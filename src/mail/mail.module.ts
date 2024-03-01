import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmailVerification,
  EmailVerificationSchema,
} from 'src/auth/schema/emailVerification.schema';
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Set to true for SSL/TLS
        auth: {
          user: 'ghulamhussain.software@gmail.com',
          pass: 'hzgu jzka vhrc lgnj', // Use app-specific password if 2FA is enabled
        },
      },
      defaults: {
        from: 'ghulamhussain.software@gmail.com',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    MongooseModule.forFeature([
      { name: EmailVerification.name, schema: EmailVerificationSchema },
    ]),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
