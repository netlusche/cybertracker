#!/bin/bash
# Start PHP Server in background
php -S localhost:8000 -t . > php_server.log 2>&1 &
PHP_PID=$!
echo "PHP Server started on port 8000 (PID: $PHP_PID)"

# Start Frontend Preview (Vite)
# Vite preview runs on 4173 by default, we need to proxy the API requests.
# However, the built frontend expects /api to be relative.
# If we serve 'dist' via PHP, we don't need vite preview.
# BUT, we need to rewrite rules which the built-in PHP server doesn't support .htaccess perfectly.
# Alternative: Use Vite Dev Server which proxies to PHP.

echo "Starting Vite Dev Server..."
npm run dev
