# Changelog

All notable changes to this project will be documented in this file. The format is based on the system's aesthetic release history.

# CyberTasker 2.7.0 (The AI Localization Update)

### 🌍 Global Deep-Translation Engine
*   **AI-Driven Localization**: Integrated a robust translation pipeline (`scripts/translate_ai.js`) powered by the Gemini API, enabling fully context-aware, thematic translations across all 23 supported languages simultaneously.
*   **Automated Fallback Protocols**: The translation engine automatically degrades gracefully to a standard Google Translate API proxy if the primary AI link is severed or rate-limited, ensuring zero downtime in continuous integration.
*   **Incremental CI/CD Sync**: The localization engine now strictly operates in "Delta Mode" automatically, scanning only for missing translation keys to preserve manual overrides (like Klingon grammar) and minimize API token consumption.

### ✨ Tactile UI Polish
*   **Unified Filter Reset**: Consolidated redundant filter reset controls on the Operative Dashboard into a single, globally responsive "RESET" button to streamline internationalization and reduce cognitive load.
*   **Alert Box Clarity**: Re-localized all internal `CyberConfirm` dialog prompts to universally use clear, unambiguous "Confirm" language rather than stylized jargon, preventing operational confusion in critical destructive actions.

---

# CyberTasker 2.6.1 (The Admin & QoL Polish)
### 🕵️‍♂️ Flotten-Administration 
*   **Database Maintenance**: Administrators can now physically purge "Ghost Accounts" (unverified > 14 days) and "Inactive Accounts" (no login > 1, 2, 5, 10, or 11 years) directly from the Administration Console.
*   **UX Consistency**: Deletion confirmations inside the Admin Panel now strictly use the standardized `CyberConfirm` themed modal.
*   **Translation Pipeline Integration**: The Admin panel backend now returns proper i18n keys instead of hardcoded strings for errors like "Cannot demote last admin".

### ✨ Quality of Life
*   **Dossier Indicator**: Task cards now display a `📎` Paperclip indicator if the directive contains uploaded file attachments.
*   **Dashboard Bulk Delete**: Operatives can now instantly erase all completed tasks from their active grid via a single "Purge Completed" button in the filter dashboard.
*   **Completed Filter Pill**: Added a new quick-filter pill alongside "High Prio" that natively isolates and displays all completed directives.

---

# CyberTasker 2.6.0 (The Accessibility & Automation Update)

### ♿ Accessibility & Mobile Fluidity
*   **Touch-Native Sub-Routines**: Migrated Dossier sorting to `@dnd-kit`, fully unlocking fluid drag-and-drop prioritization on iOS and Android viewports.
*   **Global Tooltips**: Injected localized, low-latency tooltips across the entire grid to guide new operatives seamlessly.
*   **Keyboard Navigation Matrix**: All interactive components now feature highly visible focus outlines, and all overlay modals strictly trap focus for flawless `Tab` key iteration.

### 🛡 Core Security & Installation
*   **Custom Master-Admin Provisioning**: Administrators can now define their specific Codename and Access Key directly during the zero-config initialization phase.
*   **Privilege Escalation Protection**: The backend Installer strictly verifies database state and actively blocks any secondary initialization attempts, preventing host-level takeovers.

### 🌍 Global Deep-Integration
*   **Multilingual Installer**: The initial system bootstrap now allows Administrators to select their operational language before provisioning the system, setting the default localized baseline.
*   **Database-Level Localization**: All dynamically generated database strings (default categories, introductory directives) are now strictly injected in the Administrator's chosen setup language.
*   **Localized Comm-Links**: All external system transmissions (Verification, Recovery, 2FA Override) are now fully translated into the operative's specific language vector.

### ⚙️ Automation & Pipeline Refinements
*   **Automated Release Deployment**: Integrated a single-command Bash pipeline (`scripts/release.sh`) to execute validation suites, linting, document generation, and Git-tagging automatically.
*   **Translation Guidelines Engine**: Forbade overly formal wording ("Löschen Sie") in `TRANSLATION_GUIDELINES.md` to guide localized grammar, and laid the groundwork for future AI-driven API translations in Release 2.7.

