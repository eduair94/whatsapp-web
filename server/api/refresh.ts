export default defineEventHandler(async (event) => {
  // Get the referer URL from the request
  const referer = getHeader(event, "referer")
  
  // Get the origin/host from the request as fallback
  const host = getHeader(event, "host");
  const protocol = getHeader(event, "x-forwarded-proto") || "https";
  const origin = `${protocol}://${host}`;
  
  // Use referer if available, otherwise fallback to root
  const redirectUrl = referer || origin + "/";

  // Force a full page reload to bypass Cloudflare challenge
  // Using 302 redirect to ensure browser makes a fresh request
  await sendRedirect(event, redirectUrl, 302);
});
