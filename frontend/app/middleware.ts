import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0];

  if (hostname === "launch-pilot-flax.vercel.app") {
    const url = request.nextUrl.clone();

    url.protocol = "https:";
    url.host = "www.plavtora.com";

    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};