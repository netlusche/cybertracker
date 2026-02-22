# CyberTasker: Master Automated Test Plan v2.1.0

This plan outlines the end-to-end testing strategy for CyberTasker v2.1.0. The goal is to verify all functional requirements, multi-theming architecture, and OWASP-aligned security hardening using automated browser sessions and backend audits.

---

## 🔄 Test Lifecycle & Evolution [IMPORTANT]

**Before every major test execution run, the following audit must be performed:**
1. **Feature Gap Analysis**: Review the latest commits and the `USER STORIES.md` to identify any newly implemented functionalities.
2. **Suite Expansion**: All new features must have a corresponding test case (automated or manual) added to this Master Test Plan.
3. **Selector Audit**: Ensure new UI components use consistent `data-testid` attributes to maintain E2E stability.

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
