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

## 📋 2. Directive Management (Task Control)
*   **Initialize Directive**: As an operative, I want to create new directives with specified titles, priorities, and categories.
*   **Inline Modification**: As an operative, I want to edit directive titles directly within the terminal to maintain operational speed.
*   **Tactical Execution**: As an operative, I want to mark directives as completed to earn XP and clear my active queue.
*   **Cycle Protocols**: As an operative, I want to click on priority or category badges to quickly cycle through available options.
*   **Deep Search**: As an operative, I want to filter directives by keyword, priority, or protocol to locate critical information instantly.

## 📈 3. Gamification & Progression
*   **XP Acquisition**: As an operative, I want to earn Experience Points (XP) for every completed directive to track my professional growth.
*   **Neural Leveling**: As an operative, I want to see a visual progress bar and receive level-up notifications to stay motivated.
*   **Operational Rewards**: As an operative, I want to receive neon confetti and tactile UI feedback upon successful directive creation and completion.

## 📅 4. Smart Scheduling & Cyber-Triage
*   **Chrono-Sync (Calendar)**: As an operative, I want to assign deadlines using a custom neon calendar to visualize my operational window.
*   **Urgency Sorting**: As an operative, I want my dashboard to automatically sort directives by urgency (**Overdue > Due Today > Priority**) to focus on imminent threats.
*   **Visual Deadlines**: As an operative, I want color-coded timestamps and clock icons to identify directives nearing "Signal Decay."

## 🕵️‍♂️ 5. Fleet Administration & Stability
*   **Operative Overview**: As an administrator, I want to see a paginated list of all operatives, including their verification status and last login history.
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
*   **Visual Identity Shift**: As an operative, I want to choose between different visual interfaces (e.g., Cyberpunk, LCARS) in my profile to match my preferred aesthetic.
*   **Persistent Aesthetics**: As an operative, I want my theme selection to be preserved across sessions and devices so that my neural environment remains consistent.
*   **Theme-Specific Typography**: As an operative, I want the system to utilize theme-authentic fonts (like Antonio for LCARS) to enhance immersion and readability.
*   **Harmonized Color Palettes**: As an operative, I want every system element (buttons, borders, icons) to automatically adapt to the active theme's color scheme for a unified UX.
*   **Adaptive Layouts**: As an operative, I want the system layout to optimize itself for the active theme (e.g., repositioning header modules in LCARS) to ensure a clean, non-overlapping interface.
