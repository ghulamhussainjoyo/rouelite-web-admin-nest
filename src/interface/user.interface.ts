import { Document } from 'mongoose';

interface IFriend {
  readonly date: Date;
  readonly friend: IUser['_id'];
}

interface IRequest {
  readonly date: Date;
  readonly friend: IUser['_id'];
}

interface IBlocked {
  readonly date: Date;
  readonly friend: IUser['_id'];
}

interface ISocial {
  readonly name: string;
  readonly link: string;
  readonly connected: boolean;
}

interface IImage {
  public_id: string;
  url: string;
}
export interface IUser extends Document {
  readonly _id: string;
  readonly username?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  readonly campus: string;
  readonly enrollmentYear: string;
  readonly interest: string[];
  readonly friends: IFriend[];
  readonly requests: IRequest[];
  readonly blocked: IBlocked[];
  readonly image?: IImage;
  readonly hosted: IUser['_id'][];
  readonly attended: IUser['_id'][];
  readonly socials: ISocial[];
  readonly accountVisibility: 'public' | 'friends';
  readonly notification: IUser['_id'][];
}

// export const UserSchema = SchemaFactory.createForClass<IUser>(User);
