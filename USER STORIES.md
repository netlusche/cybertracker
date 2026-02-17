# CyberTasker User Stories Overview

This document provides a categorized overview of the user stories implemented in the **CyberTasker** application. These stories define the functional requirements and user experience for both Operatives (Users) and Administrators.

---

## 🔐 1. User Authentication & Identity
*   **Secure Registration**: As an operative, I want to create a secure account so that I can manage my personal directives.
*   **Dual-Link Protection (2FA)**: As an operative, I want to enable Multi-Factor Authentication (MFA) via TOTP apps (Google/Microsoft Authenticator) or email to protect my neural data from unauthorized hacks.
*   **Profile Customization**: As an operative, I want to manage my personal protocols (categories) in my profile to mirror my individual workflow.
*   **Neural Purge**: As an operative, I want to be able to delete my account and ensure all associated directives and security artifacts are completely erased.

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

## 🕵️‍♂️ 5. Fleet Administration (Admin Panel)
*   **Operative Overview**: As an administrator, I want to see a paginated list of all operatives, including their verification status and last login history.
*   **Neural Override**: As an administrator, I want to deactivate 2FA for operatives who have lost their authentication links.
*   **Credential Reset**: As an administrator, I want to securely reset operative passwords to restore system access.
*   **System Diagnostics**: As an administrator, I want to view real-time metrics on user counts and database health to ensure grid stability.

## ✨ 6. Immersive Interface (UX)
*   **Terminal Aesthetics**: As an operative, I want to interact with a high-contrast, neon-themed interface that maintains immersion in the cyberpunk universe.
*   **Neural Manual**: As an operative, I want access to a "System Help" manual that explains level progression and system terminology in a thematic way.
*   **Responsive Link**: As an operative, I want the system to be fully functional on both workstation monitors and mobile neural links.
