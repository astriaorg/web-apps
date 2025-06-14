"use client";

import { useRouter } from "next/navigation";

import { Header, HeaderTitle } from "components/header";
import { SettingsPopover } from "components/settings-popover/settings-popover";
import { ROUTES } from "pool/constants/routes";

export const HeaderSection = () => {
  const router = useRouter();

  return (
    <Header onClickBack={() => router.push(ROUTES.POSITION_LIST)}>
      <div className="flex items-center justify-between w-full">
        <HeaderTitle>New Position</HeaderTitle>
        <SettingsPopover />
      </div>
    </Header>
  );
};
