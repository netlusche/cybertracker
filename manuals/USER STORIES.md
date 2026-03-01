# CyberTasker User Stories Overview

This document provides a categorized overview of the user stories implemented in the **CyberTasker** application. These stories define the functional requirements and user experience for both Operatives (Users) and Administrators.

---

## 🔐 1. User Authentication & Identity
*   **Secure Registration**: As an operative, I want to create a secure account so that I can manage my personal directives.
*   **Dual-Link Protection (2FA)**: As an operative, I want to enable Multi-Factor Authentication (MFA) via TOTP apps (Google/Microsoft Authenticator) or email to protect my neural data from unauthorized hacks.
*   **Profile Customization**: As an operative, I want to manage my personal protocols (categories) in my profile to mirror my individual workflow.
*   **Neural Purge**: As an operative, I want to be able to delete my account and ensure all associated directives and security artifacts are completely erased.
*   **Standardized Alerts**: As an operative, I want all authentication feedback (Login, Registration, 2FA) to use the high-immersion `CyberAlert` overlay system for a unified experience.
*   **Streamlined Recovery**: As an operative, I want to be automatically redirected to the login terminal after acknowledging a password reset request to minimize operational friction.
*   **Identity Cloaking**: As an operative, I want the recovery system to use generic messaging ("If this email exists...") to prevent unauthorized scanning of the operative database.
*   **Secure Comms (Email)**: As an operative, I want to receive verifiable email transmissions for account verification, email updates, and emergency 2FA overrides.

## 📋 2. Directive Management (Task Control)
*   **Initialize Directive**: As an operative, I want to create new directives with specified titles, priorities, and categories.
*   **Inline Modification**: As an operative, I want to edit directive titles directly within the terminal to maintain operational speed.
*   **Tactical Execution**: As an operative, I want to mark directives as completed to earn XP and clear my active queue.
*   **Cycle Protocols**: As an operative, I want to click on priority or category badges to quickly cycle through available options.
*   **Deep Search**: As an operative, I want to filter directives by keyword, priority, or protocol to locate critical information instantly.
*   **Paginated Feeds**: As an operative, I want my extensive directive list to be paginated, ensuring fast terminal performance without sensory overload.

## 📈 3. Gamification & Progression
*   **XP Acquisition**: As an operative, I want to earn Experience Points (XP) for every completed directive to track my professional growth.
*   **Neural Leveling**: As an operative, I want to see a visual progress bar and receive level-up notifications to stay motivated.
*   **Operational Rewards**: As an operative, I want to receive neon confetti and tactile UI feedback upon successful directive creation and completion.

## 📅 4. Smart Scheduling & Cyber-Triage
*   **Chrono-Sync (Calendar)**: As an operative, I want to assign deadlines using a custom neon calendar to visualize my operational window.
*   **Urgency Sorting**: As an operative, I want my dashboard to automatically sort directives by urgency (**Overdue > Due Today > Priority**) to focus on imminent threats.
*   **Visual Deadlines**: As an operative, I want color-coded timestamps and clock icons to identify directives nearing "Signal Decay."

## 🕵️‍♂️ 5. Fleet Administration & Stability
*   **Operative Overview**: As an administrator, I want to see a paginated list of all operatives (using the DataGrid component), including tracking of verification status and last login history.
*   **Neural Override**: As an administrator, I want to deactivate 2FA for operatives who have lost their authentication links.
*   **Credential Reset**: As an administrator, I want to securely reset operative passwords to restore system access.
*   **System Diagnostics**: As an administrator, I want to view real-time metrics on user counts and database health to ensure grid stability.
*   **Agnostic Uplink**: As an administrator, I want the system core to be database-agnostic (SQLite, MySQL, MariaDB) so that it can be deployed on any server environment without code changes.

