import { clients, players, games, rooms, winners } from "./stores.ts";
import { sendResponse } from './sendResponse.ts';

function searchCrippledShip(field: string[][], x: number, y: number): [number, number][] {
  const height = field.length;
  const width = field[0].length;
  const cells = [[x, y]];
  const visited = new Set();
  const result: [number, number][] = [];

  while (cells.length) {
    const [cx, cy] = cells.pop()!;
    const key = `${cx}${cy}`;

    if(visited.has(key)) continue
    visited.add(key);
    if(cx < 0 || cy < 0 || cx >= width || cy >= height) continue;
    if(field[cy][cx] !== "ship" && field[cy][cx] !== "shot") continue;

    result.push([cx, cy]);
    cells.push([cx + 1, cy]);
    cells.push([cx - 1, cy]);
    cells.push([cx, cy + 1]);
    cells.push([cx, cy - 1]);
  }
  return result;
}


function searchKilledShip(field: string[][], crippledShip: [number, number][]) {
  return crippledShip.every(([x, y]) => field[y][x] === "shot");
}

function markCells(field: string[][], crippledShip: [number, number][], indexPlayer: string, gameId: string) {
  const selectedGame = games[gameId];
  const height = field.length;
  const width = field[0].length;

  const neighboringCells = [];

  for (const [x, y] of crippledShip) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const a = x + j;
        const b = y + i;

        if(a < 0 || b < 0 || a >= width || b >= height) continue;
        const part = crippledShip.some(([cx, cy ]) => cx === a && cy === b);
        if(!part && field[b][a] === "empty") {
          field[b][a] = "miss";
          neighboringCells.push([a, b]);
        }
      }
      
    }
  }

  for (const [x, y] of neighboringCells) {
    for (const id in selectedGame) {
      const ws = clients[id].ws;
      sendResponse(ws, { type: "attack", data: {currentPlayer: indexPlayer, status: "miss", position: {x: x, y: y}}, id: 0 });
    }
  }
}

function searchRemainingShips(field: string[][]) {
  return field.some(r => r.some(cell => cell === "ship"));
}

export {
  searchCrippledShip,
  searchKilledShip,
  markCells,
  searchRemainingShips
}