import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserType = User & { _id: string };
export type UserDocument = UserType & mongoose.Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  public email: string;

  @Prop({ required: true })
  public hashedPassword: string;

  @Prop({ default: null })
  public refreshToken: string | null;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }])
  public sharedVideoIds: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
