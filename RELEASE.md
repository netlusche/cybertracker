# CyberTasker v1.1.0 - Release Notes

## 🛡 Security: Strict Password Policy
- **Admin Control**: New "Strict Password Policy" toggle in the Admin Console.
- **Enforcement**: When enabled, passwords must be at least 12 characters and include uppercase, numbers, and special symbols.
- **Cross-Form Validation**: Policy is enforced during registration, password resets, and profile updates.

## 👁 UI/UX: Password Visibility
- **Eye Toggles**: Added visibility toggles (eye icons) to all password fields across the application for improved accessibility.
- **Responsive Fixes**: Adjusted the "New Directive" form for better layout on small mobile screens.

## ⚙️ Backend & Database
- **Auto-Update**: `api/install.php` now automatically migrates existing databases to include the `system_settings` table.
- **Improved Settings Engine**: Refactored the settings API to prevent caching issues and ensure toggle state consistency.
- **Dual Database Support**: seamless support for MariaDB (production) and SQLite (development).

---
*For update instructions, see [UPDATE_INSTRUCTIONS.md](./UPDATE_INSTRUCTIONS.md).*
