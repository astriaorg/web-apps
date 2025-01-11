"use client";

import DepositCard from "components/DepositCard/DepositCard";
import WithdrawCard from "components/WithdrawCard/WithdrawCard";
import { useState } from "react";

type TabType = "DEPOSIT" | "WITHDRAW";

interface TabProps {
  label: TabType;
  isActive: boolean;
  onClick: (tab: TabType) => void;
}

const Tab = ({ label, isActive, onClick }: TabProps) => (
  <li className={`${isActive ? "border-b-2 border-orange-500" : ""}`}>
    <button
      type="button"
      onClick={() => onClick(label)}
      className="px-4 py-2 text-white hover:text-orange-300"
    >
      {label}
    </button>
  </li>
);

export default function BridgePage() {
  const [activeTab, setActiveTab] = useState<TabType>("DEPOSIT");
  const tabs: TabType[] = ["DEPOSIT", "WITHDRAW"];

  return (
    <section className="min-h-[calc(100vh-85px-96px)] flex flex-col items-center justify-center">
      <div className="w-full md:w-2/3 lg:w-2/3 xl:w-1/2 max-w-[676px]">
        <div className="p-12 md:p-[48px] bg-[radial-gradient(144.23%_141.13%_at_50.15%_0%,#221F1F_0%,#050A0D_100%)] shadow-[inset_1px_1px_1px_-1px_rgba(255,255,255,0.5)] rounded-2xl">
          <div className="flex items-center justify-center p-1 w-full bg-white/[0.04] border-[1px] border-white/20 rounded-xl border-b-0 border-r-0 mb-5">
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
          <div className="p-6">
            {activeTab === "DEPOSIT" ? <DepositCard /> : <WithdrawCard />}
          </div>
        </div>
      </div>
    </section>
  );
}
