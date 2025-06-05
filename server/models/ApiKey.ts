import mongoose, { Document, Schema } from "mongoose";

export interface IApiKey extends Document {
  userId: string;
  encryptedApiKey: string;
  iv: string;
  authTag: string;
  apiKeyHash: string;
  lastSaved: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    platform?: string;
  };
  rateLimitInfo?: {
    requestLimit?: number;
    requestRemaining?: number;
    requestReset?: number;
    quotaRequests?: number;
    quotaRequestsRemaining?: number;
    lastUpdated?: Date;
  };
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      maxlength: 128,
    },
    encryptedApiKey: {
      type: String,
      required: true,
      trim: true,
    },
    iv: {
      type: String,
      required: true,
      trim: true,
    },
    authTag: {
      type: String,
      required: true,
      trim: true,
    },
    apiKeyHash: {
      type: String,
      required: true,
      trim: true,
    },
    lastSaved: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    metadata: {
      userAgent: {
        type: String,
        maxlength: 500,
      },
      ipAddress: {
        type: String,
        maxlength: 45, // IPv6 max length
      },
      platform: {
        type: String,
        maxlength: 100,
      },
    },
    rateLimitInfo: {
      requestLimit: {
        type: Number,
        min: 0,
      },
      requestRemaining: {
        type: Number,
        min: 0,
      },
      requestReset: {
        type: Number,
        min: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: "api_keys",
  }
);

// Indexes for better query performance
ApiKeySchema.index({ userId: 1, isActive: 1 });
ApiKeySchema.index({ lastSaved: -1 });
ApiKeySchema.index({ createdAt: -1 });

// Pre-save middleware to update lastSaved
ApiKeySchema.pre("save", function (next) {
  if (this.isModified("encryptedApiKey") || this.isModified("apiKeyHash")) {
    this.lastSaved = new Date();
  }
  next();
});

// Instance methods
ApiKeySchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.encryptedApiKey;
  delete obj.iv;
  delete obj.authTag;
  delete obj.apiKeyHash;
  return obj;
};

// Static methods
ApiKeySchema.statics.findByUserId = function (userId: string) {
  return this.findOne({ userId, isActive: true });
};

ApiKeySchema.statics.deactivateByUserId = function (userId: string) {
  return this.updateOne({ userId }, { isActive: false, lastSaved: new Date() });
};

ApiKeySchema.statics.getActiveCount = function () {
  return this.countDocuments({ isActive: true });
};

ApiKeySchema.statics.cleanupInactive = function (daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    isActive: false,
    updatedAt: { $lt: cutoffDate },
  });
};

// Ensure model is not re-compiled in development
export const ApiKey = mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema);

export default ApiKey;
