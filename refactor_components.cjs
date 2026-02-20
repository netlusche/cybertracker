const fs = require('fs');

const filesToRefactor = [
    './src/components/AdminPanel.jsx',
    './src/components/ProfileModal.jsx'
];

filesToRefactor.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    if (/\bfetch\(/.test(content)) {
        content = content.replace(/\bfetch\(/g, 'apiFetch(');
        modified = true;
    }

    if (modified && !content.includes('apiFetch')) {
        let importStatement = `import { apiFetch } from '../utils/api';\n`;
        content = importStatement + content;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Refactored ${filePath}`);
    }
});
