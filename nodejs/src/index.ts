// index.ts
import http from 'node:http';

import type { IncomingMessage, ServerResponse } from 'node:http';

const PORT = 3000;

function handleRequest(_req: IncomingMessage, res: ServerResponse): void {
   res.writeHead(200, { 'Content-Type': 'text/plain' });
   res.end('Hello world vom handle.');
}

const server = http.createServer(handleRequest);
server.listen(PORT, () => {
   console.log(`Server started on port ${PORT}`);
});
