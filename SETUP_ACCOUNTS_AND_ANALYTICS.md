# Connect Accounts and Analytics

The landing page and recruiting tools work without these services. Real accounts, cross-device saves and Google Analytics need the owner's projects connected. Blank configuration intentionally does not pretend to sign users in or collect analytics.

## 1. Create Supabase

1. Create a project at https://supabase.com/dashboard. Keep the database password private.
2. Open the project's SQL Editor. Run the contents of `supabase/schema.sql` once. It creates the workspace table, per-user access policies and a version-checked save function.
3. In Authentication, enable email/password and email confirmation. Set a minimum password length of 12 characters. Keep confirmation enabled.
4. In Authentication > URL Configuration, set Site URL to:

   `https://raphael12345678910.github.io/VolleyReach/`

5. Add these exact Redirect URLs (include the query part):

   - `https://raphael12345678910.github.io/VolleyReach/?auth=callback`
   - `https://raphael12345678910.github.io/VolleyReach/?auth=recovery`

   For development only, add the matching local URLs for your actual preview port. Do not use a broad production wildcard.

6. Connect a custom SMTP sender in Supabase before inviting public email users. The built-in sender is restricted to project-team addresses and is not a public production email service. Confirm your sender/domain, use branded confirmation and reset emails, and disable the email provider's link tracking so it does not alter sign-in links. Secrets stay in the Supabase dashboard.
7. Enable appropriate sign-up abuse protection and rate limits in Supabase. Before a broad public launch, configure the provider's bot protections; the current form does not render a CAPTCHA challenge. Confirm the chosen protection works with your sign-up flow before enabling it.
8. Copy the Project URL and **publishable key** from the project's API settings. A legacy **anon** key also works. Never use a `service_role`, `sb_secret_`, database password or admin token in the website.

