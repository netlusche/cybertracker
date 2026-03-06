# CyberTasker: Master Automated Test Plan v3.0.0

This plan outlines the end-to-end testing strategy for CyberTasker up through v3.0.0. The goal is to verify all functional requirements, multi-theming architecture, and OWASP-aligned security hardening using automated browser sessions and backend audits.

---

## 🔄 Test Lifecycle & Evolution [IMPORTANT]

**Before every major test execution run, the following audit must be performed:**
1. **Feature Gap Analysis**: Review the latest commits and the `USER STORIES.md` to identify any newly implemented functionalities.
2. **Suite Expansion**: All new features must have a corresponding test case (automated or manual) added to this Master Test Plan.
3. **Selector Audit**: Ensure new UI components use consistent `data-testid` attributes to maintain E2E stability.
4. **Linguistic Audit**: Review `manuals/TRANSLATION_GUIDELINES.md` to ensure any new terminology or thematic slang adopted in the UI has clear directives for translators.

*Testing is not a static event; the suite must evolve alongside the neural stream.*

---

## 🏗 Test Data Preparation

To execute the automated suites below effectively, the following isolated test data will be seeded programmatically via a standalone script (`tests/seed_test_data.php`):
- **User Personas**: Generate 1 Admin (`Admin_Alpha`), 5 Operatives with active 2FA (`Op_Beta`), and 100 baseline users for Admin pagination testing.
- **Directive Matrix**: Populate `Op_Beta` with 55 directives to trigger and test frontend pagination components.
- **Mail Capture Strategy**: Configure a mock SMTP endpoint (e.g., MailHog) or logging service to reliably capture and verify outbound token transmissions instantly.
- **Authenticator Seeds**: Pre-define valid TOTP secrets to programmatically assert validation code limits without manual authenticator input.
- **Automated Seeding**: The E2E suites assume these specific personas exist.

---

## 🛠 E2E Execution & Maintenance [STABILIZED]

To ensure reliable results and prevent regressions, follow these execution protocols:

### Execution Protocol
The E2E suite is designed for sequential execution to avoid SQLite database locking issues:
```bash
npx playwright test --workers=1
```
The system automatically handles environment startup via `start_local.sh`, managing both the PHP backend and Vite frontend.

### Stabilization Strategies (CI-Ready)
The suite has been hardened against "flakiness" using the following patterns:
1. **Durable Selectors**: Use `data-testid="modal-title"`, `data-testid="profile-btn"`, etc., instead of text-based regex to avoid localization or minor UI shifts breaking tests.
2. **Initialization Padding**: Login flows include explicit waits for `INITIALIZING SYSTEM...` to clear, ensuring React hydration is complete.
3. **Network Synchronization**: Critical actions use `page.waitForResponse` (e.g., verifying pagination) to align assertions with actual backend state.
4. **Environment Reset**: It is highly recommended to run the seed script before a full test pass to ensure a clean state:
   ```bash
   php api/seed_test_data.php
   ```

### 🛑 Anti-Flakiness Protocol (React State Synchronization) [CRITICAL]
When writing or modifying Playwright tests involving React Forms, **you MUST follow these synchronization rules to prevent CI 409 Conflict/Timeout errors:**
- **BAN implicit `press('Enter')`**: Never use `.press('Enter')` on input fields to submit forms. React is asynchronous; this causes overlapping synthetic events and duplicate backend submissions.
- **USE explicit clicks**: Always submit forms by explicitly locating and clicking the submit button:
  `await page.getByRole('button', { name: /Add|✓/i }).click();`
- **AWAIT State Clearing**: Immediately after clicking submit, wait for the form input to naturally clear. This proves the React state tree executed successfully and prevents race conditions for the next `fill()` action:
  `await expect(input).toHaveValue('');`
- **AWAIT Fetch Responses**: Never rely on tailwind class changes (`toHaveClass('bg-success')`) to verify that a state toggle (like an active filter pill) finished processing. Instead, wrap the click in a `Promise.all` waiting for the outgoing network request to resolve: `page.waitForResponse(res => res.url().includes('tasks'))`.

