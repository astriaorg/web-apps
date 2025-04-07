import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";

import { ChevronDownSmallIcon } from "../../icons";
import { cn } from "../../utils";

const Accordion = AccordionPrimitive.Root;

type AccordionItemProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Item
> & {
  className?: string;
  children?: React.ReactNode;
  value: string;
};

type RadixTriggerProps = React.ComponentPropsWithoutRef<"button"> &
  AccordionPrimitive.AccordionTriggerProps;
interface AccordionTriggerProps extends RadixTriggerProps {
  className?: string;
  children?: React.ReactNode;
}

type AccordionContentProps = AccordionPrimitive.AccordionContentProps & {
  children?: React.ReactNode;
  className?: string;
};

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Item ref={ref} className={cn("", className)} {...props}>
      {children}
    </AccordionPrimitive.Item>
  ),
);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium text-left transition-all [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownSmallIcon className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className,
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
