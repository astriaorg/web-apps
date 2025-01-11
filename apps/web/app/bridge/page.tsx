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
    <section className="container px-2 mx-auto">
      <div className="flex items-center justify-center min-h-[calc(100vh-85px-96px)]">
        <div className="w-full max-w-2xl mx-4">
          <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-lg shadow-lg">
            <div className="border-b border-neutral-700">
              <ul className="flex">
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
      </div>
    </section>
  );
}