---

## 🧪 test-suite-01: Identity & Security Hardening

### TS-01.1: Registration & Initial Setup [AUTOMATED] (01-auth.spec.js)
- **Scenario**: Create a new operative account and verify database entry.
- **Validation**: User exists in DB; unique constraints (email/username) are enforced.

### TS-01.2: 2FA Activation (TOTP/Email)
- **Scenario**: Enable 2FA and verify secondary challenge on next login.
- **Validation**: Session is refused without the correct secondary token.

### TS-01.3: CSRF Shield Verification
- **Scenario**: Attempt a `POST` or `DELETE` request without the `X-CSRF-Token` header.
- **Validation**: Server returns `403 Forbidden` and terminates the request.

### TS-01.4: Brute-Force Mitigation (Rate Limiting)
- **Scenario**: Perform 5+ failed login attempts from the same IP.
- **Validation**: Server returns `429 Too Many Requests` and enforces a cooldown window.

### TS-01.5: Session Regeneration [AUTOMATED] (01-auth.spec.js)
- **Scenario**: Monitor `PHPSESSID` before and after successful login.
- **Validation**: Session ID is regenerated to prevent session fixation attacks.

### TS-01.6: Email Transmission Verification
- **Scenario**: Register an account, update email, and request Email 2FA.
- **Validation**: SMTP/Mail relay successfully dispatches the payload, and tokens contained are valid and time-restricted.

### TS-01.7: Real-world 2FA Validation
- **Scenario**: Setup TOTP using a standard authenticator seed, and setup Email 2FA receiving a real code.
- **Validation**: The system accurately validates authentic 6-digit codes and rejects invalid/expired ones.

### TS-01.8: Neural Purge (Account Deletion) [AUTOMATED] (06-extended-features.spec.js)
- **Scenario**: Initiate account deletion from the profile.
- **Validation**: All user data, directives, and categories are purged from the DB; session is terminated immediately.

---

## 📋 test-suite-02: Directive Management (CRUD)

### TS-02.1: Initialize & Edit Directive
- **Scenario**: Create a task, modify priority/category via badges, and edit title inline.
- **Validation**: DB reflects changes; UI triggers "Confetti" on completion.

### TS-02.2: Cyber-Triage Sorting
- **Scenario**: Verify that "Overdue" tasks always appear at the top of the stream.
- **Validation**: Sorting logic respects the Triage Protocol (Status > Urgency > Priority).

### TS-02.3: Stream Pagination [AUTOMATED] (02-directive-management.spec.js)
- **Scenario**: Populate the operative's timeline with 50+ directives.
- **Validation**: The stream is paginated, fetching records in tactical chunks without compromising UI responsiveness.

### TS-02.4: Protocol Orchestration (Category Management)
- **Scenario**: Add, rename, and delete custom categories in the profile.
- **Validation**: New categories appear in task creation; deleting a category correctly promotes tasks to the default category or deletes them based on user choice.

### TS-02.5: Dashboard Search & Filter Mechanics [AUTOMATED] (03-dashboard-filters.spec.js)
- **Scenario**: Use the global search bar, priority dropdown, category dropdown, and overdue toggle on the dashboard.
- **Validation**: 
  - Typing in the search bar dynamically filters the dashboard cards by title or description.
  - Selecting a category or priority hides non-matching cards immediately.
  - Toggling "Overdue Only" exclusively displays overdue items.
  - The "Reset" button clears all inputs and restores the default full view.

---

## 🎨 test-suite-03: Visual Architecture & Multi-Theming

### TS-03.1: Theme Switching & Isolation
- **Scenario**: Switch between "Cyberpunk", "LCARS", "Matrix", "Weyland-Yutani", "Klingon", "Westeros", "Comic", and "Gotham" in the profile.
- **Validation**: CSS variables and fonts update immediately (e.g., Wallpoet vs Antonio vs Courier). Contrast ratios remain compliant across all themes.

