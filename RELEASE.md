# CyberTasker v2.0.0 - The Architecture Update

**Release Date:** 2026-02-20

This landmark release transforms CyberTasker from a collection of monolithic scripts into a modern, robust, and testable application. Featuring a complete backend refactor, expanded visual themes, and a precision E2E automation suite.

## 🏗️ Backend Revolution
- **MVC Architecture**: Implemented a central Front Controller (`api/index.php`) and Router, separating concerns into dedicated domain controllers (`AuthController`, `TaskController`, etc.).
- **Repository Pattern**: Extracted SQL logic into clean Repository classes, ensuring the database layer is fully decoupled and easily maintainable.
- **RESTful Uplink**: Standardized API communication formats and improved error handling throughput.

## 🎨 Visual System Expansion
- **Matrix & Weyland-Yutani Themes**: Two new high-fidelity visual identities. Matrix features a phosphorescent green cathode glow, while Weyland-Yutani delivers an industrial amber terminal aesthetic.
- **Custom Scrollbar Engine**: Unique, theme-aware scrollbar styling implemented for all four visual modes.
- **Precision LCARS Geometry**: Refined the LCARS "Pill" aesthetic. Close buttons are now perfectly flush, and rounding is standardized to `1.5rem` across the entire framework.

## 🧪 Industrial-Grade Automation
- **Playwright E2E Suite**: A comprehensive automation suite now verifies 100% of critical mission stories, including registration, security policies, and theme persistence.
- **Strict Security Verification**: Automated checks for password complexity and administrative overrides.

---

# CyberTasker v1.9.4 - Security & Feature Polish

---

# CyberTasker v1.9.3 - Security Hardening (Phase 3)

**Release Date:** 2026-02-20

This update finalizes the OWASP Top 10 security hardening roadmap by introducing robust anti-brute-force measures and cryptographic integrity checks for external dependencies.

## 🚫 Anti-Brute-Force & Integrity Protocols
- **Database-Backed Rate Limiting**: The authorization grid (`api/auth.php`) now actively tracks and evaluates login and 2FA verification attempts. If a terminal exceeds 5 failed attempts within a 15-minute window, it is locked out (`HTTP 429 Too Many Requests`), neutralizing automated brute-force and dictionary attacks. The registration endpoint is also strictly throttled.
- **Subresource Integrity (SRI)**: Mathematical SHA-384 cryptographic hashes have been injected into `index.html` for all external CDN dependencies (e.g., `qrcode.min.js`). The browser will now physically refuse to execute the neural scripts if the Content Delivery Network is ever compromised.

---

# CyberTasker v1.9.2 - Security Hardening (Phase 1 & 2)

**Release Date:** 2026-02-20

This update focuses exclusively on mitigating critical OWASP Top 10 vulnerabilities, establishing a robust, enterprise-grade security baseline for the application.

## 🔒 Enterprise-Grade Security Patches
- **Zero-Config Auto-Lock**: The installer (`api/install.php`) now detects initialized grids. If the system is active, it strictly requires an authenticated Admin session to execute schema updates, physically preventing unauthorized resets without compromising 1-click deployments on shared hosting.
- **CSRF Middleware**: Developed a centralized token-negotiation protocol (`api/csrf.php`) and a uniform frontend API wrapper (`apiFetch`). All state-changing requests (POST/PUT/DELETE) are now cryptographically verified to block Cross-Site Request Forgery.
- **Strict CORS Policy**: Restricted API access (`Access-Control-Allow-Origin`) exclusively to the operational frontend domain, neutralizing cross-origin data exfiltration vectors.
- **Session Fixation Mitigation**: Embedded forced session regeneration (`session_regenerate_id()`) within all critical authorization uplinks (Login & 2FA Verification) to stop session hijacking.
- **Information Leakage Sanitization**: Intercepted and scrubbed all raw database exception outputs (`$e->getMessage()`). Vulnerability details are now securely routed to sterile server logs, returning only generic HTTP 500 status codes to the client.

---

# CyberTasker v1.9.1 - Robust Theme Engine

