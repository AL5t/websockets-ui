import { clients, players, games } from "./players.js";
import { rooms } from "./players.js";
import { winners } from "./players.js";
import WebSocket, { WebSocketServer } from 'ws';
import { v4 } from 'uuid';

export function handler(ws, message, clientId) {
  switch (message.type) {
    case "reg":
      const { name, password } = JSON.parse(message.data);
      const responseData = { name: name, index: v4(), error: false, errorText: ""};

      if(players.has(name)) {
        if(players.get(name)?.password !== password) {
          responseData.error = true;
          responseData.errorText = "Invalid password";
        }
      } else {
        players.set(name, password);
        clients[clientId].name = name;
      }

      sendResponse(ws, {type: "reg", data: responseData, id: 0});

      if(!responseData.error) {
        for (const id in clients) {
          const ws = clients[id].ws;

          const availableRooms = Array.from(Object.values(rooms));
          sendResponse(ws, { type: "update_room", data: availableRooms, id: 0 });

          const winnersData = Array.from(winners.values());
          sendResponse(ws, { type: "update_winners", data: winnersData, id: 0 });
        }
      }
      
      break;
  
    case "create_room":
      const room = {
        roomId: v4(),
        roomUsers: [
          {
            name: clients[clientId].name,
            index: clientId,
          }
        ],
      };
      rooms[room.roomId] = room;
      for (const id in clients) {
        const ws = clients[id].ws;

        const availableRooms = Array.from(Object.values(rooms));
        sendResponse(ws, { type: "update_room", data: availableRooms, id: 0 });
      }
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
      attack(randomAttackData);
      break;
    
    default:
      break;
  }
}

function sendResponse(ws, data) {
  if(ws.readyState === WebSocket.OPEN) {
    data.data = JSON.stringify(data.data);
    ws.send(JSON.stringify(data));
  }
}

function addUserToRoom(data, clientId) {
  const { indexRoom } = JSON.parse(data);
  rooms[indexRoom].roomUsers.push({name: clients[clientId].name, index: clientId })
  const gameId = v4();
  
  games[gameId] = {};

  rooms[indexRoom].roomUsers.forEach(el => {
    const ws = clients[el.index].ws;
    sendResponse(ws, { type: "update_room", data: [], id: 0 });
    sendResponse(ws, { type: "create_game", data: { idGame: gameId, idPlayer: el.index }, id: 0 });
    games[gameId][el.index] = {
      ships: [],
    }
  });
  delete rooms[indexRoom];
  
}

function addShips(data) {
  const { gameId, ships, indexPlayer } = JSON.parse(data);
  const selectedGame = games[gameId];
  let gameIsReady = 0;

  selectedGame[indexPlayer].ships = ships;

  for (const playerId in selectedGame) {
    if(selectedGame[playerId].ships.length === 10) {
      gameIsReady++;
    }
  }

  if(gameIsReady === 2) {
    for (const id in clients) {
      const ws = clients[id].ws;
      sendResponse(ws, { type: "start_game", data: {ships: selectedGame[id].ships, currentPlayerIndex: id}, id: 0 });
      sendResponse(ws, { type: "turn", data: {currentPlayer: id}, id: 0 });
    }
  }
}

function attack(data) {
  const { gameId, x, y, indexPlayer } = JSON.parse(data);
  const selectedGame = games[gameId];
  let status = "miss";

  for (const playerId in selectedGame) {
    if(selectedGame[playerId] !== indexPlayer) {
      selectedGame[playerId].ships.forEach(ship => {
        let shipPositionsX = [];
        let shipPositionsY = [];

        if(ship?.length === 1) {
          shipPositionsX = [ship.position.x];
          shipPositionsY = [ship.position.y];
          
        } else {
          if(ship.direction) {

            shipPositionsX = [ship.position.x];
            shipPositionsY = [...Array.from(Array(ship.length).keys(), pos => pos + ship.position.y)];

          } else {
            shipPositionsX = [...Array.from(Array(ship.length).keys(), pos => pos + ship.position.x)];
            shipPositionsY = [ship.position.y];
          
          }          
        }

        if(shipPositionsX.includes(x) && shipPositionsY.includes(y)) {
          if(ship.length === 1) {
            status = "killed";
          } else {
            status = "shot";
          }
        }

      });
      for (const id in clients) {
        const ws = clients[id].ws;
        sendResponse(ws, { type: "attack", data: {currentPlayer: indexPlayer, status: status, position: {x: x, y: y}}, id: 0 });
        sendResponse(ws, { type: "turn", data: {currentPlayer: indexPlayer}, id: 0 });
      }
    }
  }




}