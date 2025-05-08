import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Handle exact matches for / and /bridge
  if (url.pathname === "/" || url.pathname === "/bridge") {
    url.pathname = "/bridge/deposit";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: ["/", "/bridge"],
};
