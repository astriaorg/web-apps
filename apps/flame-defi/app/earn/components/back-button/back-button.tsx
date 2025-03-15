import { Button, ButtonProps } from "@repo/ui/components";
import { ArrowLeftIcon } from "@repo/ui/icons";

export const BackButton = (props: ButtonProps) => {
  return (
    <Button
      className="h-8 w-8 text-icon-light mb-10 2xl:absolute 2xl:-left-12 2xl:mb-0"
      variant="ghost"
      {...props}
    >
      <ArrowLeftIcon aria-label="Back" size={16} />
    </Button>
  );
};
