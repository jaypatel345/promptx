import { NextRequest, NextResponse } from "next/server";

// Next's next.config.ts redirects() matches paths case-insensitively, which
// would turn a rule like "/Enhancer" -> "/enhancer" into a redirect loop on
// the new lowercase route itself. Exact string comparison here avoids that.
const LEGACY_PATH_REDIRECTS: Record<string, string> = {
  "/Enhancer": "/enhancer",
  "/Engineering": "/engineering",
  "/AITools": "/ai-tools",
  "/Learn": "/learn",
};

export function proxy(request: NextRequest) {
  const destination = LEGACY_PATH_REDIRECTS[request.nextUrl.pathname];

  if (destination) {
    const url = request.nextUrl.clone();
    url.pathname = destination;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/Enhancer", "/Engineering", "/AITools", "/Learn"],
};
