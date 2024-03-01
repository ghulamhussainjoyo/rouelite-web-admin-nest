import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OtpModule } from 'src/otp/otp.module';
import { AuthModule } from 'src/auth/auth.module';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, { dbName: 'thunder' }),
    MulterModule.register({ dest: './uploads' }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),

    AuthModule,
    OtpModule,
    UserModule,
    EventModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
