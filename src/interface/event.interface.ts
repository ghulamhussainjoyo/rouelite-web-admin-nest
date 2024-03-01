import { Document } from 'mongoose';
import { IUser } from './user.interface';
import { subscription, visibility } from 'src/types/event.enum';

export interface IEvent extends Document {
  readonly thumbnail: string;
  readonly title: string;
  readonly description: string;
  readonly eventDate: Date;
  readonly eventTime: string;
  readonly location: string;
  readonly club: string;
  readonly subscription: subscription;
  readonly host: IUser['_id'];
  readonly visibility: visibility;
  readonly attendance: IUser['_id'][];
}

// export const EventSchema = SchemaFactory.createForClass<IEvent>(Event);
