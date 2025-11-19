// index.ts
import createDebug from 'debug';
import fs from 'fs-extra';

const log = createDebug('app:log');
log('hallo in der node.js test index.js');

fs.ensureDir('../Ressourcen')
    .then(() => log('Verzeichniss existiert'))
    .catch((err) => log(`Verzeichniss existiert nicht: ${err}`));

const content = await fs.readFile('./Ressourcen/somefile.txt', 'utf8')
console.log(content)
