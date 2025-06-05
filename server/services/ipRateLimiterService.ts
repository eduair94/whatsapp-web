import { IpRequest } from "../models/IpRequest";
import { connectToMongoDB } from "../utils/mongodb";

const WINDOW = 60 * 60 * 1000; // 1 hour window

export class IpRateLimiterService {
  /**
   * Check if IP is within rate limit and update request count
   * @param ip - The IP address to check
   * @returns Promise<boolean> - true if within limit, false if exceeded
   */

  public RATE_LIMIT = 20;

  constructor(isAuth: boolean) {
    this.RATE_LIMIT = isAuth ? 25 : 5;
  }

  async checkRateLimit(ip: string): Promise<boolean> {
    try {
      await connectToMongoDB();

      const now = new Date();
      const windowStart = new Date(now.getTime() - WINDOW);

      // Try to find existing record for this IP
      let ipRecord = await IpRequest.findOne({ ip });

      if (!ipRecord) {
        // First request from this IP
        ipRecord = new IpRequest({
          ip,
          count: 1,
          lastRequest: now,
          windowStart: now,
        });
        await ipRecord.save();
        return true;
      }

      // Check if we're in a new window
      if (ipRecord.windowStart < windowStart) {
        // Reset the window
        ipRecord.count = 1;
        ipRecord.windowStart = now;
        ipRecord.lastRequest = now;
        await ipRecord.save();
        return true;
      }

      // Check if exceeds rate limit
      if (ipRecord.count > this.RATE_LIMIT) {
        await ipRecord.save();
        return false;
      }

      await ipRecord.save();
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

      const ipRecord = await IpRequest.findOne({ ip });

      if (!ipRecord) {
        return resp;
      }

      const now = new Date();
      const windowStart = new Date(now.getTime() - WINDOW);

      // If record is outside current window, return 0
      if (ipRecord.windowStart < windowStart) {
        return resp;
      }

      const restartsIn = Math.max(0, Math.ceil((ipRecord.windowStart.getTime() + WINDOW - now.getTime()) / 1000));

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
      const windowStart = new Date(now.getTime() - WINDOW);

      // Find existing record for this IP
      let ipRecord = await IpRequest.findOne({ ip });

      if (!ipRecord) {
        // First successful request from this IP
        ipRecord = new IpRequest({
          ip,
          count: 1,
          lastRequest: now,
          windowStart: now,
        });
        await ipRecord.save();
        return true;
      }

      // Check if we're in a new window
      if (ipRecord.windowStart < windowStart) {
        // Reset the window for new successful request
        ipRecord.count = 1;
        ipRecord.windowStart = now;
        ipRecord.lastRequest = now;
        await ipRecord.save();
        return true;
      }

      // We're in the same window, increment count for successful request
      ipRecord.count += 1;
      ipRecord.lastRequest = now;
      await ipRecord.save();

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
      const windowStart = new Date(now.getTime() - WINDOW);

      // Try to find existing record for this IP
      const ipRecord = await IpRequest.findOne({ ip });

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

      const cutoff = new Date(Date.now() - 2 * WINDOW); // Clean records older than 2 hours

      const result = await IpRequest.deleteMany({
        lastRequest: { $lt: cutoff },
      });
    } catch (error) {
      console.error("Error cleaning up old records:", error);
    }
  }
}
