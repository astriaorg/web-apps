"use client";

import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/shadcn-primitives";
import { useCallback, useEffect, useState } from "react";
import { CloseIcon } from "@repo/ui/icons";
import { ActionButton } from "@repo/ui/components";
import { TXN_STATUS } from "@repo/flame-types";

interface ConfirmationModalProps {
  onSubmitCallback: () => void;
  buttonText: string;
  setTxnStatus: (txnStatus: TXN_STATUS | undefined) => void;
  txnStatus: TXN_STATUS | undefined;
  handleResetInputs: () => void;
  children?: React.ReactNode;
  title?: string;
  actionButtonText?: string;
  isCloseModalAction?: boolean;
  skipIdleTxnStatus?: boolean;
}

export default function ConfirmationModal({
  onSubmitCallback,
  buttonText,
  children,
  handleResetInputs,
  isCloseModalAction,
  setTxnStatus,
  skipIdleTxnStatus,
  title,
  txnStatus,
  actionButtonText,
}: ConfirmationModalProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setTxnStatus(undefined);
    }
  }, [open, setTxnStatus]);

  const handleClose = () => {
      setOpen(false);
      if (txnStatus === TXN_STATUS.SUCCESS || txnStatus === undefined) {
        handleResetInputs();
      }
  };

  const handleOpen = () => {
    setOpen(true);
    if (skipIdleTxnStatus) {
      setTxnStatus(TXN_STATUS.PENDING);
      onSubmitCallback();
    } else {
      setTxnStatus(TXN_STATUS.IDLE);
    }
  };


  return (
    <Dialog open={open} onOpenChange={() => handleClose()}>
      <DialogTrigger asChild className="w-full">
        <ActionButton
          callback={handleOpen}
          buttonText={buttonText}
          className="w-full mt-2"
        />
      </DialogTrigger>

      <DialogPortal>
        <DialogContent className="p-12 bg-radial-dark w-[90%] md:w-[90%] lg:w-[500px] [&>button]:hidden fixed top-[440px] left-[50%] -translate-x-[50%] transition rounded-xl">
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <button onClick={handleClose}>
              <CloseIcon className="text-grey-light hover:text-white transition" />
            </button>
          </div>
          <div className="flex flex-col justify-between">
            <div>{children}</div>
            <ActionButton
              callback={isCloseModalAction ? handleClose : onSubmitCallback}
              buttonText={actionButtonText}
              className="w-full mt-6"
            />
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
