import { WebSocket } from 'ws';

export function sendResponse(ws, data) {
  if(ws.readyState === WebSocket.OPEN) {
    data.data = JSON.stringify(data.data);
    ws.send(JSON.stringify(data));
  }
}