import { v4 } from 'uuid';
import { clients, players, games, rooms, winners } from "./stores.js";
import { sendResponse } from './sendResponse.js';

function register(data, clientId) {
  const { name, password } = JSON.parse(data) ;
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
  sendResponse(clients[clientId].ws, {type: "reg", data: responseData, id: 0});
  if(!responseData.error) {
    for (const id in clients) {
      const ws = clients[id].ws;
      const availableRooms = Array.from(Object.values(rooms));
      sendResponse(ws, { type: "update_room", data: availableRooms, id: 0 });
      const winnersData = Array.from(winners.values());
      sendResponse(ws, { type: "update_winners", data: winnersData, id: 0 });
    }
  }
}

function createRoom(clientId) {
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
    const ws = clients[id].ws
    const availableRooms = Array.from(Object.values(rooms));
    sendResponse(ws, { type: "update_room", data: availableRooms, id: 0 });
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
      field: Array.from({length: 10}, () => Array(10).fill("empty")),
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
      selectedGame[id].ships.forEach(ship => {
        if(ship.direction === false) {
          for (let i = ship.position.x; i < ship.length; i++) {
            games[gameId][id].field[ship.position.y][i] = "ship";
          }
        } else {
          for (let i = ship.position.y; i < ship.length; i++) {
            games[gameId][id].field[i][ship.position.x] = "ship";
          }
        }
      });
      // console.log("field", games[gameId][id].field);

      const ws = clients[id].ws;
      sendResponse(ws, { type: "start_game", data: {ships: selectedGame[id].ships, currentPlayerIndex: id}, id: 0 });
      sendResponse(ws, { type: "turn", data: {currentPlayer: id}, id: 0 });
    }
  }
}

function attack(data) {
  const { gameId, x, y, indexPlayer } = JSON.parse(data);
  const selectedGame = games[gameId];
  let status = "";

  for (const playerId in selectedGame) {
    if(playerId !== indexPlayer) {
      if(games[gameId][playerId].field[y][x] === "ship") {
        status = "shot";
        games[gameId][playerId].field[y][x] = "shot";
      } else {
        status = "miss";
        games[gameId][playerId].field[y][x] = "miss";
      }
      // selectedGame[playerId].ships.forEach(ship => {
      //   let shipPositionsX = [];
      //   let shipPositionsY = [];

      //   if(ship?.length === 1) {
      //     shipPositionsX = [ship.position.x];
      //     shipPositionsY = [ship.position.y];
          
      //   } else {
      //     if(ship.direction) {

      //       shipPositionsX = [ship.position.x];
      //       shipPositionsY = [...Array.from(Array(ship.length).keys(), pos => pos + ship.position.y)];

      //     } else {
      //       shipPositionsX = [...Array.from(Array(ship.length).keys(), pos => pos + ship.position.x)];
      //       shipPositionsY = [ship.position.y];
          
      //     }          
      //   }

      //   if(shipPositionsX.includes(x) && shipPositionsY.includes(y)) {
      //     if(ship.length === 1) {
      //       status = "killed";
      //       games[gameId][playerId].field[y][x] = "killed";
      //     } else {
      //       status = "shot";
      //       games[gameId][playerId].field[y][x] = "shot";
      //     }
      //   } else {
      //     status = "miss";
      //     games[gameId][playerId].field[y][x] = "miss";
      //   }

      // });
      for (const id in clients) {
        const ws = clients[id].ws;
        sendResponse(ws, { type: "attack", data: {currentPlayer: indexPlayer, status: status, position: {x: x, y: y}}, id: 0 });
        sendResponse(ws, { type: "turn", data: {currentPlayer: playerId}, id: 0 });
      }
    }
  }
}

export {
  register,
  createRoom,
  addUserToRoom,
  addShips,
  attack
}