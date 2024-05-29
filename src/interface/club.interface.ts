import { Document } from 'mongoose';
import { IUser } from './user.interface';
import { IEvent } from './event.interface';

export interface IThumbnail {
  public_id: string;
  url: string;
}

export interface IMember {
  designation: string;
  user: IUser['_id'];
}

export interface IClub extends Document {
  readonly thumbnail: string;
  readonly name: string;
  readonly description: string;
  readonly owner: IUser['_id'];
  readonly members?: IMember[];
  readonly attendance?: IUser['_id'][];
  readonly events?: IEvent['_id'][];
}