### TS-03.2: Theme Persistence [AUTOMATED] (03-theme-persistence.spec.js)
- **Scenario**: Set theme (e.g., "Matrix"), logout, and verify login screen aesthetics.
- **Validation**: Theme choice persists across sessions and is applied securely by pulling from the database API upon page load.

### TS-03.3: Linguistic Uplink (Language Switching) [AUTOMATED] (06-extended-features.spec.js)
- **Scenario**: Switch between DE, EN, NL, ES, FR, IT using the LanguageSwitcher.
- **Validation**: All UI strings, help manuals, and alerts update instantly to the target language without page reload.

### TS-03.4: Localization Completeness Check [AUTOMATED]
- **Scenario**: Run `npm run check-translations` from the command line.
- **Validation**: The internal python script parses `AuthController.php` to extract all allowed visual themes, asserting that each possesses a corresponding `theme_<id>` string in the English source. It then recursively traverses the English `translation.json` source-of-truth, ensuring every single key exists across all 18 other locale configurations. If any keys or theme descriptions are missing, the script halts with a precise index of missing identifiers.

---

## 🕵️‍♂️ test-suite-04: Fleet Administration

### TS-04.1: Neural Override (Admin Controls) [AUTOMATED] (05-security-policies.spec.js)
- **Scenario**: Admin resets a user's password or disables 2FA.
- **Validation**: Changes are applied instantly; user can recover access.

### TS-04.2: Roster Pagination [AUTOMATED] (04-admin-roster-pagination.spec.js)
- **Scenario**: Retrieve the `admin/users` grid populated with 100+ operatives.
- **Validation**: The grid accurately displays page controls, total records, and navigates seamlessly using the DataGrid component without freezing the dashboard.

### TS-04.3: Policy Enforcement (Strict Password) [AUTOMATED] (05-security-policies.spec.js)
- **Scenario**: Admin toggles "Strict Password Policy" in the settings.
- **Validation**: 
  - **New Operatives**: Registration requires a strong password (mixed case, numbers, symbols). Simple passwords are rejected.
  - **Legacy Support**: Pre-existing users with simple passwords can still establish a neural link (login).
  - **Admin Override**: Administrators can still manually set any password for operatives via the roster, bypassing the strict policy constraints.

---

## 📈 test-suite-05: Gamification & Training

### TS-05.1: XP Synthesis & Leveling
- **Scenario**: Complete multiple directives and monitor the neural progress bar.
- **Validation**: XP increases correctly per task; "LEVEL UP" notification triggers at thresholds with tactical sound/visual feedback.

### TS-05.2: Neural Manual (System Help)
- **Scenario**: Access the help modal and navigate sections.
- **Validation**: Manual is fully localized and explains system mechanics (XP, Priorities, Filtering) in a thematic style.

---

## 🚀 test-suite-06: Installation & Zero-Config Portability

### TS-06.1: Security Auto-Lock
- **Scenario**: Access `api/install.php` when the system is already initialized.
- **Validation**: Access is denied unless a valid Admin session is active.

### TS-06.2: Subdirectory Compatibility
- **Scenario**: Install system in a subdirectory and verify verification links.
- **Validation**: `FRONTEND_URL` dynamically detects the path and includes it in links.

### TS-06.3: Diagnostic Integrity
- **Scenario**: Run `install.php` and verify diagnostic output.
- **Validation**: Checks for PHP version, PDO drivers, and database writeability (特に macOS `tmp` redirection).

### TS-06.4: Cross-Database Compatibility [MANUAL]
- **Scenario**: Configure the backend to sequentially run on SQLite, MariaDB, and MySQL. Initialize Deep Directives with JSON file attachments on each.
- **Validation**:
  - The `attachments` and `description` fields reliably parse and store data on all engines.
  - No database-specific syntax errors occur during connection, pagination, or insertion.

