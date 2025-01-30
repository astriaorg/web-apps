"use client";

import React from "react";
import { DownArrowIcon } from "@repo/ui/icons";
import {
  ActionButton,
  TokenSelector,
  SettingsPopover,
} from "@repo/ui/components";
import { useState } from "react";
import { useAccount } from "wagmi";
import { TOKEN_INPUTS } from "../constants";
import { TokenState } from "@repo/ui/types";
import { useConfig } from "config";
import { formatBalanceValues } from "utils/utils";
import { useTokenBalance } from "features/EvmWallet/hooks/useTokenBalance";
import { useSwapButton } from "./useSwapButton";

export default function SwapPage(): React.ReactElement {
  const { evmChains } = useConfig();
  const evmChainsData = Object.values(evmChains);
  const currencies = evmChainsData[0]?.currencies;
  const userAccount = useAccount();
  const [inputSelected, setInputSelected] = useState(TOKEN_INPUTS.TOKEN_ONE);
  const [inputOne, setInputOne] = useState<TokenState>({
    token: currencies?.[0],
    value: "",
  });
  // TODO: update this inputs values based on the quote service when ready
  const [inputTwo, setInputTwo] = useState<TokenState>({
    token: null,
    value: "",
  });
  const tokenOneBalance = useTokenBalance(inputOne.token, evmChainsData[0]);
  const tokenTwoBalance = useTokenBalance(inputTwo.token, evmChainsData[0]);

  const { handleButtonAction, buttonText, validSwapInputs } = useSwapButton(
    inputOne,
    inputTwo,
    tokenOneBalance.balance?.value || "0",
    evmChainsData,
  );

  // TODO: Add this back in when the quote service is ready
  // const { quote, loading, error } = useGetQuote({
  //   chainId: evmChainsData[0]?.chainId,
  //   amount: inputOne.value ? parseUnits(inputOne.value, inputOne.token?.coinDecimals || 18).toString() : "1",
  //   tokenInAddress: inputOne.token?.erc20ContractAddress || inputOne.token?.nativeTokenWithdrawerContractAddress,
  //   tokenInDecimals: inputOne.token?.coinDecimals,
  //   tokenInSymbol: inputOne.token?.coinDenom,
  //   tokenOutAddress: inputTwo.token?.erc20ContractAddress || inputTwo.token?.nativeTokenWithdrawerContractAddress,
  //   tokenOutDecimals: inputTwo.token?.coinDecimals,
  //   tokenOutSymbol: inputTwo.token?.coinDenom,
  //   type: 'exactIn',
  // });

  const handleInputChange = (value: string, isInputOne: boolean) => {
    if (isInputOne) {
      setInputOne((prev) => ({ ...prev, value: value }));
    } else {
      setInputTwo((prev) => ({ ...prev, value: value }));
    }
  };

  const handleArrowClick = () => {
    setInputSelected(
      inputSelected === TOKEN_INPUTS.TOKEN_ONE
        ? TOKEN_INPUTS.TOKEN_TWO
        : TOKEN_INPUTS.TOKEN_ONE,
    );

    setInputOne(() => ({ value: inputTwo.value || "", token: inputTwo.token }));
    setInputTwo(() => ({ value: inputOne.value || "", token: inputOne.token }));
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
              onChange={(e) => handleInputChange(e.target.value, true)}
              className="normalize-input w-[45%] sm:max-w-[62%] text-ellipsis overflow-hidden"
              placeholder="0"
            />
            <div className="flex flex-col items-end">
              <TokenSelector
                tokens={currencies}
                selectedToken={inputOne.token}
                setSelectedToken={(token) =>
                  setInputOne((prev) => ({ ...prev, token }))
                }
              />
              {inputOne.token ? (
                <div className="text-sm font-medium text-grey-light flex items-center mt-3">
                  <span className="flex items-center gap-2">
                    {formatBalanceValues(tokenOneBalance.balance?.value)}{" "}
                    {tokenOneBalance.balance?.symbol}
                  </span>
                  <span
                    onClick={() =>
                      handleInputChange(
                        tokenOneBalance.balance?.value || "0",
                        true,
                      )
                    }
                    className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-orange-soft text-sm cursor-pointer transition"
                  >
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
              onChange={(e) => handleInputChange(e.target.value, false)}
              className="normalize-input w-[45%] sm:max-w-[62%] text-ellipsis overflow-hidden"
              placeholder="0"
            />
            <div className="flex flex-col items-end">
              <TokenSelector
                tokens={currencies}
                selectedToken={inputTwo.token}
                setSelectedToken={(token) =>
                  setInputTwo((prev) => ({ ...prev, token }))
                }
              />
              {inputTwo.token ? (
                <div className="text-sm font-medium text-grey-light flex items-center mt-3">
                  <span className="flex items-center gap-2">
                    {formatBalanceValues(tokenTwoBalance.balance?.value)}{" "}
                    {tokenTwoBalance.balance?.symbol}
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
        {userAccount.address && !validSwapInputs && (
          <div className="flex items-center justify-center text-grey-light font-semibold px-4 py-3 rounded-xl bg-semi-white mt-2">
            {buttonText}
          </div>
        )}
        {handleButtonAction && validSwapInputs && (
          <ActionButton
            callback={handleButtonAction}
            buttonText={buttonText}
            className="w-full mt-2"
          />
        )}
        {/* TODO: ADD THIS IN WHEN WE HAVE THE TXN INFO */}
        {/* <TxnInfo /> */}
      </div>
    </section>
  );
}
