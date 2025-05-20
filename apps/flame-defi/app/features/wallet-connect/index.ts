import { getEnvVariable } from "config";

export const WALLET_CONNECT_PROJECT_ID = getEnvVariable(
  "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID",
);
