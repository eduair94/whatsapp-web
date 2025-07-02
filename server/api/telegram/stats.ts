import axios from "axios";

export default defineEventHandler(async (event) => {
  try {
    const endpoint = `http://104.234.204.107:3728/telegram-numbers/stats`;
    const data = await axios.get(endpoint).then((res) => res.data);
    return data;
  } catch (error: any) {
    console.error("Telegram stats API request failed:", error);
    return { error: error.response?.data?.message || "Telegram stats request failed" };
  }
});