### 🩹 Critical Fixes & QA
*   **Tooltip Conflict Resolution**: Fixed a CSS stacking/transform conflict preventing tooltips from rendering on heavily styled buttons (e.g., the "Add" button and Filter "Reset" button).
*   **CI E2E Stability**: Forced the E2E internal mailer mock to invariably return `true` within the `cli-server` environment. This entirely stops random GitHub Actions pipeline failures caused by missing Mail Transfer Agents (MTAs) and ensures the 2FA inputs reliably trigger during tests.

---

# CyberTasker 2.5.1 (The Security & Gamification Update)

### 🛡 Enforced Security & Installation
*   **Enforce Email 2FA Policy**: Administrators can now flip the system-wide "Enforce Email 2FA" switch. If active, any operative without an Authenticator App will be forced to use an Emergency Override Code sent to their registered email before accessing the grid. Banners proactively warn operatives in their profile and during the login flow.
*   **Deep Installation Security**: The zero-configuration installer now strictly requires a valid email address when provisioning the Master Admin account, guaranteeing an open comm-link for 2FA and recovery protocols.

### 🏆 Gamification & Visuals
*   **Scalable Gamification Matrix**: Replaced the static level system with an infinitely scalable "Cyber-Badge" matrix. Operatives now earn progressive Tiers (`Novice` to `Prime`) and Titles (`Script Kiddie` to `Singularity`) as they gain XP and level up. Badges are fully translated into all 7 supported languages.
*   **Four New Visual Matrices**: Added highly stylized retro and corporate themes: **Computerwelt** (Matte Black & Neon Green), **Mensch-Maschine** (High-Contrast Crimson), **Neon Syndicate** (Synthwave), and **Megacorp Executive** (Orbital White & Ice Blue).

### ⚙️ Quality of Life & Assurance
*   **Password Visibility**: Implemented a password visibility toggle (Eye Icon) natively within the operative Profile and Auth screens. 
*   **Automated Quality Assurance**: Deployed Python-based translation validation (`check_translations.py`) and JS-based CSS-variable linting (`check-theme.js`) to the GitHub Actions CI pipeline to permanently eliminate missing translations and hardcoded "theme bleeding".
*   **Version Transparency**: The Administration Console now clearly displays the active system version at the bottom.

---

# CyberTasker 2.4.1 (Completed Tasks Hotfix)

*   **Dashboard Visibility Patch**: Fixed a critical backend filtering bug within the SQLite and MySQL repositories that unintentionally wiped all completed tasks (`status = 1`) from the database responses. Completed directives are now correctly tallied and displayed on the operative dashboard again.

---

# CyberTasker 2.4.0 (The Automation & Precision Update)

### ⌨️ Tactical Controls & Dashboard Polish
*   **Global Hotkeys**: Control the grid without a mouse. Press `N` to instantiate a new directive, `/` to activate the global cross-grid search, and `Esc` to terminate any active overlay.
*   **Quick-Filter Pills**: The main dashboard now features contextual pills (Overdue, Due Today, High Priority) for instantaneous tactical sorting at a single click.
*   **Surface-Level Editing**: Operatives can now alter a directive's Category directly from the dashboard card via a dropdown, bypassing the need to open the full dossier.

### 📝 Advanced Dossier Operations
*   **Sub-Routine Rearrangement**: Complex sub-routines can now be fluidly reordered via drag-and-drop within the dossier, allowing for immediate tactical reprioritization.
*   **Directive Cloning**: Instantly duplicate complex, multi-step directives (including all sub-routines, recurrence patterns, and priorities) with a single click to save crucial operational time.

### 🌍 Global Integrity
*   **Automated Translation Diagnostics**: A specialized Python CI pipeline now scans every language file during integration, preventing releases if translation keys are missing across the 7 supported languages.

---

# CyberTasker 2.3.0 (Workflow & Stability Update)

