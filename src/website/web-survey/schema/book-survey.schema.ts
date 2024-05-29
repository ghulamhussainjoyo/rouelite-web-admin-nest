import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret, options) {},
  },
})
export class BookSurvey {
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
  address: string;

  @Prop({
    type: Date,
    required: true,
    default: Date.now(),
  })
  date: string;

  @Prop({
    type: String,
    required: true,
  })
  time: string;
}

export type BookSurveyDocument = HydratedDocument<BookSurvey>;

export const BookSurveySchema = SchemaFactory.createForClass(BookSurvey);
