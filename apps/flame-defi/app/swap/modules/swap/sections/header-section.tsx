"use client";

import { Header, HeaderTitle } from "components/header";
import { SettingsPopover } from "components/settings-popover";

export const HeaderSection = () => {
  return (
    <Header>
      <div className="flex items-center justify-between w-full">
        <HeaderTitle>Swap</HeaderTitle>
        <SettingsPopover />
      </div>
    </Header>
  );
};