### TS-06.5: Subdomain & Shared Hosting Routing [MANUAL]
- **Scenario**: Deploy the production build to a strict shared hosting environment (e.g., STRATO Hosting Plus) within both a Subdomain and a Subdirectory.
- **Validation**:
  - The `FRONTEND_URL` securely maps CORS headers without path distortion.
  - HTTPS proxy headers are correctly decoded to permit 2FA and registration secure cookies.

---

## 📁 test-suite-07: Deep Directives (Operative Dossier)

### TS-07.1: Rich-Text Markdown Parsing [AUTOMATED] (07-deep-directives.spec.js)
- **Scenario**: Open an active directive and inject protocol description using Markdown (Headers, Bold, Lists).
- **Validation**: The parser securely renders HTML tags without XSS vulnerabilities, applying the active theme's typography rules.

### TS-07.2: Secure Up-Links [AUTOMATED] (07-deep-directives.spec.js)
- **Scenario**: Embed external HTTPS URLs into the protocol description.
- **Validation**: URLs are parsed into clickable anchor tags with `target="_blank"` protecting the operational sandbox.

### TS-07.3: Encrypted Asset Uploads [MANUAL]
- **Scenario**: Drag-and-drop or select image/document files to attach them to a specific directive.
- **Validation**:
  - Files are processed securely via Multer/PHP backend as `multipart/form-data`.
  - Filenames are sanitized and hashed.
  - The UI accurately renders previews for images and generic icons for documents.

### TS-07.4: Asset Purging [MANUAL]
- **Scenario**: Delete an attached file from a directive via the frontend interface.
- **Validation**: The file is completely wiped from the local `uploads/` volume and the JSON array in the database is synchronized.

---

Every execution run generates a `test_report.md` tracking pass/fail rates, backend logs, and browser recordings as proof of work.

---

## 📅 test-suite-08: Release 2.2 Features

### TS-08.1: Dashboard Limit Adjustment [AUTOMATED]
- **Scenario**: Validate pagination sizes on the global stream.
- **Validation**: Ensure that exactly 25 items are rendered per page per `US-2.2.1`.

### TS-08.2: Password Confirmation Protection [MANUAL]
- **Scenario**: Attempt to reset a password or update the cypher inside the profile with a heavily mismatched confirmation string.
- **Validation**: The system blocks the API transmission and visually flags the fields with pink/red neon borders.

### TS-08.3: Chrono-Sync Calendar Operability [MANUAL]
- **Scenario**: Open the CALENDAR module via the main header and click on an active directive mapped to a date.
- **Validation**: 
  - Calendar successfully isolates tasks with a valid `due_date`.
  - Clicking on a task safely unmounts the calendar view, spawning the Directive Dossier overlay.
  - Closing the dossier auto-restores the Calendar state cleanly.

### TS-08.4: Dossier Formatting Checks [AUTOMATED]
- **Scenario**: Edit the Dossier Title inline, and write `# Header 1` and `## Header 2` in the Protocol descriptions.
- **Validation**: Titles securely update via API immediately, and headers are styled consistently with the local cyber-theme layout without overflowing containers. (Includes checks for headers without spaces like `#Überschrift`).

### TS-08.5: Dossier Field Editing (Dropdowns) [MANUAL]
- **Scenario**: Open the Directive Dossier and modify the `due_date`, `priority`, and `category`.
- **Validation**: 
  - Priority and Category open customized `CyberSelect` dropdown menus with options matching the environment.
  - Priority and Due Date trigger the highest `z-index` `CyberConfirm` modals, blocking background interaction until validated.
  - Category changes update instantly. All field changes persist out to the main dashboard reliably without needing a hard refresh.

---

## 📅 test-suite-09: Release 2.3 Features

### TS-09.1: Cross-Database Pipeline Verification [AUTOMATED]
- **Scenario**: Validate the health of the application against standard `cybertracker.db` SQLite instances AND `mysql/mariadb` environments.
- **Validation**: GitHub Actions `.github/workflows/e2e-tests.yml` successfully completes the test suite parallel on both database engines with zero syntax errors.

