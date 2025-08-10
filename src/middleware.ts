// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import type { NextRequest } from "next/server";

// const authOnlyRoutes = ["/dashboard", "/events"]; // protected route prefixes
// const authPages = ["/", "/login"]; // pages for guests only

// export async function middleware(req: NextRequest) {
//   const token = await getToken({ req });
//   const path = req.nextUrl.pathname;

//   const isAuthOnly = authOnlyRoutes.some((route) => path.startsWith(route));
//   const isAuthPage = authPages.includes(path);

//   // If logged in user visits login or register, redirect to dashboard
//   if (token && isAuthPage) {
//     return NextResponse.redirect(new URL("/dashboard/events", req.url));
//   }

//   // If NOT logged in and visiting protected route, redirect to home or login
//   if (!token && isAuthOnly) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next|api|static|.*\\..*).*)"],
// };

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const authOnlyRoutes = ["/dashboard", "/events"];
const authPages = ["/", "/login"];

const getAllowedOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGIN || "";
  return origins.split(",").map((origin) => origin.trim());
};

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  // CORS Check
  const origin = req.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();
  console.log("origin", origin);

  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse("CORS Forbidden", { status: 403 });
  }

  const isAuthOnly = authOnlyRoutes.some((route) => path.startsWith(route));
  const isAuthPage = authPages.includes(path);

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard/events", req.url));
  }

  if (!token && isAuthOnly) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next|static|.*\\..*).*)"],
};
