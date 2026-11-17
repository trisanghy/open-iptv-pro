# Supabase Cloud Sync — Open IPTV Pro Web

## Status
This integration is **prepared**, but will not activate until a Supabase project exists,
the SQL schema is applied, OAuth providers are configured, and public project
configuration is supplied. **Never** publish a service-role/secret key.

## Supabase project setup

1. Create or select a Supabase project.
2. Execute \`supabase/migrations/20261117_openiptv_user_state.sql\` in the SQL editor.
3. Enable Google and/or GitHub under Authentication > Providers. The OAuth
   provider callback is shown in Supabase; configure that URL in the Google /
   GitHub provider console. Never put their client secrets into GitHub Pages.
4. Under Authentication > URL Configuration:
   - Site URL: \`https://trisanghy.github.io/open-iptv-pro/\`
   - Additional Redirect URLs: \`https://trisanghy.github.io/open-iptv-pro/\`
5. Set these GitHub repository **Actions Variables** (not secrets) for
   \`trisanghy/open-iptv-pro\`:
   - \`SUPABASE_URL\` = \`https://<your-project-ref>.supabase.co\`
   - \`SUPABASE_PUBLISHABLE_KEY\` = \`sb_publishable_...\` (or legacy anon key)
6. Re-run the \`Publish Open IPTV Pro Web\` workflow. It builds
   \`cloud-config.json\` and bundles the Supabase browser SDK from npm.

For automatic setup from the repository (without adding GitHub Actions variables),
you may instead fill **only** public values in `web-online/cloud-deployment.json`.
The build uses those as defaults and variables take precedence. This file must
never contain the service-role key or OAuth client secret.

Only the project URL and *publishable* API key belong in website assets.
The GitHub Pages frontend has no trust boundary: RLS and SQL permissions
must be active *before* enabling the config.

## Behavior
- Guest mode: localStorage on the current browser, without sign-in.
- Auth: GitHub or Google OAuth / PKCE. OAuth provider permissions are
  limited to authentication, not GitHub repository access.
- First login: existing local data and cloud data are compared. User chooses
  which copy to use when needed; there is no silent destructive overwrite.
- Cloud: one JSON document for each authenticated user, with RLS, revision
  checking and debounce. Device snapshots are saved without images.
- Offline/network errors: local storage keeps working; cloud sync reports
  that a retry is needed.
- Sign out: the guest data backup is restored to avoid leaving the logged-in
  account's playlist visibly open on a shared browser.

## Limits / security
IPTV credentials or tokens embedded in M3U URLs are stored in the user's
Supabase JSON and are accessible to that user and project administrators.
Do not claim the data is end-to-end encrypted. Publishable keys are fine in
a client; never include service_role or OAuth client secret.

Supabase Free projects may pause for inactivity or hit quotas. For large
channel collections, the 2 MiB JSON payload limit fails explicitly instead
of silently truncating. Automatic sync is best effort, not guaranteed when
a tab closes abruptly; offer manual sync/restore as well.

## Fix: email links incorrectly redirect to localhost

This cannot be repaired by changing frontend JavaScript alone. In Supabase Dashboard > Authentication > URL Configuration, set **Site URL** to `https://trisanghy.github.io/open-iptv-pro/` and add the exact same URL under **Redirect URLs** (save changes). Ensure any customized Magic Link/Confirmation email template uses `{{ .ConfirmationURL }}` or `{{ .RedirectTo }}` appropriately; avoid hard-coded localhost.

**Temporary PKCE recovery:** if clicking an email link redirects to `http://localhost:3000/?code=...`, copy that full localhost URL from the address bar. Reopen Open IPTV Pro on the **same browser/profile** that requested the email, choose **Liên kết email không mở được?**, paste the localhost callback URL, and verify. This exchanges the one-time auth code using the local PKCE verifier. It does not work from another browser, after expiry, or when the code was already exchanged. Do not post callback codes or Supabase confirmation URLs publicly.
