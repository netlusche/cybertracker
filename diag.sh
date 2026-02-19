#!/bin/bash
echo "Current User: $(whoami)"
echo "Current Dir: $(pwd)"
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend --save
echo "Exit Code: $?"
ls -ld node_modules/react-i18next