### 🔁 Scheduled Protocols & Progress Tracking
*   **Recurring Directives**: Assign 'Daily', 'Weekly', or 'Monthly' loops to directives. The system will automatically compute and generate the next iteration only upon completion of the current task, preventing an infinite buildup of duplicate tasks.
*   **Directive Sub-Routines**: Complex directives can now be split into multiple sub-routines (checklists) directly inside the Dossier. Includes seamless inline text editing and individual progress toggles.
*   **Tactical Dashboards**: Mission cards instantly display the progress of sub-routines (e.g., "3/5" completed) directly on the grid, minimizing the need to constantly open the Dossier.
*   **Holo-Projections**: The Global Calendar actively visualizes future iterations of recurring directives as distinct, translucent projections allowing operatives to plan operations deep into the future without database spam.

### 🛡 Core Stability & Multi-Tenant Prep
*   **Cross-Database Precision**: Massive codebase refinements targeting MariaDB syntax anomalies to ensure 100% feature parity and stability between the lightweight SQLite local-instances and rigid MariaDB production environments.
*   **Automated E2E Pipelines**: The GitHub infrastructure is now augmented to simultaneously run full Playwright E2E integration tests against *both* SQLite and MySQL whenever the operative timeline is modified.

---

# CyberTasker 2.2.0 (The Dashboard & Dossier Upgrade)

### 📅 Global Calendar (Chrono-Sync)
*   **Header Navigation**: Instantly access the newly integrated Calendar module from the main navigation header to view a chronological sorting of all active deadlines.
*   **Interactive Modal Links**: Click any scheduled directive within the calendar to instantly open its Dossier overlay for rapid field editing.

### 📝 Elevated Dossier Interactions
*   **Interactive Dropdowns**: Replaced static text labels with fully styled `CyberSelect` dropdowns for changing **Priority** and **Category** directly inside the Directive Dossier.
*   **Inline Title Editing**: Operatives can now rename directives directly from within the Dossier by clicking the title.
*   **Markdown Headers**: The internal markdown parser now natively supports structural headers (`#`, `##`, `###`) without strict spacing requirements.

### 🌍 Massive Localization Expansion
*   **5 New Languages**: The Neural Link now fully supports Japanese (`ja`), Korean (`ko`), Hindi (`hi`), Turkish (`tr`), and Vietnamese (`vi`).
*   **Alphabetical Sorting**: The language switching overlay automatically sorts all dialects by their native names for faster intuitive selection.

### 🛡 QA & Polishing
*   **Password Confirmation**: Hardened the system Profile and Recovery flow by requiring a matching "Confirm Password" input before executing cryptographic changes.
*   **Pagination Adjustments**: Reduced the default dashboard data chunking limit to 25 directives to optimize rendering speed on heavy dossiers.
*   **System Help Updates**: Synchronized the operational manual to reflect new Global Calendar features across all supported dialects.

---

# CyberTasker 2.1.4 (Deep Directives & Global Localization)

### 📝 Deep Directives
*   **Markdown Protocols**: Write extended mission intel with rich-text formatting directly inside directive modals using the integrated Markdown engine.
*   **External Up-Links**: The system now parses and securely embeds external HTTPS links (`target="_blank"`) into protocol descriptions to maintain a secure sandbox.
*   **Encrypted Asset Vault**: Upload mission-critical file attachments (images, documents) directly to the server, linked exclusively to individual directives.

### 🌍 Static Localization Engine
*   **Vanilla JS i18n Hydration**: The static authentication pages (`verify.html`, `reset-password.html`) now hydrate to the user's preferred language natively without booting the full React bundle, preserving microsecond load times.

