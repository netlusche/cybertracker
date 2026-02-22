# CyberTasker Server Update Instructions (v2.0.4 → v2.1.3)

These instructions guide you through the update to **v2.1.3** (Deep Directives).

## 1. Backup (MANDATORY)
- **Files**: Backup your `api/config.php` and your database file (if using SQLite). Be sure to also back up any existing files in the `uploads/` directory to prevent data loss.

## 2. Deploy Files
1.  Upload the contents of the `dist` folder to your server.
    > [!CAUTION]
    > **CRITICAL SECURITY WARNING FOR MACOS USERS**: macOS Finder hides files starting with a dot (like `.htaccess`) by default. If you simply drag the visible files to your FTP client, the `.htaccess` files **will be left behind**, exposing your database and uploads to the public web! 
    > Press `Cmd` + `Shift` + `.` in Finder to reveal hidden files, and ensure `.htaccess` in `api/` and `api/uploads/` are successfully transferred to your web server.
2.  Ensure that the server automatically applies `0777` or appropriate write-permissions to the newly created `uploads/` folder so the backend can accept `multipart/form-data` uploads.
3.  **Overwrite all files** EXCEPT `api/config.php` and your database file.

## 3. Database Update
This update introduces a new `files` schema vector (JSON Array) to the `tasks` table.
1.  Navigate to your installer URL: `https://yourdomain.com/tasks/api/install.php`
2.  The script will automatically detect the missing `files` column and append it to your active SQLite or MySQL database.
3.  **Verification**: Ensure the "Database Schema Updated: files column added" message appears.
4.  **Security Note**: Delete `api/install.php` after verification.

## 4. Verify Update
1.  **Deep Directives Check**: Create a new task and click on it. You should see the new Markdown description area and the File Upload dropzone.
2.  **External Link Test**: Paste a URL like `https://example.com` into the description and verify it becomes clickable.
3.  **File Upload Test**: Successfully upload any test `.jpg` or `.png` to the directive and delete it again.
4.  **Static Localization**: Open `verify.html` directly in the browser after changing your language in the app to verify it reflects the native localized texts.
5.  **Pop Culture Themes**: Switch to the new Marvel, DC, or Game of Thrones themes and verify that the priority selection borders exactly match your task cards.

---

# CyberTasker Server Update Instructions (v1.9.4 → v2.0.0)

These instructions guide you through the major migration to **v2.0.0**.

## 1. Backup (MANDATORY)
- **Files**: Backup your `api/config.php` and your database file (if using SQLite).
- **Core**: Since this is a major architectural change, ensure your backup is current.

## 2. Deploy Files
1.  Upload the contents of the `dist` folder to your server.
2.  **Overwrite all files** EXCEPT `api/config.php` and your database file.
3.  **Note**: Legacy monolithic scripts (e.g., `api/auth.php`, `api/tasks.php`) are no longer used and can be safely deleted. All traffic now flows through `api/index.php`.

## 3. Database Update
**No database schema changes are required** if updating from v1.9.x.

## 4. Verify Update
1.  **System Initialization**: Load the grid and verify the "INITIALIZING SYSTEM" sequence completes successfully.
2.  **Theme Switch**: Switch to the new **Matrix** or **Weyland** themes in the Profile and verify the custom scrollbars and glow effects.
3.  **Admin Check**: Verify that the Admin Console loads and is correctly paginating the user roster.

---

# CyberTasker Server Update Instructions (v1.9.3 → v1.9.4)

---

# CyberTasker Server Update Instructions (v1.8.2 → v1.9.0)

These instructions guide you through updating to version **1.9.0**. This major update introduces Multi-Theme support.

## 1. Backup
- **Files**: Backup your `api/config.php` and your database file (if using SQLite).

## 2. Deploy Files
1.  Upload the contents of the `dist` folder to your server.
2.  **Overwrite all files** EXCEPT `api/config.php` and your database file.

## 3. Database Update (CRITICAL)
This version adds a `theme` column to the `users` table to persist visual preferences.
1.  Navigate to: `https://yourdomain.com/tasks/api/install.php`
2.  The script will automatically detect and add the missing `theme` column.
3.  **Verification**: Ensure the "Database Schema Updated: theme column added" message appears.
4.  **Security**: Delete `api/install.php` after verification.

