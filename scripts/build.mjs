import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('../', import.meta.url)));
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const path of ['index.html', 'assets', 'content', 'admin']) {
  await cp(path, `dist/${path}`, { recursive: true });
}
console.log('Static website built in dist/');
