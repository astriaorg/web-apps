import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@repo/ui/components";

interface ConfirmationModalProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  title: React.ReactNode;
}

export const ConfirmationModal = ({
  title,
  children,
  ...props
}: ConfirmationModalProps) => {
  return (
    <Dialog {...props}>
      <DialogPortal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