### 🎨 Aesthetic Refinements
*   **Klingon Theme Integration**: Introduced the brutalist, blood-red **QO'NOS (Klingon)** theme featuring grinding steel CSS background animations and aggressive typography.
*   **Pop Culture Themes**: Three new highly stylized visual matrices deployed: **Westeros** (Game of Thrones), **Comic** (Marvel), and **Gotham** (DC), complete with tailored fonts, conditional borders, and unique ambient animations.
*   **Ambient Animations**: Injected dynamic CSS background behaviors across the existing visual roster (Cyberpunk, LCARS, Matrix, Weyland, RobCo, Grid, Section 9, Outrun, Steampunk) with precision opacity and velocity controls.
*   **Universal Scrollbars**: Fully styled custom scrollbars deployed across all operational visual themes for maximum immersion.

---

# CyberTasker 2.0.4 (Account Verification Hotfix)

### 🏗️ Modernized Backend
*   **MVC Architecture**: Refactored monolithic scripts into a clean Controller/Router pattern.
*   **Repository Pattern**: Abstracted database interactions into dedicated Repositories for better testability and maintenance.
*   **Front Controller**: All API traffic now routes through a single secure entry point (`api/index.php`).

### 🎨 Visual Expansion
*   **Two New Themes**: Introduced the **Matrix** (Green Phosphor) and **Weyland-Yutani** (Industrial Amber) themes, joining **Cyberpunk** and **LCARS**.
*   **Custom Scrollbars**: Every theme now features custom-styled scrollbars (e.g., green glow for Matrix, neon pink for Cyberpunk).
*   **LCARS Flush Frames**: Precision alignment and standardized `1.5rem` rounding for all LCARS modals and panels.

### 🩹 Critical Fixes
*   **Account Verification**: Restored the connection between static HTML pages (`verify.html`, `reset-password.html`) and the new router-based API, fixing the "CONNECTION FAILED" error.
*   **HTTPS Protocol Detection**: Improved detection for shared hosting environments (Strato) to ensure secure links and valid CORS headers.
*   **Dynamic CORS Mapping**: The system now automatically adapts its security headers to the request protocol (HTTP vs HTTPS).

---
---
---

## 🛠 Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS
*   **Backend**: Vanilla PHP 8.x (No frameworks, dependency-free)
*   **Database**: MySQL, MariaDB, or SQLite (Hybrid Support)

---
---
---

# CyberTasker 1.9.4 (Security & Feature Polish)

### 🐛 Bug Fixes & UX Finetuning
*   **Task Limit Controls**: Enforced a strict 255-character limit on task titles at both the UI and Database layers for maximum stability.
*   **Editing Synchronization**: Patched an inline editing anomaly where new task text was appended instead of replacing the old state.
*   **Admin Console CSRF**: Restored Admin override capabilities (like 2FA disable) by ensuring proper CSRF token transmission via the internal `apiFetch` wrapper.
*   **LCARS Readability**: Significantly enlarged the hit-targets and icons for the 'Complete' and 'Delete' task actions, optimizing tactile interaction in the LCARS theme.

# CyberTasker 1.9.3 (Security Hardening Phase 3)

### 🚫 Anti-Brute-Force & Integrity Protocols
*   **Database-Backed Rate Limiting**: The authorization grid (`api/auth.php`) now actively tracks and evaluates login and 2FA verification attempts. If a terminal exceeds 5 failed attempts within a 15-minute window, it is locked out (`HTTP 429 Too Many Requests`), neutralizing automated brute-force and dictionary attacks.
*   **Subresource Integrity (SRI)**: Mathematical SHA-384 cryptographic hashes have been injected into `index.html` for all external CDN dependencies (e.g., `qrcode.min.js`). The browser will now physically refuse to execute the neural scripts if the Content Delivery Network is ever compromised.

# CyberTasker 1.9.2 (Security Hardening Phase 1 & 2)

