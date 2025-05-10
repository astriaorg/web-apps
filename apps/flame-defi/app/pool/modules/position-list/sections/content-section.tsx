"use client";

import { useMemo } from "react";

import { StatusCard } from "@repo/ui/components";
import { useGetPositions } from "pool/hooks/use-get-positions";
import { PositionListTable } from "pool/modules/position-list/components/position-list-table";

type Status = "error" | "empty" | "success";

export const ContentSection = () => {
  const { data, isError, isPending } = useGetPositions();

  const status = useMemo<Status>(() => {
    if (isError) {
      return "error";
    }

    if (!isPending && !data?.length) {
      return "empty";
    }

    return "success";
  }, [isError, isPending, data?.length]);

  return (
    <section className="flex flex-col">
      {status === "error" && (
        <StatusCard status="error">
          {`We couldn't fetch your position data. Please try again later.`}
        </StatusCard>
      )}
      {status === "empty" && (
        <StatusCard status="empty">{`No positions found.`}</StatusCard>
      )}
      {status === "success" && <PositionListTable />}
    </section>
  );
};
