export type InvitePublicEnv = {
  apiBaseUrl: string;
  appName: string;
};

export function readInvitePublicEnv(): InvitePublicEnv {
  return {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:4000",
    appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Lumiere",
  };
}
