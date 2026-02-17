# Multi-Theme Implementation Plan

This plan outlines the steps to introduce theme support to CyberTasker, featuring a new "Star Trek: The Next Generation" (LCARS) inspired theme. Theme settings will be persisted in the database per user.

## Proposed Changes

### Database Schema

#### [MODIFY] [install.php](file:///Users/frank/Antigravity/CyberTasker/api/install.php)
- Add `theme` column to the `users` table with a default value of `'cyberpunk'`.

### Backend API

#### [MODIFY] [auth.php](file:///Users/frank/Antigravity/CyberTasker/api/auth.php)
- Update login and session checks to include the `theme` in the user data returned to the frontend.
- Add a new action `update_theme` to save the user's theme preference.

### Core Infrastructure

#### [NEW] [ThemeContext.jsx](file:///Users/frank/Antigravity/CyberTasker/src/utils/ThemeContext.jsx)
- Create a React Context to manage the current theme state.
- Initialize the theme from the logged-in user's data.
- Provide a `setTheme` function that updates both the local state and the database via the API.

#### [MODIFY] [main.jsx](file:///Users/frank/Antigravity/CyberTasker/src/main.jsx)
- Wrap the `App` component with the `ThemeProvider`.

#### [MODIFY] [index.css](file:///Users/frank/Antigravity/CyberTasker/src/index.css)
- Refactor existing `@theme` and `:root` to use CSS variables that can be overridden by theme classes.
- Define `.theme-cyberpunk` (current look) and `.theme-lcars` classes.
- Implement LCARS-specific styling:
  - Rounded-pill shapes for buttons.
  - LCARS color palette (Gold, Orange, Purple, Blue).
  - High-contrast text for readability.

### UI Components

#### [MODIFY] [ProfileModal.jsx](file:///Users/frank/Antigravity/CyberTasker/src/components/ProfileModal.jsx)
- Add a "Visual Interface" section.
- Implement a dropdown to switch between "Cyberpunk" and "LCARS" themes.

#### [MODIFY] [App.jsx](file:///Users/frank/Antigravity/CyberTasker/src/App.jsx)
- Apply the theme class to the main container or root element based on the current theme from context.

## Verification Plan

### Automated Tests
- None planned for UI themes, but will manually verify DOM class application.

### Manual Verification
1. **Theme Switching**: Open Profile Modal, change theme, and verify the UI updates immediately across all screens.
2. **Database Persistence**: Change theme, log out, log back in (or refresh), and ensure the selection persists from the database.
3. **LCARS Aesthetics**: Verify that the LCARS theme follows the ship console aesthetic while remaining highly readable.
4. **Visual Layout**: Ensure LCARS "capsule" shapes don't break existing layouts or button alignments.
