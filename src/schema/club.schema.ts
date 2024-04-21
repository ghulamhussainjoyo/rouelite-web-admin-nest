import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type ClubDocument = HydratedDocument<Club>;

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret, options) {
      delete ret['password'];
    },
  },
})
export class Club {
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
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  interest: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({
    type: [
      {
        designation: { type: String },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference the User schema
      },
    ],
    default: [],
  })
  members?: { designation: string; user: mongoose.Schema.Types.ObjectId }[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  requests?: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] })
  events?: Event[];
}

export const ClubSchema = SchemaFactory.createForClass(Club);
