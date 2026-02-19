#!/bin/bash
echo "Installing dependencies..."
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend --save-prod
echo "Checking directory..."
ls -R node_modules/react-i18next
echo "Starting server..."
pkill -f vite
nohup npm run dev > server.log 2>&1 &
echo "Waiting for server..."
sleep 15
echo "Verifying server..."
curl -I http://localhost:5174/
echo "Log file content:"
cat server.log
