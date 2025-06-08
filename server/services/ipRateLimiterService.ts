import mongoose from "mongoose";
import { IIpRequest, IpRequestSchema } from "../models/IpRequest";
import { connectToMongoDB } from "../utils/mongodb";

let ipModels: any = {};

export class IpRateLimiterService {
  /**
   * Check if IP is within rate limit and update request count
   * @param ip - The IP address to check
   * @returns Promise<boolean> - true if within limit, false if exceeded
   */

  public RATE_LIMIT = 20;
  public WINDOW = 60 * 60 * 1000;
  public IpRequest: mongoose.Model<IIpRequest>;

  constructor(isAuth: boolean, collection: string = "ip_requests") {
    this.RATE_LIMIT = isAuth ? 25 : 5;
    if (ipModels[collection]) {
      this.IpRequest = ipModels[collection];
      return;
    }
    this.IpRequest = mongoose.model<IIpRequest>(collection, IpRequestSchema);
    ipModels[collection] = this.IpRequest;
  }

  async checkRateLimit(ip: string): Promise<boolean> {
    try {
      await connectToMongoDB();

      const now = new Date();
      const windowStart = new Date(now.getTime() - this.WINDOW);

      // Find existing record for this IP (read-only check)
      const ipRecord = await this.IpRequest.findOne({ ip });

      if (!ipRecord) {
        // First request from this IP - allow it
        return true;
      }

      // Check if we're in a new window
      if (ipRecord.windowStart < windowStart) {
        // New window - allow the request
        return true;
      }

      // Check if current count exceeds rate limit
      if (ipRecord.count >= this.RATE_LIMIT) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking rate limit:", error);
      // In case of DB error, allow the request to prevent blocking legitimate users
      return true;
    }
  }

  /**
   * Get current request count for an IP
   * @param ip - The IP address
   * @returns Promise<number> - Current request count
   */
  async getRequestCount(ip: string): Promise<{ count: number; max: number; restartsIn: number }> {
    let resp = { count: 0, max: this.RATE_LIMIT, restartsIn: 0 };
    try {
      await connectToMongoDB();

      const ipRecord = await this.IpRequest.findOne({ ip });

      if (!ipRecord) {
        return resp;
      }

      const now = new Date();
      const windowStart = new Date(now.getTime() - this.WINDOW);

      // If record is outside current window, return 0
      if (ipRecord.windowStart < windowStart) {
        return resp;
      }

      const restartsIn = Math.max(0, Math.ceil((ipRecord.windowStart.getTime() + this.WINDOW - now.getTime()) / 1000));

      return { count: ipRecord.count, max: this.RATE_LIMIT, restartsIn };
    } catch (error) {
      console.error("Error getting request count:", error);
      return resp;
    }
  }

  /**
   * Increment rate limit count for an IP on successful request
   * This should be called only after a request has been processed successfully
   * @param ip - The IP address to increment count for
   * @returns Promise<boolean> - true if increment was successful, false otherwise
   */
  async incrementSuccessfulRequest(ip: string): Promise<boolean> {
    try {
      await connectToMongoDB();

      const now = new Date();
      const windowStart = new Date(now.getTime() - this.WINDOW);

      // Use atomic findOneAndUpdate with upsert to handle race conditions
      const result = await this.IpRequest.findOneAndUpdate(
        { ip },
        [
          {
            $set: {
              // If record doesn't exist or is outside current window, reset
              count: {
                $cond: {
                  if: {
                    $or: [
                      { $not: ["$windowStart"] }, // Record doesn't exist
                      { $lt: ["$windowStart", windowStart] }, // Outside current window
                    ],
                  },
                  then: 1,
                  else: { $add: ["$count", 1] }, // Increment existing count
                },
              },
              windowStart: {
                $cond: {
                  if: {
                    $or: [
                      { $not: ["$windowStart"] }, // Record doesn't exist
                      { $lt: ["$windowStart", windowStart] }, // Outside current window
                    ],
                  },
                  then: now,
                  else: "$windowStart", // Keep existing windowStart
                },
              },
              lastRequest: now,
              ip: ip, // Ensure IP is set for new records
            },
          },
        ],
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      return true;
    } catch (error) {
      console.error("Error incrementing successful request count:", error);
      return false;
    }
  }

  /**
   * Check if IP can make a request without incrementing the count
   * Use this before processing a request, then call incrementSuccessfulRequest() only if the request succeeds
   * @param ip - The IP address to check
   * @returns Promise<boolean> - true if within limit, false if exceeded
   */
  async canMakeRequest(ip: string): Promise<boolean> {
    try {
      await connectToMongoDB();

      const now = new Date();
      const windowStart = new Date(now.getTime() - this.WINDOW);

      // Try to find existing record for this IP
      const ipRecord = await this.IpRequest.findOne({ ip });

      if (!ipRecord) {
        // First request from this IP - allow it
        return true;
      }

      // Check if we're in a new window
      if (ipRecord.windowStart < windowStart) {
        // New window - allow the request
        return true;
      }

      // We're in the same window, check if adding one more would exceed the limit
      if (ipRecord.count >= this.RATE_LIMIT) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking if request can be made:", error);
      // In case of DB error, allow the request to prevent blocking legitimate users
      return true;
    }
  }

  /**
   * Clean up old IP records (optional, as TTL index handles this automatically)
   */
  async cleanupOldRecords(): Promise<void> {
    try {
      await connectToMongoDB();

      const cutoff = new Date(Date.now() - 2 * this.WINDOW); // Clean records older than 2 hours

      const result = await this.IpRequest.deleteMany({
        lastRequest: { $lt: cutoff },
      });
    } catch (error) {
      console.error("Error cleaning up old records:", error);
    }
  }
}
