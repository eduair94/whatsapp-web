import axios from "axios";

export default defineEventHandler(async (event) => {
  try {
    const ip = event.node.req.headers["x-forwarded-for"]?.toString().split(",")[0] || event.node.req.socket.remoteAddress || "unknown";
    const number = getRouterParam(event, "number");
    const endpoint = `http://104.234.204.107:3728/number_cache/${number}?bypass992=true&ip=${encodeURIComponent(ip)}`;
    const data = await axios.get(endpoint).then((res) => res.data);
    return data;
  } catch (error) {
    console.error("Error in phone lookup handler:", error);
    return { error: "An unexpected error occurred" };
  }
});
