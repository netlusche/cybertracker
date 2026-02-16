# CyberTasker v1.4.1 - Admin Override & UI Polish

**Release Date:** 2026-02-16

This update introduces administrative override capabilities for 2FA, a custom alert system to replace native browser dialogs, and critical mobile layout fixes for the scheduling system.

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
