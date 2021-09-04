import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VideoDocument = Video & Document;

@Schema()
export class Video {
  @Prop({ required: true, unique: true })
  public name: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