## 4. Verify Update
1.  **Theme Selection**: Log in, open your **Profile**, and switch to **LCARS**. Verify the entire UI (fonts, colors, borders) transforms immediately.
2.  **Persistence**: Reload the page; verify the theme remains active.
3.  **Case Sensitivity**: Create or log in with a mixed-case Codename (e.g., `AlphaOne`). Verify that the exact casing is displayed in the header.
4.  **System Help**: Open Help and verify the new "Visual Interface" section is present in your chosen language.

---

# CyberTasker Server Update Instructions (v1.5.1 → v1.8.0)

These instructions guide you through updating to version **1.8.0**. This update focuses on database stability and UX polish.

## 1. Backup

- **Files**: Backup your `api/config.php` and your database file (if using SQLite).

## 2. Deploy Files

1.  Upload the contents of the `dist` folder to your server.
2.  **Overwrite all files** EXCEPT `api/config.php` and your database file.

## 3. Database Update

**No database schema changes are required.** 
However, because this version migrates critical date handling from SQL to PHP, it is highly recommended to run the installer once to verify neural link stability:
1.  Navigate to: `https://yourdomain.com/tasks/api/install.php`
2.  Review the **Diagnostic Scan** for any environment warnings.

## 4. Verify Update

1.  **Validation Check**: Open the Login or Registration form. Enter invalid data to trigger a tooltip, then click/tab into another field. Verify the tooltip clears globally.
2.  **Recovery Flow**: Test the "Forgot Access Key" flow. Acknowledging the transmission success should now redirect you directly back to the Login terminal.
3.  **Database Stability**: If you are running on MySQL, perform a manual task rotation to ensure the new PHP-based date handling is correctly processing due dates.

---

# CyberTasker Server Update Instructions (v1.4.1 → v1.5.0)

These instructions guide you through updating your existing CyberTasker server installation to version **1.5.0**. This update ensures residue-free user deletion and optimizes Admin Console readability.

## 1. Backup

- **Files**: Backup your `api/config.php` and your database file (if using SQLite).

## 2. Deploy Files

1.  Upload the contents of the `dist` folder to your server.
2.  **Overwrite all files** EXCEPT `api/config.php` and your database file.

## 3. Database Update & Diagnostics

This version ensures the `user_categories` table is correctly initialized for deletion protocols and introduces enhanced diagnostics.

1.  Navigate to your installer URL: `https://yourdomain.com/tasks/api/install.php`
2.  The script will automatically execute a **Diagnostic Scan** (PHP version, drivers, config check).
3.  It will then ensure all schema evolutions are applied.
4.  **Verification**: Scroll to the bottom to see the "Final Verification" row counts for all system tables.
5.  **Security Note**: Delete `api/install.php` after verification.

## 4. Verify Update

1.  **Admin Contrast Check**: Open the Administration Console and verify that ID markers (`#1`) and History labels (`Jo`/`Lg`) are clearly legible.
2.  **Header Alignment**: Check that the sorting arrows next to "CODENAME" and "HISTORY" are horizontally aligned and not wrapped.
3.  **2FA Setup Readability**: Open your Profile, initialize 2FA setup, and verify that the instruction text and secret keys have high contrast and clear typography.
4.  **Residue-Free Deletion**: Create a test user, add custom categories and tasks, then delete the user and verify that all associated data is removed from the database.

---

# CyberTasker Server Update Instructions (v1.4.0 → v1.4.1)

## 1. Backup

- **Files**: Backup your `api/config.php` and your database file (if using SQLite).

## 2. Deploy Files

1.  Upload the contents of the `dist` folder to your server.
2.  **Overwrite all files** EXCEPT `api/config.php` and your database file.

## 3. Database Update

**No database changes required for this version.**

## 4. Verify Update

1.  **Check Terminal Inputs**: Focus on any input field and verify the neon-cyan glow effect.
2.  **Test Registration**: Create a new account and verify the neon-blue **CyberAlert** notification.
3.  **Admin Check**: Log in as an administrator and verify the new **"2FA OFF"** button in the actions column for users with 2FA enabled.
4.  **Mobile Calendar**: On a mobile viewport, verify that the calendar is fully visible and not clipped by the task container.

---

# CyberTasker Server Update Instructions (v1.3.0 → v1.4.0)

These instructions guide you through updating your existing CyberTasker server installation to version **1.4.0**. This update introduces the "Deep Security" specialized alerts and comprehensive UI refinements.

## 1. Backup

- **Files**: Backup your `api/config.php` and your database file (if using SQLite).

## 2. Deploy Files

1.  Upload the contents of the `dist` folder to your server.
2.  **Overwrite all files** EXCEPT `api/config.php` and your database file.

## 3. Database Update

**No database changes required for this version.**

## 4. Verify Update

1.  **Login** and verify that "New Directive" creations trigger a cyan pulse animation.
2.  **Open Profile** and check that the codename/username wraps correctly to a new line.
3.  **Toggle 2FA** and ensure the button state updates immediately.
4.  **Confirm 2FA Disabling** and verify the new **Neon Pink "SECURITY ALERT"** themed modal.
5.  **Verify Cyber-Triage Sorting**: Ensure Overdue directives are pinned to the top (SIGNAL LEAK), followed by those due today (HEAT SPIKE).
6.  **Test Calendar Stability**: Open the calendar on a directive at the bottom of the grid and verify it flips upwards (`top-full`) to prevent clipping.
7.  **Test Deletion Protocol**: Verify that deleting a directive triggers the neon-blue `CyberConfirm` overlay without triggering a second browser-native dialog.
8.  **Automated Briefing**: If performing a *clean* install, verify the `admin` user receives the automated security directives.

---

# CyberTasker Server Update Instructions (v1.2.1 → v1.3.0)

These instructions guide you through updating your existing CyberTasker server installation to version **1.3.0**. This major update introduces Custom Categories, the Cyber Calendar, Search/Filters, and important database schema changes.

## 1. Backup

- **Database**: Export your current SQL database or backup your `.sqlite` file.
- **Files**: Backup your `api/config.php`.

## 2. Deploy Files

1.  Upload the contents of the `dist` folder to your server.
2.  **Overwrite all files** EXCEPT `api/config.php` and your database file.

## 3. Database Update

This update requires schema changes:
- `tasks` table: New column `due_date`.
- `user_categories` table: New table for custom categories.
- `user_stats` table: Logic updates for XP (handled automatically).

1.  Navigate to your installer URL: `https://yourdomain.com/tasks/api/install.php`
2.  The script will automatically:
    - Add the `due_date` column to the `tasks` table.
    - Create the `user_categories` table.
    - Ensure `user_stats` are correctly initialized.
3.  **Security Note**: Delete `api/install.php` after the update is complete.

## 4. Verify Update

1.  **Login** and check your **Profile**.
2.  Try adding a **Custom Category**.
3.  Create a task with a **Due Date** using the new calendar.
4.  Test the **Search Bar** and **Filters**.

---

# CyberTasker Server Update Instructions (v1.2.0 → v1.2.1)

These instructions guide you through updating your existing CyberTasker server installation to version **1.2.1**. This is a **patch release** containing UI fixes and does not require database changes.

## 1. Backup

- **Files**: Backup your `api/config.php`.

## 2. Deploy Files

1.  Upload the new `dist` folder contents to your server.
2.  Overwrite all files **EXCEPT** `api/config.php` and your database file.

## 3. Database Update

**No database changes required.**

---

# CyberTasker Server Update Instructions (v1.1.0 → v1.2.0)

These instructions guide you through updating your existing CyberTasker server installation from version **1.1.0** to **1.2.0**. This release introduces **Admin Panel 2.0** with advanced search, sorting, pagination, and user activity tracking.

## 1. Backup

Before proceeding, backup your current installation:
- **Database**: Export your current SQL database or backup your `.sqlite` file.
- **Files**: Backup your `api/config.php`.

## 2. Deploy Files

1.  Upload the contents of the `dist` folder to your server's public web directory.
2.  **IMPORTANT**: Overwrite all files **EXCEPT** `api/config.php` (and your database file if using SQLite).
    -   If you accidentally overwrite `api/config.php`, restore it from your backup.

## 3. Database Update

The update requires a new column `last_login` in the `users` table.

1.  Open your web browser.
2.  Navigate to your installation's installer URL:
    ```
    http://your-server.com/api/install.php
    ```
3.  The script will automatically detect the missing column and add it. You should see a message indicating "Database Schema Updated: last_login column added".
4.  **Security Note**: After verification, delete `api/install.php` from your server.

## 4. Verify Update

1.  Login as an Admin.
2.  Open the **Admin Console**.
3.  Verify the new **Search Bar**, **Pagination Controls**, and **History Column** are visible.


## Troubleshooting

-   **500 Error**: Check your server's error logs. Ensure `api/db.php` has the correct database connection logic for MySQL (it should default to MySQL if `DB_TYPE` is not 'sqlite').
-   **Toggle Not Saving**: Ensure `api/admin.php` has write access to the database (which it should if `api/config.php` is correct).
