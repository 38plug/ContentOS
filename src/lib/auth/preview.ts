/**
 * Shared LIVE-PREVIEW OAuth client metadata (server-only — NEVER import from the client).
 *
 * The sandbox serves each live preview on a dynamic `https://*.grok-sandbox.com`
 * URL, which can't be pre-registered per app. The broker instead exposes ONE
 * shared "preview" client that accepts any
 * `https://*.grok-sandbox.com/api/auth/oauth2/callback/*`.
 *
 * The preview client **secret must come from the environment**
 * (`GROK_AUTH_CLIENT_SECRET` or `GROK_PREVIEW_CLIENT_SECRET`) — never from a
 * checked-in constant. Deployed apps inject a per-app `GROK_AUTH_*` pair.
 * Local email/password sign-in does not need this secret.
 */
export const PREVIEW_CLIENT_ID = "grok_preview";

/** Preview / fallback OAuth client secret from env only (no hardcoded value). */
export function previewClientSecretFromEnv(): string | undefined {
  const value =
    process.env.GROK_AUTH_CLIENT_SECRET?.trim() ||
    process.env.GROK_PREVIEW_CLIENT_SECRET?.trim() ||
    "";
  return value || undefined;
}

/** The shared auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/**
 * Host patterns whose callbacks the preview client accepts. Better Auth derives
 * the live preview's real origin from the request host and validates it against
 * this list (wildcard-matched), so the OAuth `redirect_uri` becomes the concrete
 * `https://<preview-host>/api/auth/oauth2/callback/...` the broker allows.
 */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;

/**
 * Host patterns for apps published via Cursor (`publish-app`). Email/password
 * POSTs send `Origin: https://<slug>.apps.grok.bot` — without these in
 * `trustedOrigins` / dynamic `baseURL.allowedHosts`, Better Auth returns
 * FORBIDDEN "Invalid origin".
 */
export const PUBLISHED_ALLOWED_HOSTS = ["*.apps.grok.bot"] as const;
