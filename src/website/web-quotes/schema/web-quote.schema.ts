import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret, options) {},
  },
})
export class WebQuote {
  @Prop({
    type: String,
    required: true,
    // unique: true,
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
  city: string;

  @Prop({
    type: String,
    required: true,
  })
  province: string;

  @Prop({
    type: String,
    required: true,
  })
  address: string;

  @Prop({
    type: String,
    required: true,
  })
  kiloWatt: number;

  @Prop({
    type: String,
    required: true,
  })
  link: string;
}

export type WebQuoteDocument = HydratedDocument<WebQuote>;

export const WebQuoteSchema = SchemaFactory.createForClass(WebQuote);
