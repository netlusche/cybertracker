const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replacements = {
    'shadow-\\[0_0_8px_#ff0000\\]': 'shadow-cyber-danger',
    'shadow-\\[0_0_5px_#00ffff\\]': 'shadow-cyber-primary',
    'shadow-\\[0_0_20px_rgba\\(0,255,255,0.2\\)\\]': 'shadow-cyber-primary',
    'shadow-\\[0_0_20px_rgba\\(0,255,255,0.3\\)\\]': 'shadow-cyber-primary',
    'shadow-\\[0_0_20px_rgba\\(255,200,0,0.5\\)\\]': 'shadow-cyber-warning',
    'shadow-\\[0_0_20px_rgba\\(0,255,255,0.5\\)\\]': 'shadow-cyber-primary',
    'shadow-\\[0_0_30px_rgba\\(255,200,0,0.3\\)\\]': 'shadow-cyber-warning',
    'shadow-\\[0_0_30px_#ff00ff\\]': 'shadow-cyber-secondary',
    'shadow-\\[0_0_15px_rgba\\(255,0,255,0.3\\)\\]': 'shadow-cyber-secondary',
    'shadow-\\[0_0_10px_rgba\\(0,255,255,0.3\\)\\]': 'shadow-cyber-primary',
    'shadow-\\[0_0_15px_#00ffff\\]': 'shadow-cyber-primary',
    'shadow-\\[0_0_15px_#ff00ff\\]': 'shadow-cyber-secondary',
    'shadow-\\[0_0_10px_rgba\\(0,255,0,0.3\\)\\]': 'shadow-cyber-success',
    'shadow-\\[0_0_15px_#00ff00\\]': 'shadow-cyber-success',
    'shadow-\\[0_0_10px_rgba\\(68,85,255,0.3\\)\\]': 'shadow-cyber-info',
    'shadow-\\[0_0_15px_#4455ff\\]': 'shadow-cyber-info',
    'shadow-\\[0_0_30px_rgba\\(0,0,0,0.9\\)\\]': 'shadow-xl',
    'shadow-\\[0_0_30px_rgba\\(0,255,255,0.3\\)\\]': 'shadow-cyber-primary',
    'shadow-\\[0_0_10px_rgba\\(57,255,20,0.3\\)\\]': 'shadow-cyber-success',
    'shadow-\\[0_0_20px_rgba\\(0,255,255,0.1\\)\\]': 'shadow-cyber-primary',
    'border-\\[#00FFFF\\]': 'border-cyber-primary',
    'bg-\\[#00FFFF\\]\\/20': 'bg-cyber-primary/20',
    'bg-\\[#00FFFF\\]': 'bg-cyber-primary',
    'text-\\[#00FFFF\\]': 'text-cyber-primary',
    'bg-\\[#FF00FF\\]': 'bg-cyber-secondary',
    'shadow-\\[0_0_10px_#FF00FF\\]': 'shadow-cyber-secondary',
    'border-\\[#ffcc33\\]': 'border-cyber-primary',
    'bg-\\[#ffcc33\\]': 'bg-cyber-primary',
    'border-yellow-500': 'border-cyber-warning'
};

walkDir('./src', function (filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        for (const [key, val] of Object.entries(replacements)) {
            content = content.replace(new RegExp(key, 'g'), val);
        }
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated ' + filePath);
        }
    }
});
