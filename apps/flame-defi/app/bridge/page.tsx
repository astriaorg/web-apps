"use client";

// This file is deprecated in favor of the new route structure
// New routes are in (routes)/deposit/page.tsx and (routes)/withdraw/page.tsx
// This file is being kept for reference until the refactoring is complete

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "./constants/routes";

export default function BridgePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new deposit route
    router.push(ROUTES.DEPOSIT);
  }, [router]);

  return null;
}
