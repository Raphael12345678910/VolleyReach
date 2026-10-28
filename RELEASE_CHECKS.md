# Release Check: October 28, 2026

## Added

- An original, responsive VolleyReach landing page using the project's own volleyball imagery and brand. Root links open the landing page; existing recruiting deep links still work.
- Supabase email/password sign-up, confirmation, sign-in, password recovery, and configurable Google/Apple OAuth using PKCE.
- Separate storage for each account, browser-only visitors, and demo athletes. Browser progress is imported only after explicit confirmation. Demo pages cannot perform real account actions.
- Private cloud workspace schema with row-level security and version-checked saves, plus recovery for interrupted/offline saves, concurrent device edits, and blocked recovery-checkpoint writes.
- Truthful local/cloud save states, backup/restore, account sign-out and confirmed workspace deletion.
- Consent-gated Google Analytics with allowlisted event data for page views, controls, searches, contact views, email copies, saved schools, profile milestones and authentication actions. No profile values, generated email text, raw search strings, passwords or auth codes are sent by the instrumentation.
- Demo activity, declined consent, Global Privacy Control and Do Not Track are excluded. Cookie settings are accessible from both the landing page and workspace.
- Coach-address copy controls and tracking that distinguishes successful clipboard writes, failures and manually logged outreach.
- Privacy/terms disclosures, a service-activation guide, optional GitHub publishing workflow and build-time rejection of non-public Supabase keys.

## Verification Scope

The suite now contains 13 unit checks and 126 browser workflow checks across desktop Chrome, phone-sized Chrome and phone-sized WebKit. It covers the previous recruiting workflows as well as account separation, password reset callbacks, provider redirects, cloud-save recovery and privacy choices. Production builds, responsive screenshots and the dependency audit are also checked. GitHub Actions runs the final source; its run is the release verification record.

The account tests use the official Supabase client against a controlled mock service. No real provider account, SMTP sender, deployed database policy or Analytics reporting property has been configured for this release. See `SETUP_ACCOUNTS_AND_ANALYTICS.md` for activation and real-service acceptance checks. A passing test suite is not a promise of zero possible bugs or a legal/security certification.

## Activation and Remaining Limits

- Public configuration is blank. Analytics does not collect data yet, and real accounts are visibly unavailable. Browser-only recruiting and saving continue to work.
- Account activation needs a Supabase project, the supplied SQL schema, correct redirect URLs, email confirmation and a production SMTP sender. Google/Apple require their provider setup; Apple also requires ongoing web-secret renewal.
- Live row-level isolation, external email delivery, OAuth consent and GA reporting must be verified after those services are connected.
- Declined consent, browser privacy signals, ad blockers and connection failures mean Analytics cannot count every visitor or action.
- Contact freshness, matching limitations and unvalidated single-view jump estimates remain as described below. Accounts do not make video estimates more accurate or turn school filters into recruiting predictions.

## Previous Release: October 27, 2026

The following records the earlier browser-only release and its then-current limitations.

## Fixed

- Shared links and older profile schema markers no longer clear returning visitors' progress.
- Profile edits save synchronously, receive updates from other tabs, and tolerate malformed stored values.
- Fast startup navigation and second-tab updates are rechecked after event subscriptions; unsaved form data is retained if browser storage is unavailable.
- Demo profiles, school lists, quiz answers and email notes are isolated from the normal workspace.
- Storage failures are visible; a failed write never produces a successful manual save confirmation.
- Downloadable progress backups can be restored after a confirmation, including on another browser or device.
- Required profile fields validate email addresses, graduation years, GPA, measurements and highlight URLs before unlocking the email builder.
- Athlete email, phone, standing reach and jersey number appear in recruiting emails. Saved schedule edits flow into the draft.
- The college directory has pagination, a usable empty-search state, and error recovery.
- Future follow-ups are not counted as overdue. Undoing a newly logged email restores its previous count, date and status.
- The home photograph uses the correct GitHub Pages base path.
- Typography, form controls, phone layout, keyboard navigation, and tablet header spacing are improved.
- Uploaded-video seeking no longer crashes on deferred video events.
- Jump examples cannot be stored as a real athlete result. Recording conditions must be confirmed before saving.
- Calibration handles reversed reference endpoints, critical perspective/setup risks lower the score, and trial summaries preserve the relationship between vertical, standing reach and touch height.
- Fine adjustments move markers by one original video pixel. Calibration changes invalidate older trials.
- Build dependencies are patched, and repeatable tests are included.

## Verification Scope

Release results: 11 unit checks passed, 57 browser workflow checks passed, and the dependency audit reported zero known vulnerabilities.

The production build is exercised with unit tests and Playwright workflows in desktop Chrome, phone-sized Chrome and phone-sized WebKit (Safari's engine). Layouts are inspected at 320, 390, 768, 1024 and 1440 pixels. Browser tests listen for application JavaScript errors. Uploaded-video tests use a known decoding fixture and synthetic marker coordinates.

The dependency audit checks known package advisories. This is a release check, not a claim that every possible browser or future input is bug-free.

## Remaining Product Limits

- Progress is local to the browser. Backups provide a manual transfer/recovery method; email accounts and cloud synchronization are not enabled.
- Directory contacts come from the provided sheet and have not all been independently reverified against current college websites.
- School matching filters the directory; it does not predict admissions, roster vacancies or scholarship offers.
- Video measurements are estimates. Field accuracy has not been established against a Vertec or jump mat, and true 3D depth cannot be recovered from the current single-view setup.
- Video compatibility depends on the browser's decoder; the app explains when a clip cannot be played.
