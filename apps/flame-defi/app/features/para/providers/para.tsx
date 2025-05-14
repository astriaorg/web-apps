import { ParaEvmProvider } from "@getpara/evm-wallet-connectors";
import { getParaWallet } from "@getpara/rainbowkit-wallet";
import { Environment, ParaProvider, ParaWeb } from "@getpara/react-sdk";
import { getEnvVariable } from "config";
import { ReactNode } from "react";

import { chains } from "features/evm-wallet/providers/wagmi";
import { WALLET_CONNECT_PROJECT_ID } from "features/evm-wallet/providers/wallet-connect";

// Environment variables
const API_KEY = getEnvVariable("NEXT_PUBLIC_PARA_API_KEY");
const ENV = Environment.BETA;

// Para client instance
export const para = new ParaWeb(ENV, API_KEY);

// Para wallet for rainbowkit
export const paraWallet = getParaWallet({
  appName: "Flame Defi",
  para: {
    apiKey: API_KEY,
    environment: ENV,
  },
});

// Para Provider component
export function ParaClientProvider({ children }: { children: ReactNode }) {
  return <ParaProvider paraClientConfig={{
    env: ENV,
    apiKey: API_KEY
  }}>
    <ParaEvmProvider config={{
      projectId: WALLET_CONNECT_PROJECT_ID,
      appName: "Flame Defi",
      chains,
      para,
    }}>
    {children}
    </ParaEvmProvider>
  </ParaProvider>;
}
