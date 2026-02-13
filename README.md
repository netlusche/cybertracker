# CyberTasker

**CyberTasker** is a gamified, cyberpunk-themed task management application built with **React (Vite)** and **PHP/MariaDB**. It features a robust role-based access control (RBAC) system, gamification mechanics (XP, Levels, Badges), and secure Two-Factor Authentication (2FA).

## 🚀 Features

*   **Gamification**: Earn XP for completing tasks, level up, and track progress via a dynamic XP bar.
*   **Cyberpunk Aesthetic**: Fully custom Tailwind CSS theme with neon visuals, glassmorphism, and responsive design.
*   **Security**:
    *   **Two-Factor Authentication (2FA)**: Google Authenticator compatible (TOTP). Toggleable on/off by users.
    *   **Secure Auth**: Bcrypt password hashing, session-based authentication.
    *   **RBAC**: Admin and User roles. Admins can manage all users and data.
*   **Task Management**: Create, categorize, prioritize, and complete directives.
*   **Pagination**: Efficient handling of large task lists.
*   **Admin Panel**: User management, system metrics, and safety controls.

## 🛠 Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS
*   **Backend**: Vanilla PHP 8.x (No frameworks, dependency-free)
*   **Database**: MariaDB / MySQL

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
*   **Any Subdirectory**: `yourdomain.com/app/`, `yourdomain.com/tasks/`, `yourdomain.com/secret-mission/` etc.

#### 1. Build the Frontend
Run the build command locally to generate the production files:
```bash
npm run build
```
This creates a `dist` folder containing the compiled frontend and all necessary assets.

#### 2. Prepare Files
Ensure your `dist` folder contains:
*   `assets/` (Compiled JS/CSS)
*   `api/` (Copy the `api` folder from root into `dist/`)
*   `index.html`
*   `.htaccess` (Copy from root into `dist/` - handles routing)
*   `vite.svg`

#### 3. Upload
Upload the **contents** of the `dist` folder to your server directory (e.g., `/public_html/tasks`).

#### 4. Configure Database
Edit `api/config.php` on the server:
```php
define('DB_HOST', 'rdbms.strato.de'); // Or your specific host
define('DB_NAME', 'DB123456');
define('DB_USER', 'U123456');
define('DB_PASS', 'YourPassword');
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