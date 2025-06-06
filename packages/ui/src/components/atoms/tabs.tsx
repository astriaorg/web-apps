"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";

const tabsListVariants = cva(
  "inline-flex items-center justify-center space-x-1.5",
  {
    variants: {
      variant: {
        default: "text-typography-light",
        outline: "text-typography-light",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-surface-3 data-[state=active]:text-typography-default data-[state=active]:shadow-xs",
  {
    variants: {
      variant: {
        default: "rounded-lg px-2 py-1.5 text-sm/5 font-medium uppercase",
        outline: "rounded-lg px-2 py-1.5 text-sm/5 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const tabsVariants = cva("", {
  variants: {
    variant: {
      default: "",
      outline:
        "flex items-center p-1 bg-surface-1 border border-stroke-default rounded-xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
    VariantProps<typeof tabsListVariants> {}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn(tabsVariants({ variant }), className)}
    {...props}
  />
));
Tabs.displayName = TabsPrimitive.Root.displayName;

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
