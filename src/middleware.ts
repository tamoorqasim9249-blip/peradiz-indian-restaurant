import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all routes except Next.js internals, API routes, and files with an extension
  // (static assets). API routes have their own rate limiting/validation (see src/lib/).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
