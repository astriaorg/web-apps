"use client";

import { CloseIcon } from "@repo/ui/icons";
import {
  Button,
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components";
import { cn } from "@repo/ui/utils";

interface ConfirmationModalProps {
  open: boolean;
  buttonText: string;
  children?: React.ReactNode;
  title?: string;
  actionButtonText?: string;
  showOpenButton?: boolean;
  handleCloseModal: () => void;
  handleOpenModal: () => void;
  handleModalActionButton: () => void;
}

export function ConfirmationModal({
  open,
  buttonText,
  children,
  title,
  actionButtonText,
  showOpenButton,
  handleCloseModal,
  handleOpenModal,
  handleModalActionButton,
}: ConfirmationModalProps): React.ReactElement {
  return (
    <Dialog open={open}>
      <DialogTrigger
        asChild
        className={cn("w-full", !showOpenButton && "hidden")}
      >
        <Button onClick={handleOpenModal} className="w-full mt-2">
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogPortal>
        <DialogContent className="p-4 md:p-12 bg-radial-dark w-[90%] md:w-[90%] lg:w-[500px] [&>button]:hidden fixed top-[350px] md:top-[440px] left-[50%] -translate-x-[50%] transition rounded-xl">
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <button onClick={handleCloseModal}>
              <CloseIcon className="text-grey-light hover:text-white transition" />
            </button>
          </div>
          <div className="flex flex-col justify-between">
            <div>{children}</div>
            <Button onClick={handleModalActionButton} className="w-full mt-6">
              {actionButtonText}
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