Official references: [email/password](https://supabase.com/docs/guides/auth/passwords), [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [production checklist](https://supabase.com/docs/guides/deployment/going-into-prod).

### Google Sign-In

1. Create a Web application OAuth client in Google Cloud / Google Auth Platform.
2. Configure your app's consent screen and basic `openid`, `email`, `profile` scopes only. This app does not ask for Gmail or mailbox access.
3. Use the callback URL supplied by Supabase as the authorized redirect URI in Google:

   `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`

4. Store the OAuth client ID and client secret in Supabase's Google provider settings, not in this repository or `VITE_` variables.
5. Test the whole round trip. Move the Google app out of testing restrictions when ready for public users.
6. Set `googleSignIn` to `true` only after the provider works.

[Official Google provider setup](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).

### Apple Sign-In (Optional)

Email/password and Google can launch without Apple. Apple web sign-in requires an Apple Developer account, an App ID, a Services ID, and a signing key configured in the Apple and Supabase dashboards. Use the Services ID first in the provider's Client IDs for web OAuth. Configure Apple's return URL as the Supabase callback above. Register the email sender for Apple's private relay if needed.

Keep the `.p8` signing key and generated client secret private, outside this repository. Apple's web OAuth secret needs renewal every six months; plan for that maintenance. Set `appleSignIn` to `true` only after testing with a real Apple account. Until then its button is visibly unavailable, not a fake login.

[Official Apple provider setup](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple).

## 2. Create Google Analytics

1. Open https://analytics.google.com/ and create a GA4 property for VolleyReach, then a Web data stream for `https://raphael12345678910.github.io/VolleyReach/`.
2. Copy the Measurement ID, which starts with `G-`.
3. **Turn off Enhanced Measurement for this stream.** VolleyReach explicitly sends its own safe events and virtual page views. Automatic form, site-search and outbound-link tracking could collect URLs/contact details and double-count actions.
4. Keep Google Signals, advertising personalization and user-provided data collection off. Do not add a second tag via Google Tag Manager or another snippet.
5. In Admin > Custom definitions, register the event-scoped dimensions you need: `action`, `route`, `destination`, `school_id`, `part`, `method`, `question`, `division`, and `region`.
6. Use Realtime to verify a consenting visit. Use Tag Assistant / GA DebugView to inspect events. Do not paste access tokens, profile data or email text into debug tools. Standard reports can take time to populate.

The app uses basic consent behavior: no Google tag before consent, no events after refusal, and no tracking in demo mode. Do Not Track / Global Privacy Control also disable tracking. Counts cannot include people who opt out, block scripts, lose their connection or never finish loading. Analytics is aggregate usage evidence, not proof a coach received an email or an athlete was recruited.

[Consent behavior](https://support.google.com/analytics/answer/10000067), [single-page app measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications), [avoiding personal information](https://support.google.com/analytics/answer/6366371).

### What Gets Counted

| Event | Meaning |
| --- | --- |
| `page_view` | A landing, account or recruiting screen was viewed. |
| `ui_click` | A button/link/control was clicked. Named controls have a stable `action`; unclassified controls use `other`. No displayed text or input values are scraped. |
| `navigation` | A workspace navigation command, with its destination. |
| `college_search` | A debounced search/filter change; result count and filters only, never search text. |
| `view_coach_contacts` | A program's contact section was expanded. |
| `coach_email_click` | A listed coach email link was opened. This does not mean an email was sent. |
| `email_copied` | Clipboard write succeeded, distinguished by `part`: `coach_address`, `full_email`, or `subject`. |
| `copy_failed` | The browser blocked a clipboard write. |
| `school_saved` | A new program was added to the athlete's outreach list. |
| `outreach_sent_logged` / `outreach_sent_undone` / `outreach_status_changed` | An athlete manually logs, undoes, or updates outreach. These are self-reported actions, not proof of email delivery. |
| `match_answer` / `match_complete` | A quiz filter was chosen / the last question was answered. |
| `profile_saved` / `profile_complete` | A successful local manual save / a user edit completed the required profile. |
| `auth_attempt` / `auth_error` | A sign-in, sign-up or recovery request / a failed request. |
| `sign_up_requested` | A registration response requested email confirmation, not proof of a verified account. |
| `sign_up` / `login` | Immediate confirmed sign-up / successful login or verified callback. For exact verified-user totals, check Supabase Authentication. |
| `password_reset_requested` / `password_updated` | A recovery request / successful password update. |
| `sign_out` | Local sign-out succeeded. |
| `jump_clip_uploaded` / `jump_result_saved` | A clip was selected / an estimate was added to the profile. No video or measurements are sent to Analytics. |
| `backup_downloaded` / `backup_restored` | Backup download started / restore was confirmed. |
| `browser_progress_imported` | A user explicitly replaced their account workspace with browser-only progress. |

Mark a small number of useful events as Key events, such as `profile_complete`, `school_saved`, `email_copied`, and `match_complete`. Count full-email copies separately from coach-address copies using `part`. Do not label copies as emails sent or recruiting outcomes.

## 3. Connect the Website

Choose one method:

- **Runtime public configuration:** fill `public/site-config.json` with the Measurement ID, Supabase URL and public key, and set only the enabled provider flags to `true`. Build and publish. All fields in this file are publicly visible, by design.
- **Local build:** copy `.env.example` to `.env.local` and fill its public `VITE_` values. Restart the local server, or run a new production build. Build-time values override `site-config.json`.
- **GitHub publishing workflow:** add repository Actions Variables named `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_GA_MEASUREMENT_ID`, `VITE_AUTH_GOOGLE`, and `VITE_AUTH_APPLE`. Set Settings > Pages > Source to GitHub Actions, then run **Publish website** under Actions. Public configuration values are not admin secrets. Provider secrets still belong only in Supabase.

Missing services degrade independently: recruiting remains usable, accounts are honestly unavailable, and no Analytics script loads without a valid ID and consent. No private credentials are included in this release.

## 4. Check Before Inviting Athletes

1. Register with a non-team email address. Receive and open the confirmation link in the same browser used to sign up. PKCE email links also need that browser's stored verifier; request a new link if you changed browsers.
2. Sign in, complete a few fields, and wait for **Saved to your account**. Sign in on another device and verify the fields appear.
3. Repeat with a second real account. Verify its profile starts blank and it cannot read the first account's database row. Review the RLS policies in the Supabase dashboard.
4. Sign out and verify the browser-only workspace stays separate. Browser-only data is imported only after a deliberate confirmation in My account.
5. Request a password reset, open the link in the requesting browser, and change the password. Check an expired/cancelled link too.
6. Test Google, and Apple only if enabled. Cancelling provider consent should return a useful sign-in message.
7. Disconnect the internet, edit a profile, reconnect and retry cloud saving. Test editing the same account from two devices: conflicts must offer a choice rather than silently overwriting.
8. Decline Analytics: no Google tag should load. Allow it: confirm safe events in Realtime. Withdraw consent: further events should stop. Demo visits must not count.
9. Confirm the privacy/terms wording accurately describes the final configured services, establish a contact channel for account-deletion requests, and have the owner review the disclosure before a wide launch. These pages are product disclosures, not a legal-compliance audit.

## Current Verification Limits

Automated tests exercise the official Supabase client against a controlled mock service, including credentials, confirmation states, PKCE redirects and reset callbacks, account separation, saving, retries, version conflicts and deletion. They do not validate a real SMTP sender, the owner's RLS deployment, provider credentials, deliverability, or Google's reporting pipeline. Complete the real-service checklist above after connecting the projects.

Supabase project owners can delete a user from Authentication, which cascades the cloud workspace deletion. The in-app delete action clears the workspace only; it does not claim to delete the Auth identity or copies on other devices. Keep production data access restricted to the owner.
