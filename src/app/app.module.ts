import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { BookSurveyModule } from 'src/website/web-survey/survey.module';
import { WebLeadModule } from 'src/website/web-lead/web-lead.module';
import { WebQuoteModule } from 'src/website/web-quotes/web-quotes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URL'),
        dbName: 'rouelite-website',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    // MongooseModule.forRoot(process.env.MONGO_URL, { dbName: 'thunder' }),
    MulterModule.register({ dest: './uploads' }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),

    WebLeadModule,
    BookSurveyModule,
    WebQuoteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
