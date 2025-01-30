"use client";

import { DownArrowIcon } from "@repo/ui/icons";
import type React from "react";
import {
  ActionButton,
  TokenSelector,
  SettingsPopover,
} from "@repo/ui/components";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useEvmWallet } from "features/EvmWallet";
import { useTxnInfo } from "./useTxnInfo";
import { tokens, TOKEN_INPUTS } from "../constants";
import { TokenState } from "@repo/ui/types";

export default function SwapPage(): React.ReactElement {
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
      <div className="max-w-[550px] w-full mx-auto gradient-container">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-2xl font-medium">Swap</h2>
          <SettingsPopover />
        </div>
        <div
          onKeyDown={() => null}
          onClick={() => setInputSelected(TOKEN_INPUTS.TOKEN_ONE)}
          className={`flex flex-col rounded-md p-4 transition border border-solid border-transparent hover:border-grey-medium ${
            inputSelected === TOKEN_INPUTS.TOKEN_ONE
              ? "bg-background border-grey-medium"
              : "bg-semi-white"
          }`}
        >
          <div className="text-base font-medium text-grey-light">Sell</div>
          <div className="flex justify-between items-center">
            <input
              type="number"
              value={inputOne.value}
              onChange={(e) => handleInputChange(Number(e.target.value), true)}
              className="normalize-input w-[45%] sm:max-w-[62%]"
              placeholder="0"
            />
            <div className="flex flex-col items-end">
              <TokenSelector
                tokens={tokens}
                selectedToken={inputOne.token}
                setSelectedToken={(token) =>
                  setInputOne((prev) => ({ ...prev, token }))
                }
              />
              {inputOne.token ? (
                <div className="text-sm font-medium text-grey-light flex items-center mt-3">
                  <span>{inputOne.value ? inputOne.value : "0"}</span>
                  <span className="ml-1">{inputOne.token?.symbol}</span>
                  <span className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-orange-soft text-sm cursor-pointer transition">
                    Max
                  </span>
                </div>
              ) : (
                <div className="h-[20px] mt-3 w-[100%]"></div>
              )}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-grey-light">$0</span>
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
          className={`flex flex-col rounded-md p-4 transition border border-solid border-transparent hover:border-grey-medium ${
            inputSelected === TOKEN_INPUTS.TOKEN_TWO
              ? "bg-background border-grey-medium"
              : "bg-semi-white"
          }`}
        >
          <div className="text-base font-medium text-grey-light">Buy</div>
          <div className="flex justify-between items-center">
            <input
              type="number"
              value={inputTwo.value}
              onChange={(e) => handleInputChange(Number(e.target.value), false)}
              className="normalize-input w-[45%] sm:max-w-[62%]"
              placeholder="0"
            />
            <div className="flex flex-col items-end">
              <TokenSelector
                tokens={tokens}
                selectedToken={inputTwo.token}
                setSelectedToken={(token) =>
                  setInputTwo((prev) => ({ ...prev, token }))
                }
              />
              <div className="h-[20px] mt-3 w-[100%]"></div>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-grey-light">$0</span>
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
          <div className="flex items-center justify-center text-grey-light font-semibold px-4 py-3 rounded-xl bg-semi-white mt-2">
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
