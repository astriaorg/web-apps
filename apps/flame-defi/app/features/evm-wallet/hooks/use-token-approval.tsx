import { useConfig } from "config";
import { useCallback, useEffect, useState } from "react";
import { type Address, type Hash } from "viem";
import { useAccount, useConfig as useWagmiConfig } from "wagmi";

import {
  EvmChainInfo,
  TokenAllowance,
  TokenInputState,
  tokenStateToBig,
  TXN_STATUS,
} from "@repo/flame-types";

import { createERC20Service } from "../services/erc-20-service";

type TokenApprovalProps = {
  chain: EvmChainInfo;
  addressToApprove: Address;
  // FIXME - could we remove these callbacks and instead return the txnHash from
  //  handleTokenApproval and try/catch errors at the calling site?
  setTxnStatus: (status: TXN_STATUS) => void;
  setTxnHash: (hash?: Hash) => void;
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

  /** Handles the token approval flow including transaction status updates */
  handleTokenApproval: (tokenInputToApprove: TokenInputState) => Promise<void>;
};

/**
 * For approving ERC20s.
 * Provides functionality to check if a token needs approval
 * and functionality to approve a token.
 * Keeps a cache of token allowances for the given chain and address to approve.
 */
export const useTokenApproval = ({
  chain,
  addressToApprove,
  setTxnStatus,
  setTxnHash,
  setErrorText,
}: TokenApprovalProps): TokenApprovalReturn => {
  const { currencies } = chain;
  const { tokenApprovalAmount } = useConfig();
  const [tokenAllowances, setTokenAllowances] = useState<TokenAllowance[]>([]);

  const wagmiConfig = useWagmiConfig();
  const userAccount = useAccount();

  const approveToken = useCallback(
    async (tokenInputState: TokenInputState): Promise<Hash | null> => {
      const { token } = tokenInputState;
      if (!token || !token.erc20ContractAddress) {
        return null;
      }
      const erc20Service = createERC20Service(
        wagmiConfig,
        token.erc20ContractAddress as Address,
      );

      const txHash = await erc20Service.approve(
        chain.chainId, // Use wallet's chain ID if available
        addressToApprove,
        tokenApprovalAmount,
      );

      const newTokenAllowances = tokenAllowances.map((data) => {
        if (data.symbol === token.coinDenom) {
          return {
            symbol: token.coinDenom,
            value: tokenApprovalAmount,
          };
        }
        return data;
      });

      setTokenAllowances(newTokenAllowances);

      return txHash;
    },
    [
      wagmiConfig,
      chain.chainId,
      addressToApprove,
      tokenApprovalAmount,
      tokenAllowances,
    ],
  );

  const getTokenAllowances = useCallback(async () => {
    if (!userAccount.address) {
      return;
    }
    const newTokenAllowances: TokenAllowance[] = [];
    for (const currency of currencies) {
      if (currency.erc20ContractAddress) {
        const erc20Service = createERC20Service(
          wagmiConfig,
          currency.erc20ContractAddress as Address,
        );
        try {
          const allowance = await erc20Service.allowance(
            chain.chainId, // Use wallet's chain ID if available
            userAccount.address,
            addressToApprove,
          );

          newTokenAllowances.push({
            symbol: currency.coinDenom,
            value: allowance.toString(),
          });
        } catch (error) {
          console.error("Failed to get token allowance:", error);
        }
      }
    }

    console.log({ newTokenAllowances });
    setTokenAllowances(newTokenAllowances);
  }, [
    userAccount.address,
    currencies,
    wagmiConfig,
    chain.chainId,
    addressToApprove,
  ]);

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

  // get token allowances when address is set and we don't have any tokenAllowances yet
  useEffect(() => {
    if (userAccount.address && tokenAllowances.length === 0) {
      void getTokenAllowances();
    }
  }, [getTokenAllowances, userAccount.address, tokenAllowances]);

  const handleTokenApproval = async (
    tokenInputToApprove: TokenInputState,
  ): Promise<void> => {
    if (!tokenInputToApprove?.token) {
      return;
    }
    try {
      setTxnStatus(TXN_STATUS.PENDING);
      const txHash = await approveToken({
        token: tokenInputToApprove.token,
        value: tokenApprovalAmount,
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
    getTokenNeedingApproval,
    handleTokenApproval,
  };
};
