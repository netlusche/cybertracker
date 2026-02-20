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
  'cyber-neonCyan': 'cyber-primary',
  'cyber-neonPink': 'cyber-secondary',
  'cyber-neonGreen': 'cyber-success',
  'cyber-neonPurple': 'cyber-accent',
  'btn-neon-cyan': 'btn-cyber-primary',
  'btn-neon-pink': 'btn-cyber-secondary',
  'btn-neon-purple': 'btn-cyber-accent',
  'text-green-500': 'text-cyber-success',
  'shadow-\\[0_0_15px_rgba\\(0,255,255,0.3\\)\\]': 'shadow-cyber-primary',
  'shadow-\\[0_0_30px_#00ffff\\]': 'shadow-cyber-primary',
  'shadow-\\[0_0_10px_#ff00ff\\]': 'shadow-cyber-secondary',
  'shadow-\\[0_0_10px_#00ffff\\]': 'shadow-cyber-primary',
  'shadow-\\[0_0_15px_#0f0\\]': 'shadow-cyber-success',
  'shadow-\\[0_0_10px_#0ff\\]': 'shadow-cyber-primary',
  'drop-shadow-\\[0_0_8px_rgba\\(0,255,255,0.6\\)\\]': 'drop-shadow-[0_0_8px_var(--theme-primary)]',
  'drop-shadow-\\[0_0_5px_rgba\\(0,255,255,0.5\\)\\]': 'drop-shadow-[0_0_5px_var(--theme-primary)]',
  'shadow-\\[0_0_10px_rgba\\(255,0,255,0.3\\)\\]': 'shadow-cyber-secondary',
  'shadow-\\[0_0_20px_#ff00ff\\]': 'shadow-cyber-secondary',
  'btn-auth-submit': '',
  'btn-cat-delete': 'bg-cyber-danger text-white rounded px-2 py-0.5 hover:brightness-110', 
  'btn-auth-orange': 'btn-cyber-primary',
  'btn-filter-reset': 'btn-cyber-primary',
  'btn-logout-orange': 'btn-cyber-danger',
  'btn-admin-blue': 'btn-cyber-info',
  'btn-admin-grey': 'bg-cyber-gray text-white',
  'btn-admin-erase': 'btn-cyber-danger'
};

walkDir('./src', function(filePath) {
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
