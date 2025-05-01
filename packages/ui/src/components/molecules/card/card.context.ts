"use client";

import { type VariantProps } from "class-variance-authority";
import { createContext, useContext } from "react";

import { cardVariants } from "./card";

interface CardContextType extends VariantProps<typeof cardVariants> {
  isLoading: boolean;
}

export const CardContext = createContext<CardContextType | undefined>(
  undefined,
);

export const useCardContext = () => {
  const context = useContext(CardContext);

  if (!context) {
    throw new Error("`useCardContext` must be used within a CardContext.");
  }

  return context;
};
