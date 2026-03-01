## Mission Objective
Investigate, diagnose, and definitively fix the persistent CI (GitHub Actions) flakiness and failures in the Playwright E2E test suite for the `CyberTasker` application, specifically focusing on `15-admin-maintenance.spec.js` and `06-extended-features.spec.js`. The fixes must pass on both SQLite and MariaDB CI runners.

After fixing, you must commit, tag the release as `v2.6.1`, and force-push to `next-up_2.6`, and ensure the fixes are also propagated to the in-progress `next-up_2.7` branch.

## Current Context & Failure Symptoms
We recently attempted to fix a bug where `15-admin-maintenance.spec.js` (TS-15.1: Purge Unverified Ghost Accounts) was failing on Retry #1/#2 in the CI environment with the error:
`Expected: 5, Received: 1` when querying `locator('tbody tr')` after searching for `Ghost_User`.

Our working theory was that the test *succeeded* in purging the 5 users on Run 1, but ran into a 5-second assertion timeout waiting for the `admin-alert-success` element because the backend database queries (84+ `DELETE` statements) took too long on the slower CI runners. We increased Playwright timeouts (`{ timeout: 30000 }`), broadened regex matchers (`/\d+/`), and fixed a French translation string in `06-extended-features.spec.js`. 

However, despite these local fixes working perfectly (`npx playwright test` passes 100% locally), **the GitHub Actions CI still fails.** 

## Your Tasks & Investigative Requirements

Your task is to take a completely fresh look at this problem. Do NOT assume the previous timeout theory was the only issue.

1.  **Deep CI vs. Local Analysis:**
    *   Examine why the test suite passes locally but fails remotely. Is there a race condition?
    *   Look closely at the Playwright configuration (`playwright.config.js`), specifically `workers: 1`, `fullyParallel: false`, and retry settings.
    *   Check for database locks or connection exhaustion (especially with SQLite in CI).

2.  **State Leakage & Test Isolation:**
    *   Investigate if `06-extended-features.spec.js` or `15-admin-maintenance.spec.js` are suffering from state leakage from earlier tests in the suite (e.g., `01-auth.spec.js`, `11-advanced-auth.spec.js`).
    *   Does a previous test delete, modify, or verify the "Ghost Accounts" before TS-15.1 even runs?
    *   Does `06-extended-features` permanently alter the application state (like language or strict password policy) in a way that breaks subsequent tests because teardown logic (`test.afterAll`) is missing or failing?

3.  **Database Logic Verification (`AdminRepository.php` & `UserRepository.php`):**
    *   Review `UserRepository->deleteAccount()`. Does it silently fail on a foreign key constraint in MariaDB that SQLite ignores (or vice-versa)? Check tables like `user_categories`, `tasks`, `user_stats`, `auth_logs`.
    *   Review `AdminRepository->purgeUnverifiedUsers()`. Is the query perfectly aligned with the E2E test expectations?

4.  **Actionable Fixes:**
    *   Implement robust waits and state cleanup in the E2E tests.
    *   Fix any underlying backend PHP SQL queries if necessary.
    *   Ensure all tests are completely isolated and atomic.

5.  **Git / Release Workflow (CRITICAL):**
    *   Once you have thoroughly verified the fixes locally (using `npx playwright test`), execute the following Git flow:
    *   Commit the fixes: `git commit -m "fix(e2e): Resolve CI suite state leakage and test isolation failures"`
    *   Tag branch `next-up_2.6`: `git tag -f v2.6.1`
    *   Push to `next-up_2.6`: `git push origin next-up_2.6 -f` and `git push origin v2.6.1 -f`
    *   **Crucial Step:** The user is actively developing on `next-up_2.7`. You MUST ensure these fixes are applied there as well. Checkout `next-up_2.7`, pull the latest, and either merge `next-up_2.6` or cherry-pick your fix commit. Resolve any conflicts, and push to `next-up_2.7`.

Start by reading the recent GitHub action error logs if available, or running the E2E suite locally to build your own mental model of the failure. Do not rely entirely on the assumptions made in the previous session.
