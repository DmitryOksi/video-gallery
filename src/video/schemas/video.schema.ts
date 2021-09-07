import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type VideoDocument = Video & mongoose.Document;

@Schema()
export class Video {
  @Prop({ required: true })
  public originalname: string;

  @Prop({ required: true })
  public destination: string;

  @Prop({ required: true, unique: true })
  public filename: string;

  @Prop({ required: true })
  public size: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  public ownerId: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
