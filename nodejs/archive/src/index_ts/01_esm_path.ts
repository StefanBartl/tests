// index.ts
import createDebug from 'debug';
import fs from 'fs-extra';

// derive __dirname from ESM's import.meta.url
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const log = createDebug('app:log');
log('hallo in der node.js test index.js');

const dir = path.join(__dirname, '..', 'Ressourcen');
fs.ensureDir(dir)
    .then(() => log('Verzeichniss existiert'))
    .catch((err) => log(`Verzeichniss existiert nicht: ${err}`));

const content = await fs.readFile(path.join(dir, 'somefile.txt'), 'utf8');
console.log(content)
