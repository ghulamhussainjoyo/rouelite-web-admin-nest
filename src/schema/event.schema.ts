import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { subscription, visibility } from 'src/types/event.enum';
import { User } from './user.schema';
import { Club } from './club.schema';

export type EventDocument = HydratedDocument<Event>;

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret, options) {
      delete ret['password'];
    },
  },
})
export class Event {
  @Prop([
    {
      public_id: { type: String },
      url: { type: String },
    },
  ])
  thumbnail: {
    public_id: string;
    url: string;
  };

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  interest: string;

  @Prop({ type: Date, required: true })
  eventDate: Date;

  @Prop({ type: String, required: true })
  startTime: string;

  @Prop({ type: String, required: true })
  endTime: string;

  @Prop({ type: String, required: true })
  location: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Club' })
  clubId: Club;

  @Prop({ type: String })
  clubName: string;

  @Prop({ type: String })
  password?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  host: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  attendance?: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  requests?: User[];

  @Prop({
    type: [
      {
        date: {
          type: Date,
        },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  })
  checkedIn?: { date: Date; user: mongoose.Schema.Types.ObjectId }[];

  //optional
  @Prop({
    type: String,
    required: true,
    enum: [subscription[subscription.free], subscription[subscription.paid]],
    default: subscription[subscription.free],
  })
  subscription?: string;

  @Prop({
    type: String,
    required: true,
    enum: [visibility[visibility.public], visibility[visibility.private]],
    default: visibility[visibility.public],
  })
  visibility: string;

  @Prop({
    type: [
      {
        rating: { type: Number },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference the User schema
      },
    ],
    default: [],
  })
  rating?: { rating: string; user: mongoose.Schema.Types.ObjectId }[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