### TS-09.2: Sub-Routine Creation & Inline Editing [AUTOMATED] (02-directive-management.spec.js)
- **Scenario**: Add sub-routines to a newly created directive in the dossier. Modify the text of one sub-routine inline. Toggle their state.
- **Validation**:
  - Sub-routines can be added, deleted, and text can be modified inline by clicking without reloading.
  - Toggling sub-routines instantly updates their `completed` state in the database.

### TS-09.3: Dashboard Task Progress Indication [MANUAL/AUTOMATED]
- **Scenario**: Create a directive with 3 sub-routines, close the dossier, and check the dashboard card.
- **Validation**:
  - The dashboard card displays "0/3" (or appropriate progress) if sub-routines exist.
  - Completing sub-routines updates this real-time to "1/3", "2/3", up to "3/3".
  - If no sub-routines exist, the progress badge is completely hidden.

### TS-09.4: Scheduled Protocols [AUTOMATED] (02-directive-management.spec.js)
- **Scenario**: Assign a `recurrence_interval` (Daily/Weekly/Monthly) and optionally an end date to an active protocol. Complete the protocol.
- **Validation**:
  - Upon marking as "Done", exactly ONE new open task is spawned for the next interval.
  - Due dates are correctly computed recursively by PHP.
  - If the new generated date surpasses the `recurrence_end_date`, the chain terminates harmlessly.
  - The Global Calendar successfully projects "Holo-Projections" for these tasks in the future without clogging the DB.

### TS-09.5: Installer Schema Verification [MANUAL]
- **Scenario**: Trigger the `api/install.php` routine on an existing v2.2 legacy SQLite database.
- **Validation**: 
  - The script accurately patches the `tasks` table with the new `subroutines`, `recurrence_interval`, and `recurrence_end_date` columns seamlessly.

---

## 📅 test-suite-10: Release 2.4 Features

### TS-10.1: Sub-Routine Drag & Drop Sorting [AUTOMATED] (09-release-2-4-features.spec.js)
- **Scenario**: Create a directive with three sub-routines (A, B, C). Drag and drop sub-routine C to the first position. Close the dossier and reload.
- **Validation**:
  - The list renders as C, A, B accurately.
  - The new sort order is successfully persisted to the backend upon dropping.

### TS-10.2: Dashboard Category Dropdown [AUTOMATED] (09-release-2-4-features.spec.js)
- **Scenario**: Click the category badge on a directive card on the dashboard. Select a new category.
- **Validation**:
  - The `CyberSelect` overlay renders natively within the constraints of the active theme.
  - The localized dropdown options are correctly displayed.
  - Assigning a category instantly updates the database and reflects visually on the badge.

### TS-10.3: Neural Shortcuts Validation [AUTOMATED] (09-release-2-4-features.spec.js)
- **Scenario**: Trigger the `N` key from the dashboard, then hit `Esc`. Finally, press `/`.
- **Validation**:
  - Pressing `N` opens the *New Directive* modal gracefully.
  - Pressing `Esc` immediately unmounts any active overlay or modal without issue.
  - Pressing `/` shifts focus directly into the global search input.

### TS-10.4: Directive Duplication Protocol [AUTOMATED] (09-release-2-4-features.spec.js)
- **Scenario**: Open an existing Directive Dossier that contains text and a specific category. Click the duplication protocol icon.
- **Validation**:
  - The creation modal invokes immediately.
  - The title and category fields are deeply copied and pre-populated accurately from the source dossier.

### TS-10.5: Quick-Filter Pills Execution [AUTOMATED] (09-release-2-4-features.spec.js)
- **Scenario**: Navigate to the dashboard header and hover over the filter pills. Click to activate filtering.
- **Validation**:
  - The UI accurately renders interactive localized filter pills alongside the search bar, wrapping dynamically on mobile.
  - Hovering displays instantaneous descriptive tooltips.
  - Clicking a pill aggressively filters the underlying `DataGrid` (e.g., hiding non-overdue data). Re-clicking dismantles the filter.

