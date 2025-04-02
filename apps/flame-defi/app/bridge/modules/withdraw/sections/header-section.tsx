"use client";

import { ROUTES } from "bridge/constants/routes";
import Link from "next/link";

export const HeaderSection = () => {
  return (
    <div className="mb-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-white mb-4">Bridge - Withdraw</h1>
      <div className="flex space-x-4">
        <Link
          href={ROUTES.DEPOSIT}
          className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          Switch to Deposit
        </Link>
      </div>
    </div>
  );
};
