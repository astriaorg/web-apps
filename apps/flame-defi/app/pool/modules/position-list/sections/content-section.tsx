"use client";

import { StatusCard } from "@repo/ui/components";
import { PositionListTable } from "pool/modules/position-list/components/position-list-table";
import { usePageContext } from "pool/modules/position-list/hooks/use-page-context";

export const ContentSection = () => {
  const { status } = usePageContext();

  return (
    <section className="flex flex-col">
      {status === "error" && (
        <StatusCard status="error">
          {`We couldn't fetch your position data. Please try again later.`}
        </StatusCard>
      )}
      {status === "empty" && (
        <StatusCard status="empty">
          {`Your active V3 liquidity positions will appear here.`}
        </StatusCard>
      )}
      {status === "success" && <PositionListTable />}
    </section>
  );
};