### TS-10.6: Pre-Release Translation Diagnostics [AUTOMATED] (e2e-tests.yml)
- **Scenario**: Trigger the GitHub Actions CI pipeline or run `scripts/check_translations.py` manually before a release.
- **Validation**:
  - The script scans the monolithic translation dictionaries (`translation.json`) across all 20+ locales.
  - Validates full thematic compliance and missing keys, failing the CI action immediately if anomalies exist.
  - Asserts that `fallbackLng` actively enforces English `en`.

### TS-10.7: Calendar Holo-Projection Limits [AUTOMATED] (10-calendar-projections.spec.js)
- **Scenario**: Create a daily recurring task without an end date, and another with an explicit end date 200 days in the future. Evaluate the Calendar JSON API payload.
- **Validation**:
  - Validates that daily tasks without end dates generate exactly 60 projections.
  - Validates that setting an extended end date successfully generates up to 365 projections instead of capping at the default limit.

---

## 📅 test-suite-11: Release 2.5 Features

### TS-11.1: Localized XP Progress Box [MANUAL]
- **Scenario**: Switch the system language (e.g., to German) and observe the XP progress box on the dashboard.
- **Validation**: All texts (Level, XP to next level) translate correctly without breaking the layout, even with longer text strings.

### TS-11.2: Admin Panel Version Display [MANUAL]
- **Scenario**: Log in as an administrator and navigate to the Admin Panel.
- **Validation**: The current system version ("CyberTracker vX.X.X") is visibly rendered at the bottom of the console.

### TS-11.3: CI/CD Pipeline Checks [AUTOMATED]
- **Scenario**: Run the localization checker script and the theme linter locally with intentional errors (missing keys or hardcoded `#000` colors).
- **Validation**:
  - The i18n script throws an error/warning for missing keys.
  - The theme script triggers a warning for forbidden static color codes instead of CSS variables.

### TS-11.4: UI Themes & Guidelines [MANUAL]
- **Scenario**: Cycle through the 4 new themes (Computerwelt, Mensch-Maschine, Neon Syndicate, Megacorp Executive) and check the "System Help" modal.
- **Validation**:
  - Themes render cleanly with consistent colors and readable text (especially the Light Mode "Megacorp Executive").
  - The "System Help" accurately lists and describes the new themes in the current localized language.

### TS-11.5: Critical Auth E2E Operations [AUTOMATED] (11-advanced-auth.spec.js)
- **Scenario**: Execute the comprehensive Auth E2E suite covering login flows, 2FA activation, and simulated email updates.
- **Validation**: Playwright successfully passes all critical authentication pathways without regression.

### TS-11.6: Setup Email Requirement [MANUAL]
- **Scenario**: Run the installer `install.php` on a fresh SQLite database and attempt to create the master account with an empty/invalid email.
- **Validation**: The backend rejects the initialization and blocks completion until a valid email is provided.

### TS-11.7: Enforced Email 2FA Policy [AUTOMATED] (05-security-policies.spec.js)
- **Scenario**: Enable "Enforce Email 2FA" in the Admin Panel. Log in with a fresh user without an authenticator app.
- **Validation**:
  - A contextual warning banner appears above the OTP input field during login.
  - The session is halted until the 6-digit email code is entered.

### TS-11.8: Gamification Logic & UX [AUTOMATED] (14-gamification.spec.js)
- **Scenario**: Execute the Gamification E2E suite to validate math logic and UI rendering.
- **Validation**:
  - The `calculateBadge(level)` logic correctly outputs tier/title arrays matching levels 1-99 boundaries.
  - The translated cyber-badge (e.g., "Veteran Netrunner") is visibly rendered above the XP bar on the dashboard and reacts to language swaps.

---

## 📅 test-suite-12: Release 2.6 Features

