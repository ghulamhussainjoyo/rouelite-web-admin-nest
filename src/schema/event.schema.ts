import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { subscription, visibility } from 'src/types/event.enum';
import { User } from './user.schema';

export type EventDocument = HydratedDocument<Event>;
@Schema()
export class Event {
  @Prop({ required: true })
  thumbnail: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Date, required: true })
  eventDate: Date;

  @Prop({ type: String, required: true })
  eventTime: string;

  @Prop({ type: String, required: true })
  location: string;

  @Prop({ type: String, required: true })
  club: string;

  @Prop({
    type: String,
    required: true,
    enum: [subscription.free, subscription.paid],
  })
  subscription: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  host: User;

  @Prop({
    type: String,
    required: true,
    enum: [visibility.public, visibility.private],
  })
  visibility: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  attendance: User[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
