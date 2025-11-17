import { WebSocket } from 'ws';
import { ExtWebSocket, ClientResponse } from './types/types';

export function sendResponse(ws: ExtWebSocket, data: ClientResponse) {
  if(ws.readyState === WebSocket.OPEN) {
    data.data = JSON.stringify(data.data);
    ws.send(JSON.stringify(data));
  }
}