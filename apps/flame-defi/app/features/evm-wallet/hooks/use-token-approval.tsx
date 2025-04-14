import { useCallback, useEffect, useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useConfig as useWagmiConfig } from "wagmi";

import {
  HexString,
  TokenAllowance,
  TokenInputState,
  tokenStateToBig,
  TXN_STATUS,
} from "@repo/flame-types";
import { useAstriaChainData, useConfig } from "config";
import { createErc20Service } from "../services/erc-20-service/erc-20-service";

type TokenApprovalProps = {
  setTxnStatus: (status: TXN_STATUS) => void;
  setTxnHash: (hash?: HexString) => void;
  setErrorText: (error: string) => void;
};

/**
 * Return type for the useTokenApproval hook
 */
export type TokenApprovalReturn = {
  /** Checks if a token needs approval based on its input state */
  getTokenNeedingApproval: (
    tokenInputState: TokenInputState,
  ) => TokenInputState | null;

  /** Approves a token for spending by a contract */
  approveToken: (tokenInputState: TokenInputState) => Promise<HexString | null>;

  /** Handles the token approval flow including transaction status updates */
  handleTokenApproval: (tokenInputToApprove: TokenInputState) => Promise<void>;
};

export const useTokenApproval = ({
  setTxnStatus,
  setTxnHash,
  setErrorText,
}: TokenApprovalProps): TokenApprovalReturn => {
  const { chain } = useAstriaChainData();
  const { currencies, contracts } = chain;
  const { tokenApprovalAmount } = useConfig();
  const [tokenAllowances, setTokenAllowances] = useState<TokenAllowance[]>([]);

  const wagmiConfig = useWagmiConfig();
  const userAccount = useAccount();

  const approveToken = useCallback(
    async (tokenInputState: TokenInputState): Promise<HexString | null> => {
      const { token } = tokenInputState;
      if (!token || !token.erc20ContractAddress) {
        return null;
      }
      const erc20Service = createErc20Service(
        wagmiConfig,
        token.erc20ContractAddress as HexString,
      );

      const txHash = await erc20Service.approveToken(
        chain.chainId,
        contracts.swapRouter.address,
        tokenApprovalAmount || tokenInputState.value,
        token.coinDecimals,
      );

      const newTokenAllowances = tokenAllowances.map((data) => {
        if (data.symbol === token.coinDenom) {
          return {
            symbol: token.coinDenom,
            value: parseUnits(
              tokenApprovalAmount || tokenInputState.value,
              token.coinDecimals,
            ).toString(),
          };
        }
        return data;
      });

      setTokenAllowances(newTokenAllowances);

      return txHash;
    },
    [
      wagmiConfig,
      contracts.swapRouter.address,
      chain,
      tokenAllowances,
      tokenApprovalAmount,
    ],
  );

  const getTokenAllowances = useCallback(async () => {
    if (!userAccount.address) {
      return;
    }
    const newTokenAllowances: TokenAllowance[] = [];
    for (const currency of currencies) {
      if (currency.erc20ContractAddress) {
        const erc20Service = createErc20Service(
          wagmiConfig,
          currency.erc20ContractAddress as HexString,
        );
        try {
          const allowance = await erc20Service.getTokenAllowance(
            chain.chainId,
            userAccount.address,
            contracts.swapRouter.address,
          );

          newTokenAllowances.push({
            symbol: currency.coinDenom,
            value: allowance ?? "0",
          });
        } catch (error) {
          console.error("Failed to get token allowance:", error);
        }
      }
    }

    setTokenAllowances(newTokenAllowances);
  }, [userAccount.address, contracts, currencies, chain, wagmiConfig]);

  const getTokenNeedingApproval = useCallback(
    (tokenInputState: TokenInputState): TokenInputState | null => {
      const { token } = tokenInputState;

      if (!token) {
        return null;
      }

      const existingAllowance = tokenAllowances.find(
        (allowanceToken) => token.coinDenom === allowanceToken.symbol,
      );

      if (existingAllowance) {
        const tokenInputGreaterThanAllowance = tokenStateToBig(
          tokenInputState,
        ).gt(existingAllowance.value);
        if (tokenInputGreaterThanAllowance) {
          return { token: token, value: tokenInputState.value };
        }
      }

      return null;
    },
    [tokenAllowances],
  );

  useEffect(() => {
    if (userAccount.address && tokenAllowances.length === 0) {
      void getTokenAllowances();
    }
  }, [getTokenAllowances, userAccount.address, tokenAllowances]);

  const handleTokenApproval = async (
    tokenInputToApprove: TokenInputState,
  ): Promise<void> => {
    if (!tokenInputToApprove?.token || !tokenInputToApprove?.value) {
      return;
    }
    try {
      setTxnStatus(TXN_STATUS.PENDING);
      const txHash = await approveToken({
        token: tokenInputToApprove.token,
        value: tokenApprovalAmount || tokenInputToApprove.value,
      });
      if (txHash) {
        setTxnHash(txHash);
      }
      return;
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        console.warn(error);
        setTxnStatus(TXN_STATUS.FAILED);
        return;
      } else {
        console.warn(error);
        setErrorText("Error approving token");
        setTxnStatus(TXN_STATUS.FAILED);
      }

      return;
    }
  };

  return {
    approveToken,
    getTokenNeedingApproval,
    handleTokenApproval,
  };
};
