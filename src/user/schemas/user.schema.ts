import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({unique: true, required: true})
  public email: string;
  
  @Prop({default: null})
  public hashedRefreshToken?: string & null;
}

export const UserSchema = SchemaFactory.createForClass(User);
