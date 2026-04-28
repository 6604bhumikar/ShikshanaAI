
import axios from "axios";

export const sendLog = async (level: string, message: string, meta: any = {}, requestId?: string) => {
  try {
    await axios.post(`${process.env.LOGGING_SERVICE_URL}/internal/log`, {
      service: "api-gateway",
      level,
      message,
      meta,
      requestId
    });
  } catch (err) {
    console.error("Failed to send log", err);
  }
};
