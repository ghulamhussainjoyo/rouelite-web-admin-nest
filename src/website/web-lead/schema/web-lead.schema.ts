import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret, options) {
      delete ret['password'];
    },
  },
})
export class WebLead {
  @Prop({
    type: String,
    required: true,
  })
  fullName: string;

  @Prop({
    type: String,
    required: true,
  })
  phone: string;

  @Prop({
    type: String,
    required: true,
  })
  province: string;

  @Prop({
    type: String,
    required: true,
  })
  city: string;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;
}

export type WebLeadDocument = HydratedDocument<WebLead>;

export const WebLeadSchema = SchemaFactory.createForClass(WebLead);