### 🔒 Enterprise-Grade Security Patches
*   **Zero-Config Auto-Lock**: The installer (`api/install.php`) now detects initialized grids. If the system is active, it strictly requires an authenticated Admin session to execute schema updates, physically preventing unauthorized resets without compromising 1-click deployments on shared hosting.
*   **CSRF Middleware**: Developed a centralized token-negotiation protocol (`api/csrf.php`) and a uniform frontend API wrapper (`apiFetch`). All state-changing requests (POST/PUT/DELETE) are now cryptographically verified to block Cross-Site Request Forgery.
*   **Strict CORS Policy**: Restricted API access (`Access-Control-Allow-Origin`) exclusively to the operational frontend domain, neutralizing cross-origin data exfiltration vectors.
*   **Session Fixation Mitigation**: Embedded forced session regeneration (`session_regenerate_id()`) within all critical authorization uplinks (Login & 2FA Verification) to stop session hijacking.
*   **Information Leakage Sanitization**: Intercepted and scrubbed all raw database exception outputs (`$e->getMessage()`). Vulnerability details are now securely routed to sterile server logs, returning only generic HTTP 500 status codes to the client.

# CyberTasker 1.9.1 (Robust Theme Engine)

### 🎨 Semantic Theming & Geometry
*   **Zero-Bleed Architecture**: Re-engineered the CSS backend to utilize strict, locally-scoped semantic variables (`--theme-primary`). This completely eliminates "theme bleeding" (e.g., cyan buttons showing up in the LCARS theme).
*   **LCARS Geometric Enforcement**: Applied rigorous shape-control to the LCARS theme. All action buttons are now perfectly oval (pill-shaped), and all modal containers feature deeply rounded corners (1.5rem radius) to match authentic Starfleet topology.
*   **Aesthetic Finetuning**: Corrected tactical confetti sequences to match the active theme's palette, optimized the visual contrast of Admin "Promote" buttons, and explicitly colored critical LCARS interactables with tactical `#ffaa00`.

# CyberTasker 1.9.0 (Visual Paradigm Shift)

### 🎨 Multi-Theme Visual Architecture
*   **Aesthetic Toggle**: Operatives can now switch between the classic **Cyberpunk** neon look and the new **LCARS (Library Computer Access and Retrieval System)** interface.
*   **LCARS Authentication**: Re-engineered the "Jack In" terminal with authentic Starfleet aesthetics, including a theme-specific yellow/orange palette.
*   **Theme-Authentic Typography**: Integrated the **Antonio** Google Font for the LCARS theme to ensure high-immersion readability.
*   **Persistent Aesthetics**: Theme selection is stored in the neural database and synchronized across sessions.
*   **System-Wide Adaption**: All system components (Cards, Modals, Buttons, Confetti, and Alerts) automatically reconfigure their color schemes to match the active theme.

### ⚙️ UX & Grid Stability
*   **Global Case-Enforcement Revert**: Restored freedom of identity. The grid no longer forces lower-case inputs for Codenames, Emails, or Passwords—mixed-case inputs are strictly preserved.
*   **LCARS Header Optimization**: Re-architected the navigation modules to prevent overlap on mission-critical displays.
*   **Dynamic Visual Help**: Updated the "System Help" handbook with a dedicated section on Multi-Theme protocols, localized across all 6 languages.

# CyberTasker 1.8.2 (Mobile Polish & Test Strategy)

### 📱 Mobile UX Polish
*   **Dynamic Language Overlay**: Patched the coordinate calculation for the language selection menu. It now utilizes viewport bounds checking to ensure the overlay remains fully visible on smartphones, maintaining a 16px safety margin from the screen edges.

### 🧪 Test Strategy & Protocol
*   **Expanded Test Coverage**: Updated the `manuals/MASTER_TEST_PLAN.md` with `test-suite-06`, dedicated to Category Management (Adding, Renaming, Deleting, and Defaulting protocols).
*   **Bug Reporting Handshake**: Established a formal execution policy. Operatives/Agents will now document discovered failures in their reports before proceeding with fixes, ensuring a clear audit trail and manual intervention options.

# CyberTasker 1.8.1 (Stress Tested & Secure)

### 🛡 Enhanced Security & Stress Testing
*   **Strict Password Policy**: Administrators can now enforce complexity requirements via the Admin Console. Rejects weak passwords (min 12 chars, Case/Num/Special required).
*   **Stress-Tested Pagination**: Verified seamless handling of **250+ directives** in the Operative Dashboard and **40+ recruits** in the Administration Console.
*   **Neural Progression Integrity**: Validated XP-to-Rank calculation and level-up animations across multiple tier boundaries.
*   **Maintenance Protocol**: Decommissioned debug mail logging and purged diagnostic residues for a cleaner deployment.