### TS-12.1: Multilingual Tooltips Verification [AUTOMATED] (15-tooltips.spec.js)
- **Scenario**: Navigate through the Auth Screen, Dashboard, and Profile Modal while listening for localized tooltip rendering.
- **Validation**:
  - Validates that UI components securely embed their contextual help directly within `data-tooltip-content`.
  - Validates CSS positioning logic (`data-tooltip-pos: left|right|bottom`) avoids viewport overflow.

### TS-12.2: Keyboard Accessibility & Tab Navigation [MANUAL]
- **Scenario**: Navigate the application using exclusively the `Tab` and `Shift+Tab` keys, interacting with Modals and forms.
- **Validation**:
  - Focus indicator (`:focus-visible`) highlights the active element clearly using the theme primary colors.
  - While navigating inside any active Modal (e.g., Profile, System Help), focus traps loop back to the first interactive element when reaching the end, preventing focus from escaping to the background overlay.
  - Toggle buttons and custom select components remain inherently reachable via keyboard.

### TS-12.3: Automated Release Pipeline [MANUAL]
- **Scenario**: Execute the interactive release script (`./scripts/release.sh`) with an intentional test failure.
- **Validation**:
  - The script asserts valid translation completeness (`npm run check-translations`) and theme coherence.
  - E2E Playwright tests act as a strict pass/fail gatekeeper.

### TS-12.5: Database-Synchronized Localization [AUTOMATED]
- **Scenario**: A user explicitly selects "French (FR)" via the language switcher, logging out, and then a second user with a different language profile (e.g. "Dutch (NL)") logs in on the exact same browser/device.
- **Validation**:
  - The UI language forcefully and immediately snaps to the authenticating user's specific database language preference (NL), overwriting the previous session's `localStorage` state (FR).
  - Page refreshes via `api/index.php?route=auth/me` perfectly retain the database language state, preventing fallback drift.
### TS-12.4: Multilingual Installer & System Emails Check [MANUAL]
- **Scenario**: Boot `install.php` on a fresh system. Change the language selector (e.g., to French) and create the Admin account. Request a password reset for that Admin.
- **Validation**:
  - The installer UI translates instantly to French.
  - The resulting automated System Email containing the recovery Override Code is completely localized in French.

### TS-12.6: Secure Session Link Localization [MANUAL]
- **Scenario**: Register a new user with a specific non-default language (e.g. Klingon `tlh`) or request a password reset for that user. Open the resulting email link in a completely fresh incognito session.
- **Validation**:
  - The email transmission explicitly includes the `&lang=tlh` parameter in the generated URL.
  - The static `verify.html` and `reset-password.html` endpoints detect the `lang` parameter and successfully translate all text to Klingon, completely bypassing any default `localStorage` `en` fallbacks.

### TS-12.7: System Email Accessibility Contrast [MANUAL]
- **Scenario**: Trigger an Identity Verification or Password Reset transmission and view the email in standard Light and Dark email client themes (e.g. Apple Mail, Gmail).
- **Validation**: 
  - The action links (Verification/Reset) use the `#0088cc` cyan-blue color code.
  - The text remains distinctly legible and compliant with WCAG contrast ratios against both bright white and dark charcoal message backgrounds.

### TS-12.8: Forced Session Invalidation on Password Change [AUTOMATED]
- **Scenario**: An active operative accesses their profile and successfully executes the Cypher Update protocol (Password Change).
- **Validation**:
  - All current session cookies for this operative are immediately terminated server-side.
  - The active client is forcefully logged out and redirected to the `/login` screen to re-authenticate using the newly established access key.

### TS-12.9: Installer Custom Admin Provisioning [AUTOMATED] (00-installer.spec.js)
- **Scenario**: Boot `install.html` on a completely uninitialized grid and provision a non-default master admin account.
- **Validation**:
  - The script executes the entire form sequence and receives the "System Initialized Successfully" message.
  - The database is accurately populated with the custom username, overriding default legacy credentials.

