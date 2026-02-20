# CyberTasker: Master Automated Test Plan

This plan outlines the end-to-end testing strategy for CyberTasker v1.8.0. The goal is to verify all functional requirements from the User Stories and Release Notes using automated browser scripts.

## 🧪 test-suite-01: Identity & Security

### TS-01.1: Registration & Initial Setup
- **Scenario**: Create a new operative account.
- **Steps**:
    1. Navigate to `/`.
    2. Click "No Identity? Establish Link".
    3. Enter unique Codename, Com-link (Email), and Access Key.
    4. Verify success `CyberAlert`.
- **Validation**: User exists in DB; can reach the dashboard.

### TS-01.2: 2FA Activation (TOTP/Email)
- **Scenario**: Enable and verify 2FA protection.
- **Steps**:
    1. Open Profile Modal.
    2. Toggle 2FA switch.
    3. Capture QR/Secret or verify Email delivery.
    4. Input code and confirm activation.
- **Validation**: Login now requires a secondary token.

### TS-01.3: Password Reset (Generic Messaging)
- **Scenario**: Request recovery and reset password.
- **Steps**:
    1. Click "Forgot Access Key?".
    2. Enter email.
    3. Verify generic success message ("If this email exists...").
    4. Check `api/mail.log` for the reset link.
- **Validation**: New password allows login; old one is rejected.

### TS-01.4: Strict Password Policy Enforcement
- **Scenario**: Verify that weak passwords are rejected when the policy is active.
- **Steps**:
    1. Login as `admin`.
    2. Enable "Strict Password Policy" in Admin Console.
    3. Logout.
    4. Attempt registration with a weak password (e.g., `pass123`).
    5. Verify error message "Password Policy Violation".
- **Validation**: System enforces complexity requirements (12+ chars, Upper, Number, Special).

---

## 📋 test-suite-02: Directive Management (CRUD)

### TS-02.1: Initialize & Edit Directive
- **Scenario**: Create a task and modify it inline.
- **Steps**:
    1. Enter title in terminal.
    2. Change Priority and Category via cyclic badge clicks.
    3. Set Due Date via `CyberCalendar`.
    4. Submit and verify "Confetti" trigger.
    5. Edit title inline and save.
- **Validation**: DB reflects all changes; UI updates instantly.

### TS-02.2: Cyber-Triage (Sorting & Filtering)
- **Scenario**: Verify urgency sorting and filter logic.
- **Steps**:
    1. Create an Overdue task and a Future task.
    2. Verify Overdue is at the top.
    3. Search for a specific keyword.
    4. Filter by priority "HIGH".
- **Validation**: UI correctly hides non-matching directives.

### TS-02.3: Data Stream Pagination (Stress Test)
- **Scenario**: Verify frontend pagination with large datasets.
- **Steps**:
    1. Generate 250 random directives via backend script.
    2. Navigate to dashboard.
    3. Verify pagination controls appear.
    4. Switch through pages and verify task loading.
- **Validation**: System remains responsive; all tasks accessible via pages.

---

## 📈 test-suite-03: Gamification & Progression

### TS-03.1: XP & Level-Up
- **Scenario**: Earn XP and trigger leveling.
- **Steps**:
    1. Note current XP/Level.
    2. Complete multiple tasks.
    3. Reach level-up threshold.
- **Validation**: Progress bar fills; "Level Up" alert/pulse triggers; XP persists after refresh.

### TS-03.2: Neural Progression Integrity
- **Scenario**: Verify level-up logic with batch completions.
- **Steps**:
    1. Generate 10 HIGH priority tasks (50 XP each).
    2. Mark all as DONE.
    3. Verify level increases as expected (Level 1 -> Level 2+).
- **Validation**: Rank badge and XP bar reflect correct mathematical progression.

---

## 🕵️‍♂️ test-suite-04: Fleet Administration

### TS-04.1: Admin Console & Neural Override
- **Scenario**: Admin manages user access.
- **Steps**:
    1. Login as `admin`.
    2. Search for the test user created in TS-01.
    3. Disable 2FA via "Neural Override".
    4. Reset user password via Admin interface.
- **Validation**: User can login without 2FA and with the admin-assigned password.

### TS-04.2: Fleet Pagination & Cleanup
- **Scenario**: Verify admin console scalability.
- **Steps**:
    1. Generate 40 dummy users via backend script.
    2. Open Admin Console.
    3. Verify pagination controls for users list.
    4. Delete the dummy users (cleanup).