**Release Date:** 2026-02-20

This update hardens the Multi-Theme Architecture introduced in v1.9.0, ensuring absolute CSS isolation and enforcing authentic LCARS geometry across all system components.

## 🎨 Semantic Theming & Geometry
- **Zero-Bleed Architecture**: Re-engineered the CSS backend to utilize strict, locally-scoped semantic variables (`--theme-primary` instead of `cyber-neonCyan`). This completely eliminates "theme bleeding" where components incorrectly inherited global styles while inside a specific theme preview.
- **LCARS Geometric Enforcement**: Applied rigorous shape-control to the LCARS theme. All action buttons are now perfectly oval (pill-shaped), and all modal containers feature deeply rounded corners (`1.5rem` radius) to match authentic Starfleet topology.
- **Aesthetic Finetuning**: Corrected tactical confetti sequences to match the active theme's palette, optimized the visual contrast of Admin "Promote" buttons, and explicitly colored critical LCARS interactables with tactical `#ffaa00`.

## ⚙️ Layout & Polish
- **Frame Stabilization**: Fixed a critical `border-box` layout drift in the Profile Modal caused by scrollbar overlapping. The frame now correctly contains the custom LCARS scrolling module.
- **Unified Action Nodes**: The `[X]` close buttons across all modals (Help, Admin, Profile) have been strictly unified, rendering as bold, filled orange tabs specifically within the LCARS environment.

---

# CyberTasker v1.9.0 - Visual Paradigm Shift

This major update introduces the first phase of the Multi-Theme Visual Architecture, featuring the LCARS-inspired interface alongside the classic Cyberpunk neon look.

## 🎨 Multi-Theme Visual Architecture
- **Theme Selection Protocol**: Integrated a new theme switcher into the Profile Modal. Operatives can now toggle between "Cyberpunk" and "LCARS".
- **Aesthetic Persistence**: Verified end-to-end persistence. Theme preferences are locked to the user's neural ID via the backend database.
- **LCARS Aesthetic Refinement**: 
    - **Palette Mapped**: Every neon-cyan/pink element has been mapped to authentic LCARS colors (Gold, Orange, Red, Blue, Lavender).
    - **Antonio Font Link**: Universally applied the Antonio font for the LCARS theme for maximum immersion.
    - **Solid Level Bar**: Updated the progression bar to a solid "Info-Blue" in LCARS mode.
    - **Pill-Shaped Controls**: Standardized buttons and close actions with authentic rounded-pill designs.
    - **Adaptive Header**: Language selection and logout modules repositioned to handle the unique LCARS geometry without title overlap.
- **Theme-Specific Effects**: Updated the "Tactile Success" (Confetti) sequence to use theme-appropriate color palettes.

## ⚙️ UX & Stability Polish
- **Case Enforcement Revert**: Globally disabled forced-lowercase logic. Operatives can now utilize mixed-case Codenames (e.g., "DaDa") and Passwords without system intervention.
- **Localized Visual Help**: Added a new "Visual Interface" section to the System Help manual, fully translated into all 6 supported languages.
- **Clean Grid Boundaries**: Subdued/removed the Cyberpunk background grid when LCARS is active for a cleaner look.

---

# CyberTasker v1.8.2 - Mobile Polish & Test Strategy

**Release Date:** 2026-02-19

This update focuses on mobile responsiveness for global components and formalizes the automated test execution strategy.

## 📱 Mobile UX Polish
- **Dynamic Language Overlay**: Patched the coordinate calculation for the language selection menu. It now utilizes viewport bounds checking to ensure the overlay remains fully visible on smartphones, maintaining a 16px safety margin from the screen edges.

## 🧪 Test Strategy & Protocol
- **Expanded Test Coverage**: Updated the `MASTER_TEST_PLAN.md` with `test-suite-06`, dedicated to Category Management (Adding, Renaming, Deleting, and Defaulting protocols).
- **Bug Reporting Handshake**: Established a formal execution policy. Operatives/Agents will now document discovered failures in their reports before proceeding with fixes, ensuring a clear audit trail and manual intervention options.

