import { getParaWallet } from "@getpara/rainbowkit-wallet";
import { Environment as ParaEnvironment, ParaWeb } from "@getpara/react-sdk";

import { Environment, getEnvVariable } from "config";

export const PARA_API_KEY = getEnvVariable("NEXT_PUBLIC_PARA_API_KEY");
export const PARA_ENV = (() => {
  if (getEnvVariable("NEXT_PUBLIC_ENV") === Environment.MAIN) {
    return ParaEnvironment.PRODUCTION;
  }
  return ParaEnvironment.DEV;
})();

// Para instance
export const para = new ParaWeb(PARA_ENV, PARA_API_KEY);

// Para wallet for rainbowkit
export const paraWallet = getParaWallet({
  appName: "Flame Defi",
  para: {
    environment: PARA_ENV,
    apiKey: PARA_API_KEY,
  },
});
