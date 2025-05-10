"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

import { Button, Switch } from "@repo/ui/components";
import { PlusIcon } from "@repo/ui/icons";
import { Header, HeaderTitle } from "components/header";
import { ROUTES } from "pool/constants/routes";

export const HeaderSection = () => {
  const router = useRouter();
  const { isConnected } = useAccount();

  return (
    <Header>
      <div className="flex items-center justify-between w-full">
        <HeaderTitle>Pools</HeaderTitle>
        {isConnected && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-typography-secondary font-medium">
                Show Closed Positions
              </span>
              <Switch />
            </div>
            <Button onClick={() => router.push(ROUTES.CREATE_POSITION)}>
              <PlusIcon />
              New Position
            </Button>
          </div>
        )}
      </div>
    </Header>
  );
};
