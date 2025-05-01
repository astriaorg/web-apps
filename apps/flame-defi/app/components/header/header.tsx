import { Button } from "@repo/ui/components";
import { ArrowLeftIcon } from "@repo/ui/icons";
import type { PropsWithChildren } from "react";

interface HeaderProps extends PropsWithChildren {
  children: React.ReactNode;
  onClickBack?: () => void;
}

// TODO: Apply this component to earn pages.
export const Header = ({ children, onClickBack }: HeaderProps) => {
  return (
    <section className="flex flex-col mb-8">
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full flex flex-col lg:flex-row">
          {onClickBack && (
            <Button
              className="h-8 w-8 text-icon-light mb-4 -ml-2 lg:absolute lg:-left-12 lg:mb-0 lg:ml-0"
              variant="ghost"
              onClick={onClickBack}
            >
              <ArrowLeftIcon aria-label="Back" size={16} />
            </Button>
          )}
          {children}
        </div>
      </div>
    </section>
  );
};
