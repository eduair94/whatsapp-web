import { Document, Schema } from "mongoose";

export interface IIpRequest extends Document {
  ip: string;
  count: number;
  lastRequest: Date;
  windowStart: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IpRequestSchema = new Schema<IIpRequest>(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      required: true,
      default: 1,
    },
    lastRequest: {
      type: Date,
      required: true,
      default: Date.now,
    },
    windowStart: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create TTL index to automatically remove old documents after 2 hours
IpRequestSchema.index({ lastRequest: 1 }, { expireAfterSeconds: 7200 });

export { IpRequestSchema };