### TS-12.10: Privilege Escalation Protection [AUTOMATED] (00-installer.spec.js)
- **Scenario**: Attempt to reload and submit the `/install.html` POST request after the grid has already been initialized by `TS-12.9`.
- **Validation**:
  - The backend explicitly rejects the POST payload with a 403 Forbidden state, completely blocking the creation of unlimited master admin accounts.
  - The frontend catches this strict rejection and displays "ACCESS DENIED: SYSTEM ALREADY INITIALIZED." to the rogue operative.

### TS-12.9: Installer Custom Admin Provisioning [AUTOMATED] (00-installer.spec.js)
- **Scenario**: Boot `install.html` on a fresh system. Fill in the desired Codename, Email, and Access Key.
- **Validation**:
  - The UI securely submits the custom attributes to the backend installer.
  - The API initializes the `users` table with the requested Codename (e.g., `CyberBoss`) acting as the Master Administrator, thereby eliminating exposure from legacy default identities.

## 📅 test-suite-17: Release 2.8 Features

### TS-17.1: Default Category Seed [AUTOMATED]
- **Scenario**: Run `install.php` or `seed_test_data.php`.
- **Validation**: Generated users and initial directives successfully belong to the automatically created "Work" category or random subsets as defined.

### TS-17.2: Custom Task Statuses [MANUAL]
- **Scenario**: Open the Profile Modal, navigate to "Task Statuses", and create a new status called "QA". Assign this status to a directive on the dashboard.
- **Validation**: 
  - Status is saved and persists after reload.
  - Applying the status to a task updates the UI badge without overriding the main "Completed" binary state erroneously.

### TS-17.3: Agent Focus Mode [AUTOMATED]
- **Scenario**: Toggle the `FOCUS` button in the main header.
- **Validation**:
  - The UI strips away secondary elements and displays only the Hero Card with the most urgent task.
  - Completing or skipping the task correctly loads the next priority item.

### TS-17.4: Batch Actions [MANUAL]
- **Scenario**: Select multiple tasks via checkboxes on the dashboard. Click "Complete All" in the Command Bar.
- **Validation**:
  - The Command Bar accurately displays the count of selected directives.
  - The bulk completion successfully updates all selected tasks in the database and clears them from the active view.

### TS-17.5: WebCal Sync Validation [MANUAL]
- **Scenario**: Generate a WebCal Comlink in the Profile Modal and copy the URL. Fetch the URL directly.
- **Validation**:
  - The `calendar_token` is generated securely.
  - The API endpoint returns a perfectly formatted `text/calendar` iCal stream containing the operative's active directives.

---

## 📅 test-suite-18: Release 2.9 & 3.0.0 Features

### TS-18.1: Kanban Mode Activation & Rendering [AUTOMATED] (20-kanban-board.spec.js)
- **Scenario**: Click the KANBAN toggle in the dashboard header.
- **Validation**:
  - Main directive input and list view disappear.
  - Kanban board overlay mounts gracefully with horizontal scrolling.
  - Dynamic columns are generated based on the user's custom task statuses (Default: OPEN, COMPLETED + Custom).
  - Empty columns display the "DROP DIRECTIVES HERE" structural placeholder.

### TS-18.2: Kanban Drag & Drop Execution [AUTOMATED]
- **Scenario**: Drag an active directive from the OPEN column into a custom status column, and then into the COMPLETED column.
- **Validation**: 
  - Dropping on a custom status explicitly updates `workflow_status` while keeping the main `status` active (0).
  - Dropping on COMPLETED explicitly resolves the task (`status` 1) and visually degrades it to grayscale.

### TS-18.3: Mobile Touch Drag & Drop Constraints [MANUAL]
- **Scenario**: Emulate a Smartphone/Tablet on the Kanban board (Release 3.0.0 Touch DND patch).
- **Validation**:
  - Swiping left/right horizontally scrolls the column container natively without activating card dragging.
  - Pressing and holding a card for `250ms` firmly attaches it to the finger, applying `.touch-none` CSS properties, and allows dragging to adjacent columns without camera panning interference.
