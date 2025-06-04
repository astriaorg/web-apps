import { OnchainKitProvider as OnchainKit } from "@coinbase/onchainkit";
import { ReactNode } from "react";
import { base } from "wagmi/chains";

import { getEnvVariable } from "config";

export const ONCHAIN_KIT_API_KEY = getEnvVariable(
  "NEXT_PUBLIC_ONCHAIN_KIT_API_KEY",
);
export const CDP_PROJECT_ID = getEnvVariable("NEXT_PUBLIC_CDP_PROJECT_ID");

/**
 * Provider for OnchainKit functionality.
 */
export function OnchainKitProvider({ children }: { children: ReactNode }) {
  return (
    <OnchainKit
      apiKey={ONCHAIN_KIT_API_KEY}
      projectId={CDP_PROJECT_ID}
      chain={base}
    >
      {children}
    </OnchainKit>
  );
}