### 🌐 Localization & UX Polish
*   **German Neural Link**: Corrected "LOGOUT" translation to "ABMELDEN" for linguistic accuracy.
*   **Select-All on Focus**: Standardized input behavior across the grid; clicking any field now automatically selects its content for efficient modification.

# CyberTasker 1.8.0 (Uplink Stability & Validation Polish)

### 🛡 Core Stability & Database Agnosticism
*   **Universal SQL Protocol**: Refactored backend logic to handle system dates and expires via PHP. Fully compatible with **SQLite, MySQL, and MariaDB** without database-specific syntax errors.
*   **Enhanced Recovery Flow**: Successfully streamlined the password reset handshake. Acknowledging the transmission alert now redirects the operative directly to the Login terminal.

### ✨ Validation UX & Alert Standardization
*   **Global Tooltip Wipe**: Implemented "Clear-on-Focus" logic. Clicking or tabbing into any input field instantly clears all active validation tooltips across the entire form for a cleaner workspace.
*   **Standardized Alert System**: Migrated all authentication feedback (Registration, 2FA, Recovery) to the `CyberAlert` overlay system, decommissioning legacy inline alerts.
*   **Secure Enumeration Protection**: Updated recovery success messaging to follow "If this email exists..." patterns, protecting operative identities from scanning.

### 🌐 Multilingual Neural Link
*   **Global Expansion**: CyberTasker now supports 6 major languages: **English, German (Deutsch), Dutch (Nederlands), Spanish (Español), French (Français), and Italian (Italiano)**.
*   **Dynamic Switcher**: Integrated a high-immersion language selection overlay.
*   **Unified Localization**: Every system alert, directive, and help handbook is fully localized for localized operations.

# CyberTasker 1.5.1 (Patch: SQLite Default & Stability)

### ⚙️ Core Configuration & Stability
*   **SQLite Default Protocol**: Updated `api/config.php` to use SQLite as the default database type.
*   **Dependency Locking**: Synchronized `package-lock.json` with the updated package version.

# CyberTasker 1.5.0 (Residue-Free Security & UI Optimization)

### 🛡 Deep Purge Protocols & Stability
*   **Exhaustive User Deletion**: Account termination (both Admin-led and Self-led) now performs a "residue-free" purge, explicitly clearing all tasks, user-specific categories, and 2FA artifacts.
*   **2FA Cleanup**: Confirmed that deactivation logic (and deletion) fully terminates all TOTP secrets and Email-2FA artifacts.
*   **Resilient Configuration**: Refactored `api/config.php` to utilize robust fallback logic.
*   **Diagnostic Installer**: The `api/install.php` utility now includes high-immersion diagnostics.

### 🕵️‍♂️ Administration Console Optimization
*   **High-Contrast Scan-ability**: Re-tuned secondary information (IDs, History, Metrics) from dull grays to high-contrast colors (`gray-300/400`).
*   **Flex-Grid Alignment**: Optimized table headers for better alignment.
*   **Structural Visibility**: Brightened structural boundaries for faster navigation.

### ✨ Neural Link Readability
*   **Enlarged Typography**: Increased instruction font sizes for 2FA sequences.
*   **Secret-Key Contrast**: Lightened background and brightened text for 2FA Secret Keys and Backup Fragments.

# CyberTasker 1.4.1 (Admin Override & UI Polish)

### 🕵️‍♂️ Admin Override Protocols
*   **2FA Override**: Administrators can now deactivate 2FA for any operative via the Admin Panel ("2FA OFF" button).
*   **Polished Administration Console**: Optimized table layout and higher data density for easier fleet management.

