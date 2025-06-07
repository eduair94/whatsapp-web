import axios from "axios";

export default defineEventHandler(async (event) => {
  try {
    const endpoint = `http://104.234.204.107:3728/phone-numbers/stats`;
    const data = await axios.get(endpoint).then((res) => res.data);
    return data;
  } catch (error: any) {
    console.error("Stats API request failed:", error);
    return { error: error.response?.data?.message || "Stats request failed" };
  }
});
