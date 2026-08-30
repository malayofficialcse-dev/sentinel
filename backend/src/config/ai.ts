import { env } from "./env";

export const AI_CONFIG = {
  baseURL: env.AI_SERVICE_URL,
  timeout: 120000
};