# CyberTasker v3.0.0 - Operative Manual

![CyberTasker Logo](../images/logo_big.png)

Welcome, Operative, to **CyberTasker** – your central hub for task management, precision planning, and systemic progression. This comprehensive manual details every module of your neural interface.

---

## 1. System Initialization & Connectivity

### First Login & Setup
If you are logging into a fresh installation, the system will detect an empty database and flash a **"SYSTEM EMPTY"** warning. Follow the terminal prompts to register the initial Master Admin account.
Once initialized, external Operatives can register their own accounts (if enabled by Admin) or log in with assigned credentials via the highly secure, animated login portal.

![CyberTasker System Initialization](../images/1_System Initianalization.png)

## 2. The Global Dashboard

The Dashboard is your primary workspace and HUD (Heads Up Display).

![CyberTasker Dashboard Structure](../images/1-1_Dashboard.png)
![CyberTasker Dashboard Filters](../images/1-2_Dashboard.png)

*   **Quick Entry Terminal:** Simply type a new task into the main input field (`ADD NEW DIRECTIVE...`) and press `Enter`.
*   **Directives List:** All active tasks appear as distinct data cards. Mark them as complete by clicking their checkbox to upload the data and clear the queue.
*   **Filter Matrix:** Above the list, utilize the quick-filter pills (e.g., "All", "Overdue", "High Priority") to instantly isolate specific directives. Click the unified **"Reset"** icon to quickly clear all active filters.
*   **Rapid Search:** Press `/` anywhere to focus the search bar and filter your directives in real-time. Press `N` to quickly jump back to creating a new directive.
*   **Batch Actions:** You can select multiple directives simultaneously using the checkboxes on the left of each card. A command bar will appear at the bottom, allowing you to bulk-complete, bulk-delete, or bulk-categorize missions in one sweep.

## 3. Directive Dossiers (Task Details)

For complex operations, click the **"DETAILS"** button on any Task Card to open its encrypted Dossier.

![Directive Dossier](../images/2_Dossier.png)

*   **Mission Parameters:** Add multi-line, detailed descriptions using Markdown. Format your text with bolding, lists, and code blocks.
*   **Priority Flags:** Tag tasks as `Low`, `Medium`, or `HIGH` priority. High priority tasks trigger localized visual alerts across your HUD.
*   **Temporal Deadlines (Due Dates):** Assign absolute deadlines to directives.
*   **Custom Statuses:** Update the operational lifecycle of your task (e.g., from "Open" to "In Progress" or "Under Review") via the interactive status dropdown.
*   **Sub-Routines:** Break complex directives down into actionable steps.
    *   Add new sub-routines.
    *   Edit them inline simply by clicking on the text.
    *   **Drag & Drop:** Reorder them visually to map out your execution plan (fully touch-native for iOS and Android).
*   **Dossier Notes:** Maintain a chronological, timestamped log of progress updates and operational notes independently from the primary execution description.
*   **Uplinks:** Securely attach necessary schematics or files directly to the task via the Uplink interface.

## 4. Gamification & Progression

As an Operative, your efficiency is tracked.
*   **Leveling System:** Completing directives yields **EXP** (Experience Points). Filling your progress bar levels you up.
*   **Cyber-Badges:** Your operational efficiency determines your Tier (Novice to Prime) and Title (Script Kiddie to Singularity). Your current badge is displayed prominently above your XP progress bar. 
![CyberTasker Gamification](../images/4_Gamification.png)

## 5. Holo-Projections (Global Calendar)

Maintain long-term strategic oversight by accessing the **Calendar** via the left Navigation Panel.

![CyberTasker Gamification](../images/5_Holo Projections.png)

*   **Monthly Overview:** View all tasks that have an assigned due date in a classic grid layout.
*   **Predictive Recurrence:** CyberTasker calculates recursive tasks (Daily, Weekly, Monthly) and projects them into the calendar matrix automatically. This allows you to differentiate between one-off tasks and recurring systemic duties.

## 6. Operative Data (User Profile)

Access your **Profile** to configure your personal interface. It contains multiple modules accessible by scrolling.

**Security & Connectors:**
![User Profile Top](../images/3-1_User_Profile.png)
*   **Bio-Lock Security (2FA):** Enable and enforce two-factor authentication via Authenticator Apps or Email. If administrators enforce global Email 2FA, you will see a flashing "SYSTEM DIRECTIVE [Admin Policy]" banner here until you set up a dedicated TOTP app.
*   **Contact Channel:** Configure your Com-Link (Email) for notifications. All system emails respond dynamically to your chosen UI language.
*   **Live Calendar WebFeed (WebCal):** Generate a highly secure, private URL (`webcal://...`) to dynamically sync all your active directives and deadlines instantly with standard devices like Google Calendar or Apple iOS.
*   **Localization (Multi-Language):** CyberTasker's UI can be hot-swapped between 24 localized language packs, updating everything including localized dashboard components. Your selection synchronizes deeply with the neural database across all devices.

**Customization & Termination:**
![User Profile Middle](../images/3-2_User_Profile.png)
![User Profile Bottom](../images/3-3_User_Profile.png)
*   **Theme Selection:** Hot-swap your interface's visual theme. Options include 24 unique visual matrices such as Cyberpunk, Matrix, LCARS, Computerwelt, and Megacorp Executive.
*   **Update Cypher:** Update your system password. **Security Note:** Changing your access key will forcefully invalidate all your active sessions globally, requiring immediate re-authentication.
*   **Danger Zone:** Permanently terminate your identity and wipe allied directives.

## 7. System Help (Integrated Database)

The **Help** module acts as an offline archive of these instructions. If you momentarily lose connection to external databases, consult the System Help tooltips dynamically embedded throughout the application, or read the full manual in the interface.

![System Help](../images/7_System_Help.png)

## 8. Alternative Operative Views

Sometimes the standard dashboard provides too much sensory input during critical missions.

*   **Agent Focus Mode:** Toggle the "Zen Mode" icon near the primary creation input. This completely hides the standard list queue, navigation, and sidebar, maximizing your single highest-priority directive in a prominent Hero Card layout to eliminate distractions.
![Agent Focus Mode](../images/4_Agent_Focus_Mode.png)

*   **Kanban Board:** Click the `KANBAN` toggle on the dashboard to transpose your tasks from a list to an alternative visual matrix. Tasks map directly to the custom statuses you define (e.g. "To Do" | "In Progress" | "QA" | "Done"). You can drag-and-drop the data cards seamlessly across columns to execute your workflow stages.
![Kanban Board](../images/5_Kanban_Board.png)

*   **Batch Actions:** When selecting multiple directives utilizing the checkboxes, a command bar appears for batch operations.
![Batch Actions Bar](../images/6_Batch_Actions_Bar.png)

## 9. Admin Terminal

Users with `admin` clearance possess access to the restricted Admin Panel.

![Admin Terminal](../images/9_Admin_Panel.png)

*   **Operative Overrides:** Forcefully alter user roles, reset passwords, or suspend rogue operatives.
*   **2FA Management (TOTP):** Admins can mandate and enforce Two-Factor Authentication system-wide.
*   **System Integrity:** View the current CyberTasker system build version to ensure your grid is synchronized.

---
> **[END OF TRANSMISSION]**
> CyberTasker Core Logic v2.9 (The Kanban Update)
