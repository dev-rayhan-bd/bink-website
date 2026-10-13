import { headers } from "next/headers";

/**
 * Returns the base cookie options for session cookies (accessToken, refreshToken, guestId).
 *
 * The `secure` flag MUST be `false` when the request is served over plain HTTP
 * (e.g. localhost in dev, or an HTTP staging server). Browsers silently drop
 * `secure` cookies on non-HTTPS connections, which is why login cookies were
 * not being set. On HTTPS we keep `secure: true` for safety.
 *
 * `httpOnly` keeps the token out of client-side JS, and `sameSite: "lax"`
 * prevents CSRF while still allowing top-level navigations to send the cookie.
 */
export const getSessionCookieOptions = async () => {
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "";
  const isLocalhost =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    process.env.NODE_ENV === "development";
  const protocol =
    headerStore.get("x-forwarded-proto") ?? (isLocalhost ? "http" : "https");
  const isHttps = !isLocalhost && protocol === "https";

  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax" as const,
    path: "/",
  };
};
