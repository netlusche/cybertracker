# Implementation Plan: Multi-language Support (i18n)

This document outlines the strategy for adding multi-language support (German/English) to the CyberTasker application.

## 1. Technology Selection
- **Library:** `i18next` with `react-i18next`
- **Detection:** `i18next-browser-languagedetector`
- **Reasoning:** Industry standard, highly flexible, supports React 19 and Vite natively.

## 2. File Structure
We will use a standard translation file structure:
- `src/i18n.js` (Config)
- `public/locales/de/translation.json` (German)
- `public/locales/en/translation.json` (English)

## 3. Implementation Steps

### Phase 1: Infrastructure
- Install dependencies: `npm install i18next react-i18next i18next-browser-languagedetector`
- Set up `src/i18n.js` configuration.
- Initialize `i18n` in `src/main.jsx`.

### Phase 2: Content Extraction
- Create initial JSON files with all hardcoded strings (Buttons, Headings, Tooltips).
- Categories and dynamic content from the database will remain in their original language for now, but UI labels (e.g., "Active Directives", "New Directive") will be translated.

### Phase 3: Component Refactoring
- Wrap components in `useTranslation` hook.
- Replace text with `t('key')` calls.
- **Components to update:** `App.jsx`, `TaskCard.jsx`, `TaskForm.jsx`, `AuthForm.jsx`, `ProfileModal.jsx`, etc.

### Phase 4: UI/UX
- Add a language switcher in the Header (DE/EN toggle).
- Ensure the Cyberpunk aesthetic is maintained with the new text.

## 4. Verification
- Manual toggle test.
- Check persistence (localStorage).
- Verify layout stability with longer German strings.
