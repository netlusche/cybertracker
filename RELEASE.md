# CyberTasker v1.4.0 - Deep Security & Polish

**Release Date:** 2026-02-15

This update focuses on deepening the application's security posture through specialized alerts and comprehensive UI/UX refinements for a smoother, more tactile operative experience.

## 🛡 Deep Security Refinements
- **Specialized Security Alerts**: High-risk operations (such as disabling 2FA) now trigger a focused neon-pink "SECURITY ALERT" modal to ensure critical awareness.
- **True-State Sync**: Fixed a synchronization issue where the 2FA status wouldn't update immediately. The grid now re-fetches the operative's authentication state after every profile change.
- **CyberConfirm Integration**: Native browser confirmation alerts have been scrapped in favor of high-immersion, cyberpunk-themed `CyberConfirm` modals for all critical data manipulations.

## ✨ Tactile Polish & UX
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
