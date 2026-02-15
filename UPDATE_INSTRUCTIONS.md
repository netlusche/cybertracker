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