- **Validation**: Admin console paginates correctly; bulk deletion/cleanup is verified.

---

## 🌐 test-suite-05: Localization & UX

### TS-05.1: Multilingual Neural Link
- **Scenario**: Change language and verify UI localization.
- **Steps**:
    1. Toggle Language Switcher (DE, EN, NL, etc.).
    2. Verify all buttons, placeholders, and alerts update.
- **Validation**: `i18next` correctly loads all namespaces.

---

## 🎨 test-suite-07: Visual Architecture & Themes

### TS-07.1: Theme Switching & Application
- **Scenario**: Switch visual interfaces in the profile.
- **Steps**:
    1. Open Profile Modal.
    2. Select "LCARS" theme.
    3. Observe immediate transition of colors, borders, and fonts.
    4. Close Modal.
- **Validation**: UI elements (Header, Cards, Buttons) adopt the LCARS palette (#ffcc33, #ffaa00, #4455ff).

### TS-07.2: Theme Persistence & Jack-In
- **Scenario**: Verify theme preference is stored.
- **Steps**:
    1. Set theme to "LCARS".
    2. Reload page. Verify LCARS stays active.
    3. Logout. Verify login screen uses LCARS aesthetics (Orange "Jack In" button).
    4. Log in. Verify dashboard is still in LCARS mode.
- **Validation**: User preference is persisted in the database and local storage.

### TS-07.3: Adaptive Layout (LCARS Header)
- **Scenario**: Verify layout optimization for LCARS.
- **Steps**:
    1. Activate LCARS theme.
    2. Inspect header navigation.
- **Validation**: Language Switcher is stacked below the action buttons (Help, Profile, Logout) to prevent overlapping the title.

### TS-07.4: Theme-Authentic Typography
- **Scenario**: Verify font switching protocol.
- **Steps**:
    1. Activate LCARS: Verify use of "Antonio" font on all grid elements.
    2. Activate Cyberpunk: Verify use of "Courier New" on all grid elements.
- **Validation**: Fonts are correctly limited to their respective theme scopes.

---

## 📁 test-suite-06: Protocol & Category Management

### TS-06.1: Neural Protocol Initialization (Add Category)
- **Scenario**: Create a new custom category.
- **Steps**:
    1. Open Profile Modal.
    2. Enter "NEW_LOG" in the protocol input.
    3. Click "ADD".
- **Validation**: "NEW_LOG" appears in the list; available in `TaskForm` dropdown.

### TS-06.2: Rename Protocol
- **Scenario**: Update an existing category name.
- **Steps**:
    1. Click "Edit" (pencil icon) next to a category.
    2. Change name to "ALPHA_LOG".
    3. Confirm.
- **Validation**: Name is updated in the list and in the database.

### TS-06.3: Neural Defaulting (Set Default)
- **Scenario**: Set a custom category as the system default.
- **Steps**:
    1. Click "Star" icon next to a custom category.
    2. Observe "DEFAULT" pulse badge.
- **Validation**: New tasks automatically select this category by default.

### TS-06.4: Protocol Purge (Delete)
- **Scenario**: Remove a category.
- **Steps**:
    1. Click "Trash" icon.
    2. Confirm in `CyberConfirm` modal.
- **Validation**: Category is removed; tasks previously using it fallback to default or remain unaffected (depending on backend logic).

---

## 📊 Structured Test Reporting

For every execution run, a detailed `test_report.md` will be generated with the following structure:

1. **Executive Summary**: Overall pass/fail rate and critical issues.
2. **Environment Details**: Version (v1.8.0), DB Type (SQLite), and Timestamp.
3. **Detailed Results**: 
    - **Test ID (e.g., TS-01.1)**: Status [PASS/FAIL]
    - **Actions taken**: Brief list of steps performed by the agent.
    - **Artifacts**: Links to browser recordings or logs (e.g., `mail.log`) as proof of work.
4. **Conclusion & Recommendations**: Next steps for stabilization or feature expansion.

---

## 🚀 Execution Strategy for Antigravity

To run this plan, I will:
1. Use the `browser_subagent` for UI interactions.
2. Use `run_command` with `curl` or `php` scripts for backend state checks.
3. Use `grep` on `api/mail.log` to handle non-sent email verification.
4. **Bug Reporting Policy**: If a bug is discovered during execution, **do not attempt to fix it immediately**. Instead, document the failure in the `test_report.md`, complete the remaining tests, and list all identified fixes in the final report summary. I will then ask the user for permission to execute the fixes.
