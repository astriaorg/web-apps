"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "bridge/constants/routes";

export default function BridgePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to deposit page by default
    router.push(ROUTES.DEPOSIT);
  }, [router]);

  return null;
}
