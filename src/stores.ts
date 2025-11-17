import { Clients, Rooms, Games } from "./types/types";

const players = new Map();

const rooms: Rooms = {};

const winners = new Map();

const clients: Clients = {};

const games: Games = {};

export {
  players,
  rooms,
  winners,
  clients,
  games
}