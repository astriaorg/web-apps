import { useConfig } from "config";
import { useEvmWallet } from "features/evm-wallet";
import { HexString, TXN_STATUS, TokenInputState } from "@repo/flame-types";

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

  const handleTokenApproval = async (
    tokenNeedingApproval: TokenInputState,
  ): Promise<void> => {
    if (!tokenNeedingApproval?.token || !tokenNeedingApproval?.value) {
      return;
    }
    try {
      setTxnStatus(TXN_STATUS.PENDING);
      const txHash = await approveToken({
        token: tokenNeedingApproval.token,
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
    handleTokenApproval,
    tokenNeedingApproval: tokenNeedingApproval,
  };
};