## ✨ 6. Immersive Interface & Multilingual Support
*   **Terminal Aesthetics**: As an operative, I want to interact with a high-contrast, neon-themed interface that maintains immersion in the cyberpunk universe.
*   **Neural Manual**: As an operative, I want access to a "System Help" manual that explains level progression and system terminology in a thematic way.
*   **Responsive Link**: As an operative, I want the system to be fully functional on both workstation monitors and mobile neural links.
*   **Multilingual Neural Link**: As an operative, I want to choose my preferred localized language (DE, EN, NL, ES, FR, IT) to ensure maximum operational clarity.
*   **Smart Validation Cleaning**: As an operative, I want all validation error tooltips to disappear globally as soon as I focus on any field to keep my terminal clear while correcting my input.

## 🎨 7. Multi-Theme Visual Architecture
*   **Visual Identity Shift**: As an operative, I want to choose between different visual interfaces (Cyberpunk, LCARS, Matrix, Weyland-Yutani) in my profile to match my preferred aesthetic.
*   **Persistent Aesthetics**: As an operative, I want my theme selection to be preserved across sessions and devices so that my neural environment remains consistent.
*   **Theme-Specific Typography**: As an operative, I want the system to utilize theme-authentic fonts (like Antonio for LCARS) to enhance immersion and readability.
*   **Harmonized Color Palettes**: As an operative, I want every system element (buttons, borders, icons) to automatically adapt to the active theme's color scheme for a unified UX.
*   **Adaptive Layouts**: As an operative, I want the system layout to optimize itself for the active theme (e.g., repositioning header modules in LCARS) to ensure a clean, non-overlapping interface.
*   **Pop Culture Synapse**: As an operative, I want to access non-standard, highly stylized pop culture visual templates (Westeros, Comic, Gotham) to reflect my current operational mood.

## 📁 8. Deep Directives (Operative Dossier)
*   **Rich-Text Intel (Markdown)**: As an operative, I want to write extended protocol descriptions using Markdown so I can structure my mission notes with headers, lists, and formatting.
*   **External Up-Links**: As an operative, I want the system to automatically convert URLs in my descriptions into clickable, secure, themed external links to quickly access reference grids.
*   **Mission Assets (File Uploads)**: As an operative, I want to securely attach critical files (images, documents) directly to my directives via drag-and-drop or file selection so all relevant data is localized.
*   **Asset Management**: As an operative, I want to easily delete attached files from a directive when they are no longer needed or erroneous, ensuring a clean data vault.

## 🚀 9. Installation & Deployment (System Admin)
*   **Zero-Config Initialization**: As a system administrator, I want to deploy the application simply by uploading it and running an installer script, without needing to manually create database tables.
*   **Agnostic Hosting**: As a system administrator, I want the application to work out-of-the-box on strict shared hosting environments (e.g., STRATO Hosting Plus), regardless of whether it's deployed in the root domain, a subdomain, or a subdirectory.
*   **Cross-Database Feature Parity**: As a system administrator, I want to ensure advanced features (like Deep Directive JSON attachments) are 100% compatible across SQLite, MySQL, and MariaDB, ensuring I am never locked into a specific database engine.
*   **Platform Diagnostics**: As a system administrator, I want the installer to provide immediate feedback on server compatibility (PHP version, SQLite/MySQL drivers, file write permissions).

## 🚀 10. Release 2.2 Features
*   **Dashboard Pagination (US-2.2.1)**: As an operative, I want the dashboard to paginate at 25 directives per page to ensure fast rendering and clean layouts.
*   **Alphabetical Languages (US-2.2.2 & 2.2.11)**: As an operative, I want the language selector to strictly sort by alphabetical order to intuitively locate the correct localization link.
*   **Dossier Visual Triage (US-2.2.3 & 2.2.4)**: As an operative, I want visual clarity in the Directive Dossier through title wrapping and markdown header parsing for complex operational documentation.
*   **Dossier Inline Edits (US-2.2.9)**: As an operative, I want to edit directive titles directly within the Dossier modal without jumping out, saving critical time.
*   **Password Confirmation (US-2.2.5 & 2.2.6)**: As an operative, I want to be prompted to confirm a new password during profile updates and password resets to prevent accidentally locking myself out.
*   **Chrono-Sync Calendar (US-2.2.7 & 2.2.8)**: As an operative, I want to access a central calendar to visualize all outstanding directives mapped against their deadlines.
*   **Dossier Field Editing (US-2.2.12)**: As an operative, I want the ability to view and modify my `due_date`, `priority`, and `category` directly inside the Directive Dossier overlay via interactive dropdowns for rapid organization.

