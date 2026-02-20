<?php
// api/index.php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/csrf.php';

// Session is already started via csrf.php

// CSRF verification moved below

header("Content-Type: application/json");

// Require core
require_once __DIR__ . '/Router.php';
require_once __DIR__ . '/controllers/Controller.php';

// Require controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/TaskController.php';
require_once __DIR__ . '/controllers/AdminController.php';
require_once __DIR__ . '/controllers/CategoryController.php';
require_once __DIR__ . '/controllers/UserController.php';

$router = new Router();

// --- Auth Routes ---
$router->get('auth', [AuthController::class , 'checkStatus']);
$router->post('auth/login', [AuthController::class , 'login']);
$router->post('auth/logout', [AuthController::class , 'logout']);
$router->post('auth/register', [AuthController::class , 'register']);
$router->post('auth/verify_email', [AuthController::class , 'verifyEmail']);
$router->post('auth/update_email', [AuthController::class , 'updateEmail']);
$router->post('auth/change_password', [AuthController::class , 'changePassword']);
$router->post('auth/request_password_reset', [AuthController::class , 'requestPasswordReset']);
$router->post('auth/reset_password', [AuthController::class , 'resetPassword']);
$router->post('auth/delete_account', [AuthController::class , 'deleteAccount']);
$router->post('auth/update_theme', [AuthController::class , 'updateTheme']);

// --- 2FA Routes ---
$router->get('auth/setup_2fa', [AuthController::class , 'setup2fa']);
$router->post('auth/enable_2fa', [AuthController::class , 'enable2fa']);
$router->get('auth/setup_email_2fa', [AuthController::class , 'setupEmail2fa']);
$router->post('auth/enable_email_2fa', [AuthController::class , 'enableEmail2fa']);
$router->post('auth/disable_2fa', [AuthController::class , 'disable2fa']);
$router->post('auth/verify_2fa', [AuthController::class , 'verify2fa']);
$router->post('auth/resend_email_2fa', [AuthController::class , 'resendEmail2fa']);

// --- Task Routes ---
$router->get('tasks', [TaskController::class , 'index']);
$router->post('tasks', [TaskController::class , 'store']);
$router->put('tasks', [TaskController::class , 'update']);
$router->delete('tasks', [TaskController::class , 'destroy']);

// --- Admin Routes ---
$router->get('admin/users', [AdminController::class , 'listUsers']);
$router->get('admin/settings', [AdminController::class , 'getSettings']);
$router->post('admin/users/toggle_verified', [AdminController::class , 'toggleVerified']);
$router->post('admin/users/role', [AdminController::class , 'updateRole']);
$router->post('admin/users/delete', [AdminController::class , 'deleteUser']);
$router->post('admin/users/reset_password', [AdminController::class , 'resetPassword']);
$router->post('admin/users/disable_2fa', [AdminController::class , 'disable2fa']);
$router->post('admin/settings', [AdminController::class , 'updateSetting']);

// --- Category Routes ---
$router->get('categories', [CategoryController::class , 'index']);
$router->post('categories', [CategoryController::class , 'store']);
$router->post('categories/set_default', [CategoryController::class , 'setDefault']);
$router->put('categories', [CategoryController::class , 'update']);
$router->delete('categories', [CategoryController::class , 'destroy']);

// --- User Routes ---
$router->get('user/stats', [UserController::class , 'getStats']);

// Dispatch
$method = $_SERVER['REQUEST_METHOD'];
$route = $_GET['route'] ?? '';

// CSRF Protection
$csrfExemptRoutes = [
    'auth/login',
    'auth/register',
    'auth/verify_email',
    'auth/request_password_reset',
    'auth/reset_password',
    'auth/verify_2fa',
    'auth/resend_email_2fa'
];

if (!in_array($route, $csrfExemptRoutes)) {
    verify_csrf_token();
}

$router->dispatch($method, $route);