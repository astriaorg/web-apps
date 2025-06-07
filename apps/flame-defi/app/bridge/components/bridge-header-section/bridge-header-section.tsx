"use client";

import { useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components";
import { ROUTES } from "bridge/constants/routes";
import { Header, HeaderTitle } from "components/header";

export type BridgeHeaderSectionProps = {
  activeTab: "deposit" | "withdraw";
};

/**
 * The header section for the bridge pages.
 */
export const BridgeHeaderSection = ({
  activeTab,
}: BridgeHeaderSectionProps) => {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    if (value === "deposit") {
      router.push(ROUTES.DEPOSIT);
    } else if (value === "withdraw") {
      router.push(ROUTES.WITHDRAW);
    }
  };

  return (
    <Header>
      <div className="flex items-center justify-between w-full">
        <HeaderTitle>Bridge</HeaderTitle>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          variant="outline"
        >
          <TabsList>
            <TabsTrigger variant="outline" value="deposit" className="w-24">
              Deposit
            </TabsTrigger>
            <TabsTrigger variant="outline" value="withdraw" className="w-24">
              Withdraw
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </Header>
  );
};
