import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { WebSocketServer } from 'ws';
import { handler } from '../handler.js';
import { v4 } from 'uuid';
import { clients } from "../players.js";

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
        handler(ws, message, clientId);
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
  wsServer.clients.forEach((ws) => {
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
