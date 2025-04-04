import { useConfig } from "config";
import { useEvmWallet } from "features/evm-wallet";
import {
  HexString,
  TXN_STATUS,
  ErrorWithMessage,
  TokenInputState,
} from "@repo/flame-types";

export const useTokenApproval = ({
  tokenNeedingApproval,
  setTxnStatus,
  setTxnHash,
  setErrorText,
}: {
  tokenNeedingApproval: TokenInputState | null;
  setTxnStatus: (status: TXN_STATUS) => void;
  setTxnHash: (hash: HexString | undefined) => void;
  setErrorText: (error: string) => void;
}) => {
  const { tokenApprovalAmount } = useConfig();
  const { approveToken } = useEvmWallet();

  const handleTokenApproval = async (tokenNeedingApproval: TokenInputState) => {
    if (!tokenNeedingApproval?.token || !tokenNeedingApproval?.value) {
      return null;
    }
    try {
      setTxnStatus(TXN_STATUS.PENDING);
      const txHash = await approveToken(
        tokenNeedingApproval.token,
        tokenApprovalAmount,
      );
      if (txHash) {
        setTxnHash(txHash);
      }
      return txHash;
    } catch (error) {
      if ((error as ErrorWithMessage).message.includes("User rejected")) {
        console.warn(error);
        setTxnStatus(TXN_STATUS.FAILED);
        return null;
      } else {
        console.warn(error);
        setErrorText("Error approving token");
        setTxnStatus(TXN_STATUS.FAILED);
      }

      return null;
    }
  };

  return {
    handleTokenApproval,
    tokenNeedingApproval: tokenNeedingApproval,
  };
};
