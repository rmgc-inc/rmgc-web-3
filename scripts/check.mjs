import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('../', import.meta.url)));
const content = JSON.parse(await readFile('content/site.json', 'utf8'));
let images = 0;
async function inspect(value, key = '') {
  if (Array.isArray(value)) { for (const item of value) await inspect(item); }
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) await inspect(v, k);
  } else if (typeof value === 'string' && /^(image|logo|wechatQr|backgroundImage)$/.test(key) && value) {
    if (/^https?:/.test(value)) throw Error(`Non-portable content image: ${value}`);
    await access(value.replace(/^\//, '')); images++;
  }
}
await inspect(content);
for (const file of ['index.html','admin/index.html','admin/config.yml','assets/js/main.js','assets/js/content-loader.js','assets/css/styles.css']) await access(file);
console.log(`Checked ${content.projects.length} projects and ${images} image references.`);
