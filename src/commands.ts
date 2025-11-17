import { v4 } from 'uuid';
import { clients, players, games, rooms, winners } from "./stores.ts";
import { sendResponse } from './sendResponse.ts';
import { searchRemainingShips, searchCrippledShip, searchKilledShip, markCells, } from './ships.ts';

function register(data: string, clientId: string) {
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

function createRoom(clientId: string) {
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

function addUserToRoom(data: string, clientId: string) {
  const { indexRoom } = JSON.parse(data);
  rooms[indexRoom].roomUsers.push({name: clients[clientId].name, index: clientId });
  const gameId = v4();
  
  games[gameId] = {};

  for (const el of rooms[indexRoom].roomUsers) {
    const ws = clients[el.index].ws;
    sendResponse(ws, { type: "update_room", data: [], id: 0 });
    sendResponse(ws, { type: "create_game", data: { idGame: gameId, idPlayer: el.index }, id: 0 });
    games[gameId][el.index] = {
      field: Array.from({length: 10}, () => Array(10).fill("empty")),
      ships: [],
    };
  }
  delete rooms[indexRoom];
  
}

function addShips(data: string) {
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
    for (const id in selectedGame) {
      for(const ship of selectedGame[id].ships) {
        if(ship.direction === false) {
          for (let i = 0, pos = ship.position.x; i < ship.length; i++, pos++) {
            games[gameId][id].field[ship.position.y][pos] = "ship";
          }
        } else {
          for (let i = 0, pos = ship.position.y; i < ship.length; i++, pos++) {
            games[gameId][id].field[pos][ship.position.x] = "ship";
          }
        }
      }
      // console.log("field", games[gameId][id].field);
    }
    
    for (const id in selectedGame) {
      const ws = clients[id].ws;
      sendResponse(ws, { type: "start_game", data: {ships: selectedGame[id].ships, currentPlayerIndex: id}, id: 0 });
      sendResponse(ws, { type: "turn", data: {currentPlayer: id}, id: 0 });
    }
  }
}

//data: {gameId: number | string, x: number, y: number, indexPlayer: number | string}
function attack(data: string) {
  const { gameId, x, y, indexPlayer } = JSON.parse(data);
  const selectedGame = games[gameId];
  let statusAttack: "miss" | "killed" | "shot";

  let enemyId = "";
  for (const id in selectedGame) {
    if(id !== indexPlayer) {
      enemyId = id;
    }
  }

  const field = selectedGame[enemyId].field;
  if(field[y][x] === "ship") {
    statusAttack = "shot";
    field[y][x] = "shot";

    const crippledShip = searchCrippledShip(field, x, y);

    if(searchKilledShip(field, crippledShip)) {
      statusAttack = "killed";
      markCells(field, crippledShip, indexPlayer, gameId);
    }

  } else {
    statusAttack = "miss";
    field[y][x] = "miss";
  }


  for (const id in selectedGame) {
    const ws = clients[id].ws;
    sendResponse(ws, { type: "attack", data: {currentPlayer: indexPlayer, status: statusAttack, position: {x: x, y: y}}, id: 0 });
  }

  if(!searchRemainingShips(field)) {
    const winnerName = clients[indexPlayer].name;
    const wins = winners.get(winnerName)?.wins || 0;
    winners.set(winnerName, {name: winnerName, wins: wins + 1});

    for (const id in selectedGame) {
      const ws = clients[id].ws;
      sendResponse(ws, { type: "finish", data: {winPlayer: indexPlayer}, id: 0 });
      
      const winnersData = Array.from(winners.values());
      sendResponse(ws, { type: "update_winners", data: winnersData, id: 0 });
    }
    return;
  }

  for (const id in selectedGame) {
    const ws = clients[id].ws;
    const nextPlayerId = statusAttack === "miss" ? enemyId : indexPlayer;
    sendResponse(ws, { type: "turn", data: {currentPlayer: nextPlayerId}, id: 0 });
  }
}

export {
  register,
  createRoom,
  addUserToRoom,
  addShips,
  attack
}