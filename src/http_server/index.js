import path from 'node:path';
import fs from 'node:fs';
import http from "node:http"
import { v4 } from 'uuid';
import { WebSocketServer } from 'ws';
import { handler } from '../handler.js';
import { clients } from "../stores.js";
// import { ExtWebSocket } from "../types/types"

export const wsServer = new WebSocketServer({ port: 3000 });

wsServer.on('connection', (ws, request, clientId) => {
  if(!clientId) {
    clientId = v4();
    clients[clientId] = {ws: ws, name: ""};
  }
    ws.isAlive = true;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handler(message, clientId);
      } catch (error) {
        console.log('error-message');
      }
    });

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on('error', console.error);

});

const interval = setInterval(() => {
  wsServer.clients.forEach((wsData) => {
    const ws = wsData;
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wsServer.on('close', () => {
  clearInterval(interval);
});


export const httpServer = http.createServer(function (req, res) {
  const __dirname = path.resolve(path.dirname(''));
  const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
  fs.readFile(file_path, function (err, data) {
      if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
      }
      res.writeHead(200);
      res.end(data);
  });
});
