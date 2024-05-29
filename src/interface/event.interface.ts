import { Document } from 'mongoose';
import { IUser } from './user.interface';

export interface IEvent extends Document {
  readonly thumbnail: string;
  readonly title: string;
  readonly description: string;
  readonly eventDate: Date;
  readonly eventTime: string;
  readonly location: string;
  readonly club: string;
  readonly host: IUser['_id'];
  readonly attendance: IUser['_id'][];
}

// export const EventSchema = SchemaFactory.createForClass<IEvent>(Event);
