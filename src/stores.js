import { WebSocket } from "ws";

const players = new Map();

const rooms = {};

const winners = new Map();

const clients = {};

const games = {};

export {
  players,
  rooms,
  winners,
  clients,
  games
}