import axios from "axios";

const captchaSecret = "6LcTNcMUAAAAADEpxYQ1v20gTFN4h4nHfC1kJqCs";

export default defineEventHandler(async (event) => {
  const phone = getRouterParam(event, "phone");
  if (!phone) {
    return { error: "No phone provided" };
  }
  const query = getQuery(event);
  const token = query.token;
  if (token) {
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${captchaSecret}&response=${token}`;
    const x = await axios.post(url).then((res) => res.data);
    if (x.success) {
      try {
        const endpoint = `http://104.234.204.107:3728/verification/status/${phone}?secret=k7X9pQ2zL8vR1aW4sT6bY0nD3eH5`;
        const data = await axios.get(endpoint).then((res) => res.data);
        return data;
      } catch (e: any) {
        return { error: "verification.failed", details: e?.message };
      }
    }
    return { error: "Invalid token" };
  }
  return { error: "No token" };
});
