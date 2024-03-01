import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user.schema';
import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';
import { MailModule } from 'src/mail/mail.module';
import {
  EmailVerification,
  EmailVerificationSchema,
} from './schema/emailVerification.schema';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWTService } from './jwt.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule,

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EmailVerification.name, schema: EmailVerificationSchema },
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: 36000000 },
        };
      },
    }),
    PassportModule,
    MailModule,
    CloudinaryModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    MailService,
    JWTService,
    JwtStrategy,
    LocalStrategy,
    JwtStrategy,
    ConfigService,
  ],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}
