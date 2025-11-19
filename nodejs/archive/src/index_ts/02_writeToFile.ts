// index.ts
// Write String oder JSON in Datei mit Node.js API und fs-extra
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import createDebug from 'debug';
import fs from 'fs-extra';

// eslint-disable-next-line no-underscore-dangle,@typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle,@typescript-eslint/naming-convention
const __dirname = path.dirname(__filename);

const log = createDebug('app:log');
log('hallo in der node.js test index.js');

const dir: string = path.join(__dirname, '..', 'Ressourcen');
fs.ensureDir(dir)
    .then(() => log('Verzeichniss existiert'))
    .catch((err) => log(`Verzeichniss existiert nicht: ${err}`));

const content = await fs.readFile('package.json', 'utf8');

type PackageJson = Record<string, unknown>;

// Bevorzugte Variante zum veröndern eies JSON-Objekts
/*
const n: PackageJson = JSON.parse(content);
n.scripts = n.scripts || {};
n.scripts.dev = 'Veränderter Wert';
*/

// Variante
const n: PackageJson = JSON.parse(content, (k, v) => {
    if (k === 'dev') return 'Veränderter wert';
    return v;
});

// ==========================================================================
//     1. String via fs-extra writeFile in Datei schreiben
fs.writeFile('./package_viaWriteFile.txt', 'Dies ist eine Test!', (err) => {
    if (err) {
        console.error(err);
    }
    console.info('Mit callback über fs.writeFile (fs-extra) geschrieben');
});

// ==========================================================================
//     2. JSON via  Node.js-Api in Datei schreiben
await writeFile('./package_viaWriteFile.json', JSON.stringify(n, null, 2));
console.info('Mit native writeFile geschrieben');

// ==========================================================================
//     3. JSON via fs-extra writeJSON in Datei schreiben
fs.writeJson('./package_viaWriteJson.json', n, { spaces: 2 })
    .then(() =>
        console.info('Mit promise über fs.writeJson (fs-extra) geschrieben')
    )
    .catch((err) => console.error(err));