### 🛡 Security & Alerts
*   **CyberAlert System**: Replaced native browser alerts with high-immersion, neon-blue cyberpunk modals.
*   **Dynamic Input Glow**: Enhanced readability for all terminal inputs with neon-cyan focus states.

### 📱 Mobile Neural Link
- **Calendar Portals**: The scheduling calendar now uses React Portals to render at the body level, bypassing all parent container clipping.
- **Dynamic Orbital Logic**: Added intelligent coordinate calculation to ensure the calendar always remains within the operative's viewport.
- **Hotfix: Interaction Protocol**: Patched the event listener system to allow date selection within the portaled calendar, which was previously blocked by the "click-outside" security logic.

# CyberTasker 1.4.0 (Deep Security & Polish)

### 🛡 Deep Security Refinements
*   **Specialized Alerts**: Neon-pink themed "SECURITY ALERT" modals for high-risk operations like 2FA deactivation.
*   **State Synchronization**: Real-time user context refresh ensures the UI always reflects precisely when 2FA is active.
*   **CyberConfirm Integration**: All sensitive actions (deletions, terminations, 2FA, data sync) now use custom-themed cyberpunk confirmation modals instead of native alerts.

### ⚙️ Operational Logic & Stability
*   **Cyber-Triage Sorting Protocol**: Implemented high-immersion sorting hierarchy: Overdue > Today > Priority (High/Med/Low).
*   **Neural Calendar Synchronization**: Resolved critical bugs with the primary calendar overlay:
    *   **Mutual Exclusion**: Only one calendar can be active on the grid at a time.
    *   **Boundary Detection**: Calendar automatically adjusts positioning (up/down) based on grid edge proximity to prevent clipping.
    *   **Click-Outside Closing**: Instant collapse when operative's focus shifts.
*   **Automated Admin Briefing**: New installations automatically provision the default `admin` account with critical security directives (Password Override, Installer Purge, Neural Encryption) using high-immersion jargon.

### ✨ Tactile Polish & UX
*   **Enhanced Neural Progression Manual**: The "NEURAL PROGRESSION" section is now prioritized at the top of the System Help, completely rewritten for maximum cyberpunk immersion.
*   **Optimized Terminal**: The "New Directive" box now pulses with a neon-cyan glow upon initialization.
*   **Confetti Protocol**: System-wide neon confetti celebration upon successful task creation.
*   **Standardized Controls**: Uniform pink `[X]` close buttons and custom `CyberSelect` dropdowns across all modals.
*   **Responsive Layouts**: Profile headers now wrap intelligently to prevent overlap on smaller viewports.

# CyberTasker 1.3.0 (The "Neon" Update)

### 📂 Custom Categories & Due Dates
*   **Personal Protocols**: Create and manage your own task categories.
*   **Smart Calendar**: Integrated date picker with neon visuals.
*   **Visual Deadlines**: Clock icons and color-coded timestamps for imminent deadlines.

### 🔍 Search & Filtering
*   **Deep Search**: Locate specific tasks instantly.
*   **Advanced Filters**: Filter by Priority, Category, and Overdue status.

### ✨ Polish & Gamification
*   **Level Up**: New animations when you gain a level.
*   **Developer Tools**: Test user generator for load testing.

---

# CyberTasker 1.2.1

### 🛠 Fixes & Improvements
*   **Admin Password Visibility**: Admins can now toggle password visibility when resetting user credentials.
*   **UI Polish**: Sidebar and modal inputs now share a consistent Cyberpunk aesthetic.

# CyberTasker 1.2.0

### 🕵️‍♂️ Admin Panel 2.0
*   **Search & Filter**: Instantly find any operative by codename with real-time filtering.
*   **Dynamic Sorting**: Sort tables by **ID, Codename, Verification Status, or Last Login**.
*   **Pagination**: Smoothly navigate through large user databases.
*   **Activity Logs**: Track exactly when users last accessed the system.

### 🛡 Core Improvements
*   **Admin Priority**: Administrators are pinned to the top of lists for immediate access.
*   **Universal Seeding**: Robust tools to generate test data for both SQL and SQLite environments.

---

