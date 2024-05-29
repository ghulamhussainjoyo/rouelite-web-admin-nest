import { Module } from '@nestjs/common';
import { WebLeadController } from './web-lead.controller';
import { WebLeadService } from './web-lead.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WebLead, WebLeadSchema } from './schema/web-lead.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([{ name: WebLead.name, schema: WebLeadSchema }]),
  ],
  controllers: [WebLeadController],
  providers: [WebLeadService],
})
export class WebLeadModule {}
