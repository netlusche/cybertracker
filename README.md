# CyberTasker

**CyberTasker** is a gamified, cyberpunk-themed task management application built with **React (Vite)** and **PHP**. It supports **MySQL, MariaDB, and SQLite**, featuring a robust role-based access control (RBAC) system, gamification mechanics (XP, Levels, Badges), and secure Two-Factor Authentication (2FA).

## 🚀 Features

*   **Gamification**: Earn XP for completing tasks, level up, and track progress via a dynamic XP bar.
*   **Cyberpunk Aesthetic**: Fully custom Tailwind CSS theme with neon visuals, glassmorphism, and responsive design.
*   **Security**:
    *   **Two-Factor Authentication (2FA)**: Google Authenticator compatible (TOTP). Toggleable on/off by users.
    *   **Secure Auth**: Bcrypt password hashing, session-based authentication.
    *   **RBAC**: Admin and User roles. Admins can manage all users and data.
*   **Task Management**:
    *   **Create**: Initialize directive parameters and assign PRIORITY.
    *   **Edit**: Inline editing of task titles.
    *   **Cycle**: Click Category/Priority badges to cycle through options (High/Med/Low).
    *   **Onboarding**: New operatives receive 4 starter directives automatically.
*   **Pagination**: Efficient handling of large task lists.
*   **Admin Panel**: User management, system metrics, and safety controls.

## 🛠 Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS
*   **Backend**: Vanilla PHP 8.x (No frameworks, dependency-free)
*   **Database**: MySQL, MariaDB, or SQLite (Hybrid Support)

---

## 🆕 New in Version 1.1.0

### Strict Password Policy
*   **Admin Control**: Admins can now toggle a strict password policy on/off.
*   **Rules**: Min 12 chars, 1 Uppercase, 1 Number, 1 Special Char.
*   **Enforcement**: Applied to new registrations and password changes.

### UI Enhancements
*   **Password Visibility**: "Eye" icon added to all password fields (Login, Register, Profile).
*   **Settings Persistence**: Improved reliability of Admin Panel settings.

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
Run the installer via your browser:
`https://yourdomain.com/tasks/api/install.php`

*   **Database**: Creates all tables (users, tasks, user_stats).
*   **Admin User**: Automatically creates a default admin if none exists:
    *   **User**: `admin`
    *   **Password**: `password`
    *   **Important**: Log in and change this password immediately!

#### 6. Cleanup
Delete `api/install.php` from the server after installation.

---

## 🔒 Two-Factor Authentication (2FA)

Users can enable 2FA in their **Profile**.
1.  Scan the QR code with Google Authenticator.
2.  Enter the verification code to activate.
3.  Future logins will require a 2FA code.
4.  2FA can be disabled from the Profile (requires active session).