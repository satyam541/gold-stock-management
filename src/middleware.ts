export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /login
     * - /forgot-password
     * - /reset-password
     * - /api/auth (NextAuth routes)
     * - /_next (Next.js internals)
     * - /favicon.ico, /images, etc.
     */
    "/((?!login|forgot-password|reset-password|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
