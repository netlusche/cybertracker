# CyberTasker 2.7.0

**CyberTasker** is a gamified, cyberpunk-themed task management application built with **React (Vite)** and **PHP**. It supports **MySQL, MariaDB, and SQLite**, featuring a robust role-based access control (RBAC) system, gamification mechanics (XP, Levels, Badges), and secure Two-Factor Authentication (2FA).

## 🌟 Key Features

*   **Gamified Task Management**: Earn XP, level up, and unlock scalable Cyber-Badges as you complete directives.
*   **Advanced Sub-Routines**: Break complex directives into smaller tasks with drag-and-drop prioritization.
*   **Global Calendar & Scheduling**: Create recurring directives with automated future "Holo-Projections".
*   **Database-Driven Localization**: Multilingual support (24 languages) synced directly to your operative profile, seamlessly carrying over from desktop to mobile.
*   **Multi-Theme Architecture**: 24 distinctive visual matrices including Cyberpunk, LCARS, Matrix, and corporate aesthetics, applied instantly without reload.
*   **Deep Security Protocols**: Enforced Two-Factor Authentication (TOTP or Email Emergency), brute-force rate-limiting, and strict Zero-Config installer lockdown.
*   **Deployment Agnosticism**: Runs via Vanilla PHP and MySQL/MariaDB or zero-config SQLite, installable anywhere from subdirectories on shared HTTP hosting to robust corporate intranets.

---

## 📦 Installation & Deployment

### Local Development

1.  **Prerequisites**: PHP, MariaDB, Node.js.
2.  **Start**:
    ```bash
    ./start_local.sh
    ```
    This script starts the PHP backend server (port 8000) and the Vite frontend dev server. Access at `http://localhost:5173`.

### ☁️ Deployment (Apache / Shared Hosting)

This project is **deployment-path agnostic**. It works seamlessly in:
*   **Root Directory**: `yourdomain.com/`
*   **Any Subdirectory**: `yourdomain.com/app/`, `yourdomain.com/tasks/`, etc.

#### 1. Build the Project
Run the build command locally. This compiles the frontend AND copies the API folder:
```bash
npm run build && cp -r api dist/
```
*(Note: Seeing `cp -r api dist/` ensures the backend logic is included in the deployment package)*

#### 2. Upload
Upload the **contents** of the `dist` folder to your server directory (e.g., `/public_html/tasks`).

> [!CAUTION]
> **CRITICAL SECURITY WARNING FOR MACOS USERS**: macOS Finder hides files starting with a dot (like `.htaccess`) by default. If you simply select all visible files in the `dist/api` folder and drag them to your FTP client, the `.htaccess` files **will be left behind**. 
> Without these files, your `cybertracker.db` SQLite database and all uploaded files are **PUBLICLY DOWNLOADABLE**! 
> Press `Cmd` + `Shift` + `.` in Finder to reveal hidden files, and ensure `.htaccess` in `api/` and `api/uploads/` are successfully transferred to your web server.

#### 3. Configure Database
Edit `api/config.php` on the server to match your database environment.

**For MySQL / MariaDB:**
```php
define('DB_TYPE', 'mysql'); 
define('DB_HOST', 'localhost'); // your host
define('DB_NAME', 'your_db');
define('DB_USER', 'your_user');
define('DB_PASS', 'your_password');
```

**For SQLite:**
```php
define('DB_TYPE', 'sqlite');
define('DB_NAME', 'path/to/database.sqlite'); // usually inside the api folder or nearby
```

#### 5. Install & Setup
Run the fully-localized installer via your browser:
`https://yourdomain.com/tasks/install.html` (or `http://localhost:5173/install.html` locally)

*   **Custom Admin Provisioning**: You can now define your Master Admin Codename and Password directly in the installer interface.
*   **Privilege Escalation Protection**: Once a Master Admin is actively registered, the installer automatically locks itself out to prevent unauthorized overrides.
*   **Language Selection**: Choose your operational language upfront for localized system bootstrapping.

#### 6. Cleanup
Delete ALL installation and diagnostic scripts from the server after the grid is stable:
- `api/install.php`
- `install.html`

---

## 🔒 Two-Factor Authentication (2FA)

Users can enable 2FA in their **Profile**.
1.  Scan the QR code with Google Authenticator.
2.  Enter the verification code to activate.
3.  Future logins will require a 2FA code.
4.  2FA can be disabled from the Profile (requires active session).