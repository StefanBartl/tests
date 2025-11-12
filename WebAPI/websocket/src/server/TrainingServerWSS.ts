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
        console.log(`reaason = ${reason})`);
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
