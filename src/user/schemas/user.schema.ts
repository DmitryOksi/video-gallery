import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & mongoose.Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  public email: string;

  @Prop({ required: true })
  public hashedPassword: string;

  @Prop({ required: true })
  public refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
