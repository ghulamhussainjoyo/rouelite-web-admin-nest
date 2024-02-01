import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type helpDocument = HydratedDocument<Help>;
@Schema()
export class Help {
  @Prop({ required: true })
  issue: string;

  @Prop({ required: true })
  message: string;
}

export const helpSchema = SchemaFactory.createForClass(Help);
