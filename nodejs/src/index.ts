import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const OUTPUT = path.join(dirName, '../Ressourcen/Output.txt');

const writeableStream = fs.createWriteStream(OUTPUT);

writeableStream.on('finish', () => {
  console.info('Finished');
});

for (let i = 0; i < 100; i += 1) {
  writeableStream.write('Dies ist die erste Zeile...\n', 'utf-8', () => {
    // Callback der ausgeführt wird, wenn die Daten geschrieben wurden
  });
}

writeableStream.end();
