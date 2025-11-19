// index.ts
import createDebug from 'debug';
import fs from 'fs-extra';

const log = createDebug('app:log');
log('hallo in der node.js test index.js');

fs.ensureDir('./Ressourcen')
    .then(() => log('Verzeichniss existiert'))
    .catch((err) => log(`Verzeichniss existiert nicht: ${err}`));

await fs
    .readFile('./Ressourcen/somefile', 'utf8')
    .then((content) => {
        console.log(content);
    })
    .catch((err) => {
        console.log(err);
    });
