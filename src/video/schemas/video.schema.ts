import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VideoDocument = Video & mongoose.Document;

@Schema()
export class Video {
  @ApiProperty({ type: String, description: 'id' })
  public id?: string;

  @Prop({ required: true })
  @ApiProperty({ type: String, description: 'originalname' })
  public originalname: string;

  @Prop({ required: true })
  @ApiProperty({ type: String, description: 'destination' })
  public destination: string;

  @Prop({ required: true, unique: true })
  @ApiProperty({ type: String, description: 'filename' })
  public filename: string;

  @Prop({ required: true })
  @ApiProperty({ type: Number, description: 'sizeBytes' })
  public sizeBytes: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @ApiProperty({ type: String, description: 'ownerId' })
  public ownerId: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
