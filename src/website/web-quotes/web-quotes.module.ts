import { Module } from '@nestjs/common';
import { WebQuotationsController } from './web-quotes.controller';
import { WebQuotationsService } from './web-quotes.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { WebQuote, WebQuoteSchema } from './schema/web-quote.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: WebQuote.name, schema: WebQuoteSchema },
    ]),
  ],
  controllers: [WebQuotationsController],
  providers: [WebQuotationsService],
})
export class WebQuoteModule {}
