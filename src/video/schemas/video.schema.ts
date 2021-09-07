import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VideoDocument = Video & Document;

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
}

export const VideoSchema = SchemaFactory.createForClass(Video);
