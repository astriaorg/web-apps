import { OnchainKitProvider as OnchainKit } from "@coinbase/onchainkit";
import { getEnvVariable } from "config";
import { ReactNode } from "react";
import { base } from "wagmi/chains";

// Environment variables
export const ONCHAINKIT_API_KEY = getEnvVariable(
  "NEXT_PUBLIC_ONCHAINKIT_API_KEY",
);
export const CDP_PROJECT_ID = getEnvVariable("NEXT_PUBLIC_CDP_PROJECT_ID");

// OnchainKit Provider
export function OnchainKitProvider({ children }: { children: ReactNode }) {
  return (
    <OnchainKit
      apiKey={ONCHAINKIT_API_KEY}
      projectId={CDP_PROJECT_ID}
      chain={base}
    >
      {children}
    </OnchainKit>
  );
}
