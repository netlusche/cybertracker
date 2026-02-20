const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('./src', function(filePath) {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Skip api.js itself
        if (filePath.includes('api.js')) return;

        let needsImport = false;
        
        // Replace fetch( with apiFetch(
        if (/\bfetch\(/.test(content)) {
            content = content.replace(/\bfetch\(/g, 'apiFetch(');
            needsImport = true;
        }

        // Specifically for App.jsx and AuthForm.jsx, we might also need setCsrfToken
        if (filePath.includes('App.jsx')) {
            content = content.replace(/setUser\(data\.user\);/g, 'setUser(data.user);\n        if (data.csrf_token) setCsrfToken(data.csrf_token);');
            needsImport = true;
        }

        if (filePath.includes('AuthForm.jsx')) {
            content = content.replace(/onLogin\(data\.user\);/g, 'if (data.csrf_token) setCsrfToken(data.csrf_token);\n            onLogin(data.user);');
            needsImport = true;
        }

        if (needsImport && !content.includes('apiFetch')) {
            // Find appropriate relative path to src/utils/api.js
            const depth = filePath.split(path.sep).length - 2; // src/App.jsx depth=0, src/components/AuthForm.jsx depth=1
            const prefix = depth === 0 ? './' : '../'.repeat(depth);
            const importPath = `${prefix}utils/api`;
            
            // Add import to top
            let importStatement = `import { apiFetch${filePath.includes('App.jsx') || filePath.includes('AuthForm.jsx') ? ', setCsrfToken' : ''} } from '${importPath}';\n`;
            content = importStatement + content;
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Refactored ${filePath}`);
        }
    }
});
