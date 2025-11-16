import { httpServer, wsServer } from "./src/http_server/index.js";
import { clients } from "./src/players.js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
httpServer.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    for (let clientId of clients) {
      ws = clients[clientId]?.ws;
      wsServer.emit('connection', ws, request, clientId);
    }
  })
});
