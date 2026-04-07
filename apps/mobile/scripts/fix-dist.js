const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '../dist');
const client = path.join(dist, 'client');
const server = path.join(dist, 'server');

// 1. Copy client → dist
fs.cpSync(client, dist, { recursive: true });

// 2. Copy server HTML → dist
function copyHtml(dir, base = '') {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const relPath = path.join(base, item);

    if (fs.statSync(fullPath).isDirectory()) {
      copyHtml(fullPath, relPath);
    } else if (item.endsWith('.html')) {
      const dest = path.join(dist, relPath);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(fullPath, dest);
    }
  });
}

copyHtml(server);

// 3. Move index.html to root
const serverIndex = path.join(dist, 'index.html');
if (!fs.existsSync(serverIndex)) {
  fs.copyFileSync(path.join(server, 'index.html'), serverIndex);
}

console.log('✅ dist fixed for static hosting');