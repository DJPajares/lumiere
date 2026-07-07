import { envIssuesToMessage, loadApiEnv } from "@lumiere/config";

export function loadApiConfig() {
  try {
    return loadApiEnv();
  } catch (error) {
    throw new Error(`Invalid API environment: ${envIssuesToMessage(error)}`);
  }
}

if (process.env.NODE_ENV !== "test") {
  loadApiConfig();
}
