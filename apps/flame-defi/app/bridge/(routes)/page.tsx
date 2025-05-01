"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ROUTES } from "bridge/constants/routes";

export default function BridgePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to deposit page by default
    router.push(ROUTES.DEPOSIT);
  }, [router]);

  return null;
}