---

# CyberTasker v1.8.1 - Stress Tested & Secure

**Release Date:** 2026-02-19

This update marks the completion of the Phase 2 Automated Test Plan, introducing strict security policies and verifying system scalability under stress.

## 🛡 Enhanced Security & Stress Testing
- **Strict Password Policy**: New administrative toggle allows enforcement of complexity rules. Verified rejection of weak keys and successful handling of secure pins.
- **Scalability Protocols**: Successfully stress-tested the neural interface with **250+ simultaneous directives** and **40+ active recruits**, ensuring zero performance degradation in pagination.
- **Neural Progression Integrity**: Verified that XP gains correctly trigger rank advancement across multiple levels, including visual leveling feedback and animations.

## 🌐 Localization & UX Polish
- **Linguistic Correction**: Updated the German (DE) localization; "LOGOUT" is now correctly identified as "ABMELDEN".
- **Tactile Inputs**: Implemented "Select-All on Focus" across all terminal inputs, allowing operatives to overwrite or modify entries with a single click.

## ⚙️ Maintenance
- **Purge Protocol**: Removed debug mail logging artifacts and deleted temporary installation/backup residues.

---

# CyberTasker v1.8.0 - Uplink Stability & Validation Polish

**Release Date:** 2026-02-18

This major stability update focuses on core database transitions, streamlined recovery flows, and significant UX polish for the validation system.

## 🛡 Core Stability & Database Agnosticism
- **Universal SQL Protocol**: Re-engineered the session and user management logic to handle date calculations via PHP (`date()`, `strtotime()`) instead of database-specific SQL functions (`DATE_ADD`). This ensures seamless operation across **SQLite, MySQL, and MariaDB** installations.
- **Enhanced Recovery flow**: Refactored the password reset handshake to be more proactive. Successfully acknowledging the "Transmission Sent" alert now redirects the operative directly to the Login Terminal, removing redundant manual steps.
- **Secure Enumeration Protection**: Updated recovery success messaging to follow "If this email exists..." patterns (Option B), preventing unauthorized scanning of operative databases.

## ✨ Validation UX & Alert Standardization
- **Global Tooltip Wipe**: Implemented a "Clear-on-Focus" strategy. Clicking or tabbing into any input field now instantly clears all active validation tooltips across the form, providing a cleaner workspace for corrections.
- **Unified Alert System**: Migrated the remaining registration and recovery feedback prompts to the `CyberAlert` system, ensuring all high-priority comms utilize the immersion-themed overlay.
- **Multilingual Neural Link**: CyberTasker has officially gone global. Version 1.8.0 introduces full localization support for **DE, EN, NL, ES, FR, and IT**. 
- **Dynamic Language Selection**: Replaces legacy static text with a centralized `i18n` protocol and a sleek, cyberpunk selector overlay.

---

# CyberTasker v1.5.1 - Patch: SQLite Default & Stability

**Release Date:** 2026-02-17

This patch release improves the "out-of-the-box" experience for new installations.

## ⚙️ Core Configuration & Stability
- **SQLite Default Protocol**: Updated `api/config.php` to use SQLite as the default database type. This ensures that fresh installations work immediately without requiring manual configuration of `config.local.php` for MySQL.
- **Dependency Locking**: Synchronized `package-lock.json` with the updated package version.

---

# CyberTasker v1.5.0 - Residue-Free Security & UI Optimization

**Release Date:** 2026-02-17

This update introduces "residue-free" user deletion, enhanced 2FA deactivation logic, and significant readability optimizations for the Administration Console.

## 🛡 Deep Purge Protocols & Stability
- **Exhaustive User Deletion**: Both administrative and self-led account terminations now explicitly clear all tasks, user-specific categories, and 2FA artifacts.
- **2FA Residual Protection**: Improved the "Disable 2FA" action to ensure all four 2FA-related columns (enabled, secret, method, backup_codes) are fully reset to NULL/0.
- **Resilient Configuration**: Implemented a fallback mechanism in `api/config.php` to ensure critical database parameters are defined even if a local override file is missing values.
- **Diagnostic Installer**: Re-engineered `api/install.php` with verbose diagnostic output, providing immediate visibility into connection states and data persistence metrics.

