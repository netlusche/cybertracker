#!/bin/bash
echo "Cleaning up port 8000 and 5174..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5174 | xargs kill -9 2>/dev/null
pkill -f "php -S localhost:8000"

echo "Starting PHP Server on port 8000..."
php -S 127.0.0.1:8000 router.php > php_server.log 2>&1 &
PHP_PID=$!
sleep 2

if ps -p $PHP_PID > /dev/null
then
   echo "PHP Server started (PID: $PHP_PID)"
else
   echo "PHP Server FAILED to start. Check php_server.log"
   cat php_server.log
   exit 1
fi

echo "Starting Vite Dev Server..."
npm run dev