## 🚀 11. Release 2.3 Features
*   **Automated E2E Pipeline (US-2.3.1)**: As a system architect, I want Playwright tests to run fully automated via GitHub Actions against both SQLite and MariaDB to instantly block cross-database incompatibilities.
*   **Sub-Routine Integration (US-2.3.2)**: As an operative, I want to break down complex directives into smaller, actionable sub-routines (checklists) directly within the Dossier that I can toggle and edit inline.
*   **Tactical Progress Tracking (US-2.3.3)**: As an operative, I want to see a visual progress indicator (e.g., "3/5") for active sub-routines directly on the dashboard cards, eliminating the need to open every dossier to gauge mission completion.
*   **Scheduled Protocols (US-2.3.4)**: As an operative, I want to define recurrence intervals (Daily, Weekly, Monthly) for repetitive tasks. Upon completion, the system should automatically generate a fresh directive for the next operational window, keeping my schedule clear of infinite duplicates.

## 🚀 12. Release 2.4 Features
*   **Sub-Routine Reordering (US-2.4.1)**: As an operative, I want to reorder my sub-routines via drag-and-drop within a directive's dossier so that I can flexibly adjust the execution priority of step-by-step procedures.
*   **Aesthetic Category Selection (US-2.4.2)**: As an operative, I want to use a stylized `CyberSelect` dropdown for choosing categories directly on the directive dashboard card, replacing cumbersome cycle-clicking with a fast, thematic UI.
*   **Keyboard Shortcuts (US-2.4.3)**: As an operative, I want to utilize global keyboard shortcuts (`N` for new directives, `/` for search, `Esc` to close modules) to navigate the grid and execute actions with maximum speed.
*   **Directive Cloning (US-2.4.4)**: As an operative, I want a 1-click duplicate action within the dossier to rapidly clone complex tasks (including their title, description, and sub-routines) for recurring templates.
*   **Global Filter Pills (US-2.4.5)**: As an operative, I want quick-access filter toggle pills next to the search bar to instantly isolate "Overdue" or high-priority directives without manual text entry.
*   **Linguistic Integrity Checks (US-2.4.6)**: As a system developer, I want pre-release scripts to automatically scan and validate the completeness of all translated language keys (while defaulting to English) to prevent broken UI renders across the fleet.

## 🚀 13. Release 2.5 Features
*   **Comprehensive Documentation (US-2.5.0)**: As a user, administrator, and system operator, I want detailed, illustrated, and structured system documentation (User Guide, Admin Guide, Technical Reference) in PDF format to understand features, administer the system, and comprehend the technical architecture.
*   **Localized XP Progress (US-2.5.3)**: As a non-English speaking user, I want the XP progress box on the dashboard translated into my selected language to understand leveling and progress texts consistently.
*   **Version Display (US-2.5.4)**: As an administrator, I want to see the current system version displayed at the bottom of the Admin Panel for quick reference during support requests.
*   **CI/CD Consistency Checks (US-2.5.5)**: As a developer, I want pull requests to be automatically checked for missing translations and hardcoded colors to prevent UI bugs from entering the main branch.
*   **Global Theme Guidelines (US-2.5.6)**: As a frontend developer/designer, I want central documentation of all theme rules (`THEME_GUIDELINES.md`) to ensure consistent implementation of future themes without conflicting with automated checks.
*   **New UI Themes (US-2.5.7 & US-2.5.7b)**: As a user, I want four new highly specialized UI themes (Computerwelt, Mensch-Maschine, Neon Syndicate, Megacorp Executive) with thematic descriptions in the System Help to further customize my interface.
*   **Auth E2E Validation (US-2.5.8)**: As a system operator, I want critical account functions (registration, login, 2FA, email updates) automatically tested via E2E and CI/CD workflows to prevent breaking updates.
*   **Setup Email Requirement (US-2.5.9)**: As a system installer, I want to be forced to provide a valid email address for the master admin account during initial setup to ensure a communication channel exists for 2FA and recovery.
*   **Global "Enforce Email 2FA" Policy (US-2.5.10, 2.5.10b, 2.5.10c)**: As an administrator, I want a global switch to enforce Email 2FA for all users (unless they have apps configured), with clear visual warnings in active sessions and context banners during login for transparency.
*   **Initial Security Directive (US-2.5.11)**: As a newly installed admin, I want a predefined directive in my dossier reminding me to activate the 2FA policy to stay immersed and secure the system.
*   **Scalable Gamification Badges (US-2.5.12 & US-2.5.13)**: As an operative, I want a scalable gamification system that dynamically calculates a two-part badge (Tier + Title) up to Level 50, displaying it prominently on my dashboard and seamlessly translating it across all languages using bracket-context guidelines.

## 🚀 14. Release 2.6 Features
*   **Multilingual Tooltips (US-2.6.1)**: As a new operative, I want to hover over icons and receive localized tooltips so that I understand features without a crowded UI.
*   **Tab Navigation (US-2.6.2)**: As a keyboard user, I want visual focus outlines and trapped focus in modals so that I can rapidly navigate options without using a mouse.
*   **Automated Release Script (US-2.6.3)**: As a system maintainer, I want a single script to automate E2E tests, translation checks, version bumping, and version tagging.
*   **Cyberpunk Daily Quote (US-2.6.4)**: As an operative, I want to see a daily rotating thematic quote on my dashboard to increase immersion.
*   **Multilingual Installer (US-2.6.5)**: As a system admin deploying the grid, I want the installer interface to load in my selected language and set this preference for the first account.
*   **Localized System Emails (US-2.6.6)**: As a non-English speaking user, I want system emails (Recovery, Verification) to be written entirely in my profile's selected language.
*   **Sub-Routine Mobile DND (US-2.6.9)**: As a mobile operative, I want to fluidly drag-and-drop sub-routines using touch controls so I can prioritize tasks on the go.

## 🚀 15. Release 2.6.1 Features
*   **Dossier File Indicator (US-2.6.1.1)**: As an operative, I want to see a visual indicator (paperclip) on task cards containing attached files so I instantly know there's additional dossier material.
*   **Bulk Purge Completed (US-2.6.1.2)**: As an operative, I want to permanently delete all completed directives from my grid with a single button click to rapidly clean my workspace.
*   **Automated Ghost Purge (US-2.6.1.3 & 2.6.1.4)**: As an administrator, I want to automatically delete unverified accounts and inactive accounts (based on retention years) to maintain database hygiene before major upgrades.
*   **Thematic Admin Modals (US-2.6.1.5)**: As an administrator, I want critical destruction actions (like deleting a user) to trigger warning modals that strictly respect my currently selected aesthetic theme.
*   **Completed Filter Pill (US-2.6.1.6)**: As an operative, I want a dedicated quick-filter pill to instantly display only my completed directives in a paginated grid.

## 🚀 16. Release 2.7 Features (The AI Localization Update)
*   **AI Translation Script (US-2.7.1)**: As a system maintainer, I want an AI-driven script powered by the Gemini API to rapidly translate new English UI strings into all 23 other languages natively preserving cyberpunk context.
*   **Graceful API Fallback (US-2.7.1b)**: As a sysadmin, I want the translation script to cleanly fall back to a basic Google Translate API if the Gemini token is missing or rate-limited to ensure CI pipelines never break.
*   **Incremental Translation (US-2.7.3)**: As a localization manager, I want the translation sync tool to only target *missing* keys by default, so it never overwrites manual human translations or custom fixes (like Klingon strings).
*   **Unified Filter UX (US-2.7.4)**: As an operative, I want a single, unambiguous "Reset" button for all active dashboard filters to reduce visual clutter and translation duplication.
