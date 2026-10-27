# Release Check: October 27, 2026

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
