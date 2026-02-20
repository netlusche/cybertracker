# CyberTasker: Master Automated Test Plan v2.0.0

This plan outlines the end-to-end testing strategy for CyberTasker v2.0.0. The goal is to verify all functional requirements, multi-theming architecture, and OWASP-aligned security hardening using automated browser sessions and backend audits.

---

## 🧪 test-suite-01: Identity & Security Hardening

### TS-01.1: Registration & Initial Setup
- **Scenario**: Create a new operative account and verify database entry.
- **Validation**: User exists in DB; unique constraints (email/username) are enforced.

### TS-01.2: 2FA Activation (TOTP/Email)
- **Scenario**: Enable 2FA and verify secondary challenge on next login.
- **Validation**: Session is refused without the correct secondary token.

### TS-01.3: CSRF Shield Verification [NEW]
- **Scenario**: Attempt a `POST` or `DELETE` request without the `X-CSRF-Token` header.
- **Validation**: Server returns `403 Forbidden` and terminates the request.

### TS-01.4: Brute-Force Mitigation (Rate Limiting) [NEW]
- **Scenario**: Perform 5+ failed login attempts from the same IP.
- **Validation**: Server returns `429 Too Many Requests` and enforces a cooldown window.

### TS-01.5: Session Regeneration [NEW]
- **Scenario**: Monitor `PHPSESSID` before and after successful login.
- **Validation**: Session ID is regenerated to prevent session fixation attacks.

---

## 📋 test-suite-02: Directive Management (CRUD)

### TS-02.1: Initialize & Edit Directive
- **Scenario**: Create a task, modify priority/category via badges, and edit title inline.
- **Validation**: DB reflects changes; UI triggers "Confetti" on completion.

### TS-02.2: Cyber-Triage Sorting
- **Scenario**: Verify that "Overdue" tasks always appear at the top of the stream.
- **Validation**: Sorting logic respects the Triage Protocol (Status > Urgency > Priority).

---

## 🎨 test-suite-03: Visual Architecture & Multi-Theming

### TS-03.1: Theme Switching & Isolation
- **Scenario**: Switch between "Cyberpunk" and "LCARS" in the profile.
- **Validation**: CSS variables and fonts (Antonio vs Courier) update immediately.

### TS-03.2: Theme Persistence
- **Scenario**: Set theme, logout, and verify login screen aesthetics.
- **Validation**: Theme choice persists across sessions and is applied before login.

---

## 🕵️‍♂️ test-suite-04: Fleet Administration

### TS-04.1: Neural Override (Admin Controls)
- **Scenario**: Admin resets a user's password or disables 2FA.
- **Validation**: Changes are applied instantly; user can recover access.

---

## 🚀 test-suite-05: Installation & Zero-Config Portability

### TS-05.1: Security Auto-Lock [NEW]
- **Scenario**: Access `api/install.php` when the system is already initialized.
- **Validation**: Access is denied unless a valid Admin session is active.

### TS-05.2: Subdirectory Compatibility [NEW]
- **Scenario**: Install system in a subdirectory and verify verification links.
- **Validation**: `FRONTEND_URL` dynamically detects the path and includes it in links.

### TS-05.3: Diagnostic Integrity [NEW]
- **Scenario**: Run `install.php` and verify diagnostic output.
- **Validation**: Checks for PHP version, PDO drivers, and database writeability (特に macOS `tmp` redirection).

---

## 📊 Structured Test Reporting

Every execution run generates a `test_report.md` tracking pass/fail rates, backend logs, and browser recordings as proof of work.