## 🕵️‍♂️ Administration Console Optimization
- **High-Contrast Readability**: Re-tuned secondary data (IDs, History labels, Metrics) from low-visibility grays to higher-contrast tones (`gray-300/400`).
- **Flex-Grid Layout**: Implemented flexbox alignment for table headers, ensuring sorting icons stay horizontally pinned to the header text.
- **Structural Contrast**: Brightened structural elements like borders, search input glow, and pagination controls for better navigation.

## ✨ Neural Link Readability
- **Optimized Typography**: Enlarged key instruction sequences in the 2FA setup flow ("Sync Neural Link", "Signal Decay", etc.).
- **Improved Contrast**: Lightened background tones and brightened text for 2FA secret keys and backup fragments to ensure high legibility against the dark theme.

---

# CyberTasker v1.4.1 - Admin Override & UI Polish

## 🕵️‍♂️ Admin Override Protocols
- **2FA Admin Override**: Administrators can now deactivate 2FA for users who have lost access to their authenticator devices. A new "2FA OFF" button has been integrated into the Administration Console.
- **Polished Admin Console**: The user management table has been re-engineered for higher data density, providing a clearer overview of the operative fleet.

## 🛡 Security & Alerts
- **CyberAlert System**: Native browser `alert()` dialogs have been decommissioned. High-immersion neon-blue `CyberAlert` modals now handle all system notifications (e.g., successful registration).
- **Responsive Terminal Inputs**: All input fields now feature optimized contrast and a neon-cyan "active focus" glow for better visibility in high-intensity operations.

## 📱 Mobile Neural Link
- **Calendar Portals**: The scheduling calendar now uses React Portals to render at the body level, bypassing all parent container clipping.
- **Dynamic Orbital Logic**: Added intelligent coordinate calculation to ensure the calendar always remains within the operative's viewport.
- **Hotfix: Interaction Protocol**: Patched the event listener system to allow date selection within the portaled calendar.
- **Hotfix: Logo Visibility**: Fixed an issue where the logo wouldn't display when the app was deployed in a subdirectory by migrating to ESM asset imports.

---

# CyberTasker v1.4.0 - Deep Security & Polish

**Release Date:** 2026-02-15

This update focuses on deepening the application's security posture through specialized alerts and comprehensive UI/UX refinements for a smoother, more tactile operative experience.

## 🛡 Deep Security Refinements
- **Specialized Security Alerts**: High-risk operations (such as disabling 2FA) now trigger a focused neon-pink "SECURITY ALERT" modal to ensure critical awareness.
- **True-State Sync**: Fixed a synchronization issue where the 2FA status wouldn't update immediately. The grid now re-fetches the operative's authentication state after every profile change.
- **CyberConfirm Integration**: Native browser confirmation alerts have been scrapped in favor of high-immersion, cyberpunk-themed `CyberConfirm` modals for all critical data manipulations (Deletion, 2FA Toggle, Chrono-Sync).
- **Automated Security Briefing**: New grid initializations now automatically inject high-priority security directives into the default `admin` dashboard, ensuring immediate operational safety.

## ⚙️ Operational Logic & Stability
- **Cyber-Triage Sorting Protocol**: A new backend sorting hierarchy ensures that critical failures (**SIGNAL LEAK / Overdue**) and immediate requirements (**HEAT SPIKE / Due Today**) are pinned to the top, followed by **STRATEGIC** base priority (HIGH > MED > LOW).
- **Neural Calendar Stabilization**: The primary calendar overlay has been patched for maximum reliability:
    - **Mutual Exclusion**: Prevents orphaned overlays by ensuring only one calendar is active.
    - **Boundary Detection**: Dynamically flips positioning (`top-full` vs `bottom-full`) to prevent UI clipping at the grid edges.
    - **Shadow-Close**: Integrated a click-outside listener for seamless interface navigation.

