import { Module } from '@nestjs/common';
import { BookedSurveyController } from './book-survey.controller';
import { BookSurveyService } from './book-survey.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { BookSurvey, BookSurveySchema } from './schema/book-survey.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: BookSurvey.name, schema: BookSurveySchema },
    ]),
  ],
  controllers: [BookedSurveyController],
  providers: [BookSurveyService],
})
export class BookSurveyModule {}
