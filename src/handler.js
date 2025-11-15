import { players } from "./players";
import WebSocket, { WebSocketServer } from 'ws';

export function handler(ws, message) {
  switch (message.type) {
    case "reg":
      if(players.has(message.data.name)) {
        sendRequest(ws, message.data);
      } else {
        players.set(message.data.name, message.data.password);
      }
      break;
  
    default:
      break;
  }
}

function sendRequest(ws, data) {
  if(ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}