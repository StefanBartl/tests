```json
// package.json
{
  "name": "websocket",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --config src/client/vite.config.ts",
    "build": "tsc && vite build --config src/client/vite.config.ts",
    "preview": "vite preview --config src/client/vite.config.ts",
    "server": "ts-node --esm src/server/index.ts"
  },
  "devDependencies": {
    "@types/express": "^5.0.5",
    "@types/node": "^24.10.0",
    "@types/ws": "^8.18.1",
    "concurrently": "^9.2.1",
    "esbuild": "^0.27.0",
    "eslint": "^9.39.1",
    "get-port": "^6.1.2",
    "nodemon": "^3.1.10",
    "prettier": "^3.6.2",
    "ts-node": "^10.9.2",
    "typescript": "~5.9.3",
    "vite": "^7.2.2"
  },
  "dependencies": {
    "express": "^5.1.0",
    "ws": "^8.18.3",
    "get-port": "^6.1.2"
  }
}
```

```html
<!-- src/client/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="style.css" />
    <title>WKD Websocket API Training</title>
  </head>
  <body>
    <div id="mdview-root">Websocket Training loading...</div>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

```ts
// src/client/main.ts
// Simple client that connects to a WebSocket endpoint and renders incoming text messages.
// Comments are in English as requested.

// If a query parameter `port` is present (e.g. ?port=43219) it will use that port.
// Otherwise it will try to connect to localhost:43219 by default.
// It will choose wss:// when the page is served over https, otherwise ws://.

function getQueryParam(name: string): string | null {
  // Return value of query parameter `name` if present.
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

const DEFAULT_PORT = "43219";
const portFromQuery = getQueryParam("port");
const port = portFromQuery ?? DEFAULT_PORT;

// Determine scheme based on page protocol
const scheme = location.protocol === "https:" ? "wss" : "ws";

// Construct websocket URL. Uses explicit localhost so the client can be opened e.g. via vite dev server
const wsUrl = `${scheme}://localhost:${port}/ws`;

// Find UI container
const container = document.getElementById("mdview-root");
if (!container) {
  throw new Error("mdview-root element not found");
}

container.innerText = `Connecting to ${wsUrl} ...`;

// Create WebSocket connection
const ws = new WebSocket(wsUrl);

// Handle open event
ws.addEventListener("open", () => {
  // Send a hello after open (optional)
  ws.send("Hello from client");
  container.innerText = `Connected to ${wsUrl}. Waiting for messages...`;
});

// Handle incoming messages and render the first line of text
ws.addEventListener("message", (ev) => {
  // Show payload as text
  try {
    const data = typeof ev.data === "string" ? ev.data : "[binary data received]";
    container.innerText = `Received: ${data}`;
  } catch (err) {
    container.innerText = `Received message (could not decode)`;
  }
});

// Handle close and error
ws.addEventListener("close", (ev) => {
  container.innerText = `Connection closed (code=${ev.code})`;
});

ws.addEventListener("error", (ev) => {
  container.innerText = `WebSocket error (see console)`;
  console.error("WebSocket error event:", ev);
});

// Also allow clicking the container to send a sample message
let toggle = false;
container.addEventListener("click", () => {
  toggle = !toggle;
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(toggle ? "client: ping" : "client: pong");
  }
});
```

```ts
// src/client/vite.config.ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "../../dist/client"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
});
```

```ts
// src/server/TrainingServerWSS.ts
// A small TrainingServer that serves either HTTPS+WSS if certificate files are present,
// otherwise falls back to HTTP+WS. It accepts connections on /ws and sends a welcome message.
// Detailed comments are provided in English.

import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import getPort from "get-port";
import { WebSocketServer } from "ws";

export class TrainingServerWSS {
  private static instance: TrainingServerWSS | null = null;
  public server?: http.Server | https.Server;
  private wss?: WebSocketServer;
  private clients: Set<any> = new Set();
  private port: number;
  private isRunning = false;
  private useTls = false;

  // Private constructor: use getInstance() to create/start
  private constructor(port: number, useTls: boolean) {
    this.port = port;
    this.useTls = useTls;
  }

  // Singleton accessor. Preferred port defaults to 43219
  public static async getInstance(preferredPort = 43219, useTls = false) {
    if (!TrainingServerWSS.instance) {
      const port = await getPort({ port: preferredPort });
      TrainingServerWSS.instance = new TrainingServerWSS(port, useTls);
      await TrainingServerWSS.instance.start();
    }
    return TrainingServerWSS.instance;
  }

  // Reset singleton (stop server)
  public static async reset() {
    if (TrainingServerWSS.instance) {
      await TrainingServerWSS.instance.stop();
      TrainingServerWSS.instance = null;
    }
  }

  // Start HTTP or HTTPS server and attach ws server on /ws
  public async start() {
    if (this.isRunning) return;

    // Try to load cert/key from ./cert/cert.pem and ./cert/key.pem if useTls flagged
    if (this.useTls) {
      try {
        const certPath = path.resolve(process.cwd(), "cert", "cert.pem");
        const keyPath = path.resolve(process.cwd(), "cert", "key.pem");
        const cert = fs.readFileSync(certPath);
        const key = fs.readFileSync(keyPath);
        this.server = https.createServer({ cert, key });
        this.useTls = true;
      } catch (err) {
        console.warn("TLS requested but cert/key not readable. Falling back to HTTP/WS.", err);
        this.server = http.createServer();
        this.useTls = false;
      }
    } else {
      this.server = http.createServer();
    }

    // Create WebSocketServer bound to the existing server and path /ws
    this.wss = new WebSocketServer({ server: this.server, path: "/ws" });

    // Accept connections and set up minimal handlers
    this.wss.on("connection", (ws, req) => {
      // Add to clients set
      this.clients.add(ws);

      const remote = req.socket.remoteAddress ?? "<unknown>";
      console.log(`Client connected from ${remote}`);

      // Send a welcome message
      ws.send("welcome: connection established");

      // Echo back received text messages (and log)
      ws.on("message", (data) => {
        try {
          const text = data.toString();
          console.log(`Received from client: ${text}`);
          // Reply with a simple text line
          ws.send(`server echo: ${text}`);
        } catch (err) {
          console.error("Error processing message:", err);
        }
      });

      // Clean up on close/error
      ws.on("close", (code, reason) => {
        console.log(`Client disconnected (code=${code})`);
        this.clients.delete(ws);
      });
      ws.on("error", (err) => {
        console.log("WebSocket error for client:", err);
        this.clients.delete(ws);
      });
    });

    // Start listening
    await new Promise<void>((resolve) => {
      this.server?.listen(this.port, () => {
        const proto = this.useTls ? "https" : "http";
        console.log(`TrainingServerWSS is running on ${proto}://localhost:${this.port}`);
        const wsProto = this.useTls ? "wss" : "ws";
        console.log(`ws endpoint ${wsProto}://localhost:${this.port}/ws`);
        resolve();
      });
    });

    this.isRunning = true;
  }

  // Stop the server and clean up
  public async stop() {
    if (!this.isRunning) return;

    await new Promise<void>((resolve) => {
      this.wss?.close(() => {
        this.server?.close(() => {
          this.clients.clear();
          this.isRunning = false;
          resolve();
        });
      });
    });
  }

  public getPort() {
    return this.port;
  }

  public isTls() {
    return this.useTls;
  }

  // Broadcast helper (sends to all connected clients)
  public broadcast(message: string) {
    for (const c of this.clients) {
      if (c.readyState === c.OPEN) {
        c.send(message);
      }
    }
  }
}
```

```ts
// src/server/index.ts
// Entry point for the training server. Starts server on default port 43219.
// If environment variable USE_TLS=1 is set and certs exist in ./cert, server will try HTTPS/WSS.

// English comments for code clarity.

import path from "node:path";
import fs from "node:fs";
import { TrainingServerWSS } from "./TrainingServerWSS";

async function main() {
  try {
    // Determine whether to try TLS based on environment variable
    const useTls = process.env.USE_TLS === "1";

    // If TLS requested but certs are missing, log a helpful message
    if (useTls) {
      const certDir = path.resolve(process.cwd(), "cert");
      const certFile = path.join(certDir, "cert.pem");
      const keyFile = path.join(certDir, "key.pem");
      if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
        console.warn(
          `USE_TLS=1 set but cert files not found under ${certDir}. Server will fall back to HTTP/WS.`,
        );
      }
    }

    // Create and start singleton server
    const server = await TrainingServerWSS.getInstance(43219, useTls);

    console.log(`Server running on port ${server.getPort()}, TLS=${server.isTls()}`);

    // Keep process alive until interrupted. No further HTTP routes are implemented;
    // main goal is WebSocket training on /ws.
    process.on("SIGINT", async () => {
      console.log("SIGINT received — stopping server...");
      await TrainingServerWSS.reset();
      process.exit(0);
    });
  } catch (err) {
    console.error("Failed to start TrainingServerWSS:", err);
    process.exit(1);
  }
}

main();
```

Anleitung — kurz (Befehle):

* Abhängigkeiten installieren:

```bash
npm install
```

* Server starten (ohne TLS, einfache Variante):

```bash
npm run server
# oder: npx ts-node --esm src/server/index.ts
```

* Server mit TLS (lokal): Zertifikate erzeugen (OpenSSL, einfacher Self-signed Test; für Browser besser mkcert verwenden)

```bash
mkdir -p cert
# create key and cert (for testing only)
openssl req -x509 -newkey rsa:4096 -nodes -keyout cert/key.pem -out cert/cert.pem -days 365 -subj "/CN=localhost"
# then
USE_TLS=1 npm run server
```

* Client lokal testen während der Server läuft:

  * Browser öffnen und die Client-Vite-Seite (z. B. `npm run dev` für den client) aufrufen:

    * Wenn Vite dev läuft: `http://localhost:5173/src/client/index.html?port=43219`
    * Alternativ gebaute Version in `dist/client` öffnen: `http://localhost:<static-host-port>/?port=43219`
  * Der Query-Parameter `port` überschreibt den Standardport (43219). Ohne Query-Parameter versucht der Client standardmäßig `localhost:43219`.

Hinweise / Troubleshooting:

* Browser akzeptiert Self-signed certs nicht standardmäßig; bei Verwendung von TLS empfiehlt sich `mkcert` oder manuelle Ausnahme im Browser.
* Wenn die Seite über `http://` geladen wird, verwendet der Client `ws://`. Wenn die Seite über `https://` geladen wird, verwendet der Client `wss://`.
* Falls Vite dev server und WebSocket-Server auf unterschiedlichen Hosts/Ports laufen, immer `?port=<server-port>` an die Client-URL hängen.
* Logausgaben erscheinen in der Terminal-Instanz, wo `npm run server` gestartet wurde.

---

```text
Zusammenfassung der wichtigsten Dateien:
- package.json            (korrigiert, enthält "server" script)
- src/client/index.html   (kleine Korrektur)
- src/client/main.ts      (WebSocket-Client, verbindet zu ws/wss://localhost:<port>/ws)
- src/client/vite.config.ts
- src/server/TrainingServerWSS.ts  (Server, HTTPS optional, WebSocket auf /ws)
- src/server/index.ts     (Entrypoint)
```

---
