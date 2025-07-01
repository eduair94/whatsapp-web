import axios from "axios";

export default defineEventHandler(async (event) => {
  try {
    // Security: Only allow server-side requests (SSR) - block all client-side access
    const isServerSide = !event.node.req.headers["sec-fetch-site"] && !event.node.req.headers["sec-fetch-mode"] && !event.node.req.headers["sec-fetch-dest"];

    const hasSSRHeader = getHeader(event, "x-ssr-request") === "true";
    const userAgent = getHeader(event, "user-agent") || "";

    // Get telegram parameter from query, cookies, or default to true
    let telegram = getQuery(event).telegram;
    if (telegram === undefined || telegram === null) {
      // Try to get from cookies
      const includeTelegramCookie = getCookie(event, "includeTelegram");
      if (includeTelegramCookie !== undefined) {
        telegram = includeTelegramCookie === "true" ? "true" : "false";
      } else {
        // Default to true if no cookie is set
        telegram = "true";
      }
    }

    // Block if request appears to be from browser
    const isBrowserRequest = userAgent.includes("Mozilla") || userAgent.includes("Chrome") || userAgent.includes("Safari") || userAgent.includes("Edge") || event.node.req.headers["sec-fetch-site"];

    // if (isBrowserRequest && !hasSSRHeader) {
    //   throw createError({
    //     statusCode: 403,
    //     statusMessage: "Access denied: This endpoint is only available for server-side rendering",
    //   });
    // }

    const ip = event.node.req.headers["x-forwarded-for"]?.toString().split(",")[0] || event.node.req.socket.remoteAddress || "unknown";
    const number = getRouterParam(event, "number");
    const endpoint = `http://104.234.204.107:3728/number_cache/${number}?bypass992=true&ip=${encodeURIComponent(ip)}&telegram=${telegram}`;

    console.log("Get Cache Data", number, "telegram:", telegram);
    const data = await axios.get(endpoint).then((res) => res.data);
    return data;
  } catch (error: any) {
    console.error("Error in phone cache handler:", error);

    // If it's a security error, re-throw it
    if (error.statusCode === 403) {
      throw error;
    }

    return { error: "An unexpected error occurred" };
  }
});
