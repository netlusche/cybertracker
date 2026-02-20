# CyberTasker Refactoring Plan

This document outlines the strategic roadmap for migrating the codebase from a rapid-prototyping architecture to a scalable, maintainable "Clean Code" structure.

## 1. Backend: Controller Migration & Routing (Priority: High)
**The Problem:** Files like `api/auth.php` and `api/tasks.php` are monolithic scripts executing procedural logic via massive `if/else` chains.
**The Solution:**
- Implement a lightweight Vanilla PHP Router.
- Encapsulate logic into Class-based Controllers (e.g., `AuthController`, `TaskController`).
- Extract the core business logic from the HTTP request/response handling.

## 2. Backend: Database Repositories (Priority: Medium)
**The Problem:** Raw SQL statements (`$pdo->prepare("SELECT...")`) are tightly coupled directly inside endpoint logic.
**The Solution:**
- Implement the Repository Pattern.
- Create classes like `UserRepository.php` and `TaskRepository.php` to handle all SQL queries.
- The Controllers will call the Repositories, decoupling the database logic from the application logic.

## 3. Frontend: Custom Hooks (Priority: High)
**The Problem:** `App.jsx` serves as a "God Object," managing authentication state, data fetching, filtering, modal state, and the entire layout grid simultaneously.
**The Solution:**
- Extract state management into React Custom Hooks.
- `useAuth()`: Manages login, logout, 2FA states, and CSRF token negotiation.
- `useTasks()`: Manages fetching, creating, sorting, and deleting tasks.
- Slim down `App.jsx` to primarily serve as the visual layout coordinator.

## 4. Frontend: "Dumb" UI Components (Priority: Low/Medium)
**The Problem:** Common UI elements (Buttons, Inputs, Cards) have duplicated and hardcoded Tailwind utility classes scattered across multiple files.
**The Solution:**
- Build a standardized internal UI Library (`src/components/ui/`).
- Create `<CyberButton>`, `<SystemModal>`, `<DataGrid>`, etc.
- Components like `AdminPanel.jsx` will assemble these standard blocks rather than managing their own DOM structure and padding.
