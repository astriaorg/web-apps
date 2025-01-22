"use client";

import { DownArrowIcon } from "@repo/ui/icons";
import type React from "react";
import {
  ActionButton,
  TokenSelector,
  SettingsPopover,
} from "@repo/ui/components";
import type { TokenItem } from "./useTokenModal";
import { useTokenModal } from "./useTokenModal";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useEvmWallet } from "features/EvmWallet";
import { useTxnInfo } from "./useTxnInfo";
enum TOKEN_INPUTS {
  TOKEN_ONE = "token_one",
  TOKEN_TWO = "token_two",
}

export interface TokenState {
  token?: TokenItem | null;
  value: number | undefined;
}

export default function SwapPage(): React.ReactElement {
  const { tokens } = useTokenModal();
  const { connectEvmWallet } = useEvmWallet();
  const userAccount = useAccount();
  const [inputSelected, setInputSelected] = useState(TOKEN_INPUTS.TOKEN_ONE);
  const [inputOne, setInputOne] = useState<TokenState>({
    token: tokens[0],
    value: undefined,
  });
  const [inputTwo, setInputTwo] = useState<TokenState>({
    token: null,
    value: undefined,
  });

  const actionText = useTxnInfo(inputOne, inputTwo);

  const handleInputChange = (value: number, isInputOne: boolean) => {
    if (isInputOne) {
      setInputOne((prev) => ({ ...prev, value }));
    } else {
      setInputTwo((prev) => ({ ...prev, value }));
    }
  };

  const handleArrowClick = () => {
    setInputSelected(
      inputSelected === TOKEN_INPUTS.TOKEN_ONE
        ? TOKEN_INPUTS.TOKEN_TWO
        : TOKEN_INPUTS.TOKEN_ONE,
    );
    setInputOne((prev) => ({ ...prev, token: inputTwo.token }));
    setInputTwo((prev) => ({ ...prev, token: inputOne.token }));
  };

  return (
    <section className="min-h-[calc(100vh-85px-96px)] flex flex-col mt-[100px]">
      <div className="max-w-[550px] w-full mx-auto rounded-2xl p-4 sm:p-4 md:p-8 lg:p-12 border border-solid border-transparent bg-radial-dark shadow-[inset_1px_1px_1px_-1px_hsla(0,0%,100%,0.5)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Swap</h2>
          <SettingsPopover />
        </div>
        <div
          onKeyDown={() => null}
          onClick={() => setInputSelected(TOKEN_INPUTS.TOKEN_ONE)}
          className={`flex flex-col rounded-md p-2 transition border border-solid border-transparent hover:border-grey-light ${
            inputSelected === TOKEN_INPUTS.TOKEN_ONE
              ? "bg-background border-grey-medium"
              : "bg-white/[0.04]"
          }`}
        >
          <div className="flex justify-between items-center">
            <input
              type="number"
              value={inputOne.value}
              onChange={(e) => handleInputChange(Number(e.target.value), true)}
              className="w-[45%] sm:max-w-[62%] flex-1 bg-transparent focus:outline-none text-[36px] placeholder:text-grey-light [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />
            <div className="flex items-center space-x-2">
              <TokenSelector
                tokens={tokens}
                selectedToken={inputOne.token}
                setSelectedToken={(token) =>
                  setInputOne((prev) => ({ ...prev, token }))
                }
              />
            </div>
          </div>
          <div>
            <span className="text-sm font-medium">$100</span>
          </div>
        </div>
        <div
          className="relative flex justify-center"
          style={{ margin: "-20px 0" }}
        >
          <button
            type="button"
            className="z-10 cursor-pointer p-1 bg-grey-dark hover:bg-black transition rounded-xl border-4 border-black"
            onClick={() => handleArrowClick()}
          >
            <DownArrowIcon aria-label="Swap" size={28} />
          </button>
        </div>
        <div
          onKeyDown={() => null}
          onClick={() => setInputSelected(TOKEN_INPUTS.TOKEN_TWO)}
          className={`flex flex-col rounded-md p-2 transition border border-solid border-transparent hover:border-grey-light ${
            inputSelected === TOKEN_INPUTS.TOKEN_TWO
              ? "bg-background border-grey-medium"
              : "bg-white/[0.04]"
          }`}
        >
          <div className="flex justify-between items-center">
            <input
              type="number"
              value={inputTwo.value}
              onChange={(e) => handleInputChange(Number(e.target.value), false)}
              className="w-[45%] sm:max-w-[62%] flex-1 bg-transparent focus:outline-none text-[36px] placeholder:text-grey-light [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />
            <div className="flex items-center space-x-2">
              <TokenSelector
                tokens={tokens}
                selectedToken={inputTwo.token}
                setSelectedToken={(token) =>
                  setInputTwo((prev) => ({ ...prev, token }))
                }
              />
            </div>
          </div>
          <div>
            <span className="text-sm font-medium">$100</span>
          </div>
        </div>
        {!userAccount.address && (
          <ActionButton
            callback={connectEvmWallet}
            buttonText="Connect Wallet"
            className="w-full mt-2"
          />
        )}
        {/* TODO: This is a temp example of how we might conditionally render the action button */}
        {userAccount.address && actionText !== "Swap" && (
          <div className="flex items-center justify-center text-grey-light font-semibold px-4 py-3 rounded-xl bg-white/[0.04] mt-2">
            {actionText}
          </div>
        )}
        {/* TODO: This is a temp example of how we might conditionally render the action button */}
        {userAccount.address && actionText === "Swap" && (
          <ActionButton
            callback={() => console.log("DO A SWAP")}
            buttonText="Swap"
            className="w-full mt-2"
          />
        )}
        {/* TODO: ADD THIS IN WHEN WE HAVE THE TXN INFO */}
        {/* <TxnInfo /> */}
      </div>
    </section>
  );
}
