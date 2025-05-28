"use client";

import { useRouter } from "next/navigation";

import { Header, HeaderTitle } from "components/header";
import { SettingsPopover } from "components/settings-popover/settings-popover";

export const HeaderSection = () => {
  const router = useRouter();

  return (
    <Header onClickBack={() => router.back()}>
      <div className="flex items-center justify-between w-full">
        <HeaderTitle>Remove Liquidity</HeaderTitle>
        <SettingsPopover />
      </div>
    </Header>
  );
};