## ✨ Tactile Polish & UX
- **Prioritized Neural Manual**: The System Help handbook has been restructured to place the **NEURAL PROGRESSION [XP & Ranks]** matrix at the top, rewritten in localized cyberpunk English.
- **Terminal Pulse**: The "New Directive" terminal now pulses with a neon-cyan glow and scales slightly upon successful initialization, providing immediate visual confirmation.
- **Success Confetti**: Tactical success is celebrated with a system-wide neon confetti deployment upon creating new directives.
- **Standardized Navigation**: All modals now feature a uniform, prominent neon-pink `[X]` close button, matching the style of the System Helper.
- **Adaptive Headers**: The Profile header has been re-engineered to wrap the operative's codename, preventing UI overlap and enhancing readability on diverse display units.
- **Optimized Controls**: High-performance `CyberSelect` and `CyberDateInput` components are now standard for all directive parameters.

---

# CyberTasker v1.3.0 - The "Neon" Update

**Release Date:** 2026-02-15

This major update introduces powerful task management features, a complete visual overhaul for scheduling, and robust filtering tools.

## 📂 Category Customization
- **Personalized Protocols**: Operatives can now add, rename, and delete custom categories via their Profile.
- **Default Priorities**: Tag any category as "DEFAULT" to have it automatically selected and prioritized in the "New Directive" terminal.
- **Initial Load-out**: New operatives start with 5 standard protocols (Private, Work, Finance, Health, Hobby).
- **Real-time Sync**: Category changes reflect instantly across the dashboard.

## 📅 Smart Scheduling & Calendar
- **Cyberpunk Calendar**: A custom, neon-styled date picker overlay replaces the default browser input.
- **Year Navigation**: Quickly jump between years with new control buttons.
- **Time Visuals**: Due dates are color-coded (Imminent, Future, Overdue) with clock icons.
- **Intelligent Sorting**: Tasks are now sorted by Status > Due Date > Priority > Creation Time.

## 🔍 Search & Filtering
- **Real-time Search**: Instantly filter directives by title as you type.
- **Advanced Filters**: Drill down by **Priority (High/Med/Low)**, **Category**, or **Overdue** status.
- **System Reset**: A single button to clear all active filters and restore the full view.

## ✨ Visual Polish & Gamification
- **Level Up Celebration**: Confetti and neon pulse animations when you level up.
- **Done Animation**: Completed tasks show a strikethrough effect before automatically moving to the bottom of the list.
- **Validation**: "Neon Error" notifications for empty task submissions.

## 🛠 Developer Tools
- **Test User Installer**: A new script (`api/install_test_user.php`) to generate a test user ('Alicia') with 250 random tasks for performance testing.

---

# CyberTasker v1.2.1 - Release Notes

## 🕵️‍♂️ Admin Panel Fixes
- **Password Visibility**: Added an eye icon (Neon Cyan) to the "Reset Password" modal, allowing admins to verify the new password before submission. This matches the style of the global authentication forms.

---

# CyberTasker v1.2.0 - Release Notes

## 🕵️‍♂️ Admin Panel 2.0
- **Advanced Search**: Real-time, filtering-as-you-type search for users by Codename.
- **Dynamic Sorting**: Sort users by ID, Codename, Status, or History. Admins always stay at the top.
- **Smart Pagination**: Navigation controls (First, Prev, Next, Last) handle large user bases efficiently.
- **User History**: New "History" column tracks the `last_login` timestamp for every operative.

## ⚙️ Backend Enhancements
- **Enhanced Seeding**: Improved database seeding scripts for robust test data generation across MySQL and SQLite.
- **Security**: Hardened "Admin Priority" logic ensures administrators are never buried in pagination results.

## 🐛 Bug Fixes
- Fixed consistent sorting order across different database types.
- Corrected pagination limit/offset calculations.

---
*For update instructions, see [UPDATE_INSTRUCTIONS.md](./UPDATE_INSTRUCTIONS.md).*
