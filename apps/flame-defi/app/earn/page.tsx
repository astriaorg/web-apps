"use client";

import React from "react";
import { TableContextProvider } from "./contexts/TableContext";
import { TableSection } from "./sections/TableSection/TableSection";

export default function EarnPage(): React.ReactElement {
  return (
    <TableContextProvider>
      <TableSection />
    </TableContextProvider>
  );
}
