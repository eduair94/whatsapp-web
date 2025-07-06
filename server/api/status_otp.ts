import axios from "axios";

export default defineEventHandler(async (event) => {
  try {
    // Replace with your actual OTP API status endpoint
    const endpoint = "http://104.234.204.107:3728/status_otp";
    const response = await axios.get(endpoint).then((res) => res.data);
    return response;
  } catch (error) {
    console.error("OTP API status error:", error);
    return {
      status: false,
      isBroken: true,
      lastCheck: new Date().toISOString(),
      successCount: 0,
      errorCount: 1,
      websiteRequests: 0,
      apiRequests: 0,
      error: "Failed to fetch OTP API status",
    };
  }
});
