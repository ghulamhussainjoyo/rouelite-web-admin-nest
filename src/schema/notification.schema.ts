import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;
@Schema()
export class Notification {
  @Prop({ required: true })
  issue: string;

  @Prop({ required: true })
  message: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
