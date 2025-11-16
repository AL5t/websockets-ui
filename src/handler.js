import { register, createRoom, addUserToRoom,  addShips, attack } from './commands.js';
// import { ExtWebSocket } from "./types/types";
// import { ClientRequest } from "./types/types";

export function handler(message, clientId) {
  switch (message.type) {
    case "reg":
      register(message.data, clientId);
      break;
  
    case "create_room":
      createRoom(clientId);
      break;

    case "add_user_to_room":
      addUserToRoom(message.data, clientId);
      break;

    case "add_ships":
      addShips(message.data);
      break;

    case "attack":
      attack(message.data);
      break;
    
    case "randomAttack":
      const { gameId, indexPlayer } = JSON.parse(message.data);
      const randomX = Math.floor(Math.random() * 10);
      const randomY = Math.floor(Math.random() * 10);
      const randomAttackData = { gameId: gameId, indexPlayer: indexPlayer, x: randomX, y: randomY };
      attack(JSON.stringify(randomAttackData));
      break;

    default:
      break;
  }
}