"use client";

import { cn } from "@repo/ui/utils";
import { ROUTES } from "bridge/constants/routes";
import Link from "next/link";

export type BridgeHeaderSectionProps = {
  activeTab: "deposit" | "withdraw";
};

/**
 * The header section for the bridge pages.
 */
export const BridgeHeaderSection = ({
  activeTab,
}: BridgeHeaderSectionProps) => {
  const isDepositActive = activeTab === "deposit";
  const isWithdrawActive = activeTab === "withdraw";

  const activeTabClasses =
    "bg-[radial-gradient(100%_100%_at_50.15%_0%,#221f1f_0%,#050a0d_100%)] shadow-[inset_3px_3px_3px_-3px_rgba(255,255,255,0.5)] rounded-xl";
  const activeTextClasses =
    "px-6 py-3 font-medium transition ease-in text-white";
  const inactiveTextClasses =
    "px-6 py-3 font-medium transition ease-in text-[#9B9B9B] hover:text-[#D9D9D9]";

  return (
    <div className="mb-8 flex items-center justify-between w-full px-0 md:w-[675px] lg:px-4">
      <div className="w-full text-4xl">Bridge</div>
      <div className="flex items-center justify-center p-1 w-full max-w-[400px] bg-semi-white border-[1px] border-white/20 rounded-xl border-b-0 border-r-0">
        <ul className="flex w-full text-center">
          <li
            className={cn(
              "flex flex-1 justify-center items-center cursor-pointer",
              isDepositActive && activeTabClasses,
            )}
          >
            {isDepositActive ? (
              <span className={activeTextClasses}>Deposit</span>
            ) : (
              <Link href={ROUTES.DEPOSIT} className={inactiveTextClasses}>
                Deposit
              </Link>
            )}
          </li>
          <li
            className={cn(
              "flex flex-1 justify-center items-center cursor-pointer",
              isWithdrawActive && activeTabClasses,
            )}
          >
            {isWithdrawActive ? (
              <span className={activeTextClasses}>Withdraw</span>
            ) : (
              <Link href={ROUTES.WITHDRAW} className={inactiveTextClasses}>
                Withdraw
              </Link>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};
