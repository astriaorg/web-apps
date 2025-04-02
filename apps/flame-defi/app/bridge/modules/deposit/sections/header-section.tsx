"use client";

import { ROUTES } from "bridge/constants/routes";
import Link from "next/link";

export const HeaderSection = () => {
  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="flex items-center justify-center p-1 w-full max-w-[400px] bg-semi-white border-[1px] border-white/20 rounded-xl border-b-0 border-r-0 mb-5">
        <ul className="flex w-full text-center">
          <li
            className="flex flex-1 h-14 justify-center items-center cursor-pointer bg-[radial-gradient(100%_100%_at_50.15%_0%,#221f1f_0%,#050a0d_100%)] shadow-[inset_3px_3px_3px_-3px_rgba(255,255,255,0.5)] rounded-xl"
          >
            <span className="px-6 py-4 font-mono font-medium transition ease-in text-white font-bold">
              DEPOSIT
            </span>
          </li>
          <li
            className="flex flex-1 h-14 justify-center items-center cursor-pointer"
          >
            <Link
              href={ROUTES.WITHDRAW}
              className="px-6 py-4 font-mono font-medium transition ease-in text-[#9B9B9B] hover:text-[#D9D9D9]"
            >
              WITHDRAW
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
