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
    *   **Create**: Initialize directives with due dates and priority.
    *   **Edit**: Inline editing of task titles.
    *   **Search & Filter**: Real-time filtering by Title, Priority, Category, and Overdue status.
    *   **Cycle**: Click Category/Priority badges to cycle through options (High/Med/Low).
    *   **Onboarding**: New operatives receive starter directives automatically.
*   **Smart Scheduling**: Custom Cyberpunk Calendar with visual deadlines.
*   **Pagination**: Efficient handling of large task lists.
*   **Admin Panel**: User management, system metrics, and safety controls.

## 🛠 Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS
*   **Backend**: Vanilla PHP 8.x (No frameworks, dependency-free)
*   **Database**: MySQL, MariaDB, or SQLite (Hybrid Support)

---
---

## 🆕 New in Version 1.4.0 (Deep Security & Polish)

### 🛡 Deep Security Refinements
*   **Specialized Alerts**: Neon-pink themed "SECURITY ALERT" modals for high-risk operations like 2FA deactivation.
*   **State Synchronization**: Real-time user context refresh ensures the UI always reflects precisely when 2FA is active.
*   **CyberConfirm Integration**: All sensitive actions (deletions, terminations, 2FA) now use custom-themed cyberpunk confirmation modals instead of native alerts.

### ✨ Tactile Polish & UX
*   **Optimized Terminal**: The "New Directive" box now pulses with a neon-cyan glow upon initialization.
*   **Confetti Protocol**: System-wide neon confetti celebration upon successful task creation.
*   **Standardized Controls**: Uniform pink `[X]` close buttons and custom `CyberSelect` dropdowns across all modals.
*   **Responsive Layouts**: Profile headers now wrap intelligently to prevent overlap on smaller viewports.

## 🆕 New in Version 1.3.0 (The "Neon" Update)

### 📂 Custom Categories & Due Dates
*   **Personal Protocols**: Create and manage your own task categories.
*   **Smart Calendar**: Integrated date picker with neon visuals.
*   **Visual Deadlines**: Clock icons and color-coded timestamps for imminent deadlines.

### 🔍 Search & Filtering
*   **Deep Search**: Locate specific tasks instantly.
*   **Advanced Filters**: Filter by Priority, Category, and Overdue status.

### ✨ Polish & Gamification
*   **Level Up**: New animations when you gain a level.
*   **Developer Tools**: Test user generator for load testing.

---

## 🆕 New in Version 1.2.1

### 🛠 Fixes & Improvements
*   **Admin Password Visibility**: Admins can now toggle password visibility when resetting user credentials.
*   **UI Polish**: Sidebar and modal inputs now share a consistent Cyberpunk aesthetic.

## 🆕 New in Version 1.2.0

### 🕵️‍♂️ Admin Panel 2.0
*   **Search & Filter**: Instantly find any operative by codename with real-time filtering.
*   **Dynamic Sorting**: Sort tables by **ID, Codename, Verification Status, or Last Login**.
*   **Pagination**: Smoothly navigate through large user databases.
*   **Activity Logs**: Track exactly when users last accessed the system.

### 🛡 Core Improvements
*   **Admin Priority**: Administrators are pinned to the top of lists for immediate access.
*   **Universal Seeding**: Robust tools to generate test data for both SQL and SQLite environments.

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

#### 6. Optional: Install Test Data
To create a test user 'Alicia' with 250 tasks for performance testing:
1.  Run the test installer: `https://yourdomain.com/tasks/api/install_test_user.php` (or via CLI: `php api/install_test_user.php`).
2.  **Login**: `Alicia` / `password`.
3.  **Security Warning**: Delete `api/install_test_user.php` immediately after use.

#### 7. Cleanup
Delete `api/install.php` and `api/install_test_user.php` from the server after installation.

---

## 🔒 Two-Factor Authentication (2FA)

Users can enable 2FA in their **Profile**.
1.  Scan the QR code with Google Authenticator.
2.  Enter the verification code to activate.
3.  Future logins will require a 2FA code.
4.  2FA can be disabled from the Profile (requires active session).