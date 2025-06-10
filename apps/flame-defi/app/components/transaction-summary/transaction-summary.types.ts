import type { Hash } from "viem";

import type { TransactionStatus } from "@repo/flame-types";

export interface TransactionSummaryProps {
  status: TransactionStatus;
  hash?: Hash;
  error?: Error;
  onSubmit: () => void;
}

export interface TransactionSuccessProps {
  hash: Hash;
}
