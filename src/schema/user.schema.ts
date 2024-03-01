import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { IsEmail } from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';
import { Event } from './event.schema';
import { visibility } from 'src/types/user.enum';
import { Notification } from './notification.schema';

export type UserDocument = HydratedDocument<User>;
@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret, options) {
      delete ret['password'];
    },
  },
})
export class User {
  @Prop({
    type: String,
    unique: true,
  })
  username: string;

  @Prop({
    type: String,
    required: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
  })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  //   @Prop({
  //     required: true,
  //     unique: true,
  //   })
  //   @IsPhoneNumber()
  //   phone: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true })
  campus: string;

  @Prop({ type: String, required: true })
  enrollmentYear: string;

  @Prop({
    type: [String], // Corrected type definition for array of strings
    required: true,
    default: [],
  })
  interest: string[];

  @Prop({
    type: [
      raw({
        date: { type: Date },
        friend: {
          type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        },
      }),
    ],
    default: [],
  })
  friends: { date: Date; friend: mongoose.Schema.Types.ObjectId }[];

  @Prop({
    type: [
      raw({
        date: { type: Date },
        friend: {
          type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        },
      }),
    ],
    default: [],
  })
  requests: { date: Date; friend: User }[];

  @Prop({
    type: [
      raw({
        date: { type: Date },
        friend: {
          type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        },
      }),
    ],
    default: [],
  })
  blocked: { date: Date; friend: mongoose.Schema.Types.ObjectId }[];

  @Prop({
    type: raw({
      public_id: { type: String },
      url: { type: String },
    }),
  })
  image: { public_id: string; url: string };

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] })
  hosted: Event[];
  // @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] })
  // attended: Event[];
  @Prop({
    type: raw({
      instagram: {
        link: { type: String, default: null },
        connected: { type: Boolean, default: false },
      },
      facebook: {
        link: { type: String, default: null },
        connected: { type: Boolean, default: false },
      },
      tikTok: {
        link: { type: String, default: null },
        connected: { type: Boolean, default: false },
      },
      snapchat: {
        link: { type: String, default: null },
        connected: { type: Boolean, default: false },
      },
    }),
  })
  socials: {
    instagram: { link: string; connected: boolean };
    facebook: { link: string; connected: boolean };
    tikTok: { link: string; connected: boolean };
    snapchat: { link: string; connected: boolean };
  };

  @Prop({
    type: String,
    enum: [visibility.public, visibility.friends],
    default: visibility.public,
  })
  accountVisibility: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
  })
  notification: Notification[];

  @Prop({
    type: Date,
  })
  timestamp: Date;

  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;

  @Prop({ type: Boolean, default: false })
  isProfileCompleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
