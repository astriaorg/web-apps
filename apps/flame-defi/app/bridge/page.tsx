"use client";

import type React from "react";
import { useState } from "react";

import DepositCard from "components/deposit-card/deposit-card";
import WithdrawCard from "components/withdraw-card/withdraw-card";

type TabType = "DEPOSIT" | "WITHDRAW";

interface TabProps {
  label: TabType;
  isActive: boolean;
  onClick: (tab: TabType) => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => (
  <li
    className={`flex flex-1 h-14 justify-center items-center cursor-pointer ${
      isActive
        ? "bg-[radial-gradient(100%_100%_at_50.15%_0%,#221f1f_0%,#050a0d_100%)] shadow-[inset_3px_3px_3px_-3px_rgba(255,255,255,0.5)] rounded-xl"
        : ""
    }`}
    onClick={() => onClick(label)}
    onKeyUp={() => onClick(label)}
  >
    <a
      onClick={() => {}}
      className={`px-6 py-4 font-mono font-medium transition ease-in ${
        isActive
          ? "text-white font-bold"
          : "text-[#9B9B9B] hover:text-[#D9D9D9]"
      }`}
    >
      {label}
    </a>
  </li>
);

export default function BridgePage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>("DEPOSIT");

  const tabs: TabType[] = ["DEPOSIT", "WITHDRAW"];

  return (
    <section className="w-full min-h-[calc(100vh-85px-96px)] flex flex-col items-center mt-[100px]">
      <div className="w-full px-0 md:w-[675px] lg:px-4">
        <div className="px-4 py-12 sm:px-4 lg:p-12 bg-[radial-gradient(144.23%_141.13%_at_50.15%_0%,#221F1F_0%,#050A0D_100%)] shadow-[inset_1px_1px_1px_-1px_rgba(255,255,255,0.5)] rounded-2xl">
          <div className="flex items-center justify-center p-1 w-full bg-semi-white border-[1px] border-white/20 rounded-xl border-b-0 border-r-0 mb-5">
            <ul className="flex w-full text-center">
              {tabs.map((tab) => (
                <Tab
                  key={tab}
                  label={tab}
                  isActive={activeTab === tab}
                  onClick={setActiveTab}
                />
              ))}
            </ul>
          </div>
          <div className="p-0">
            {activeTab === "DEPOSIT" ? <DepositCard /> : <WithdrawCard />}
          </div>
        </div>
      </div>
    </section>
  );
}
