import axios from "axios";

export default defineEventHandler(async (event) => {
  const endpoint = 'http://104.234.204.107:3728/status';
  const data = await axios.get(endpoint).then((res) => res.data);
	return data;
})
