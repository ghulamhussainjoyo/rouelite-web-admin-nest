import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EmailVerificationDocument = HydratedDocument<EmailVerification>;
@Schema()
export class EmailVerification {
  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  emailToken: string;

  @Prop({ type: Date, required: true })
  timestamp: Date;
}

export const EmailVerificationSchema =
  SchemaFactory.createForClass(EmailVerification);
