import { WebSocket } from "ws";

interface ExtWebSocket extends WebSocket {
  isAlive: boolean,
};

type Client = {ws: ExtWebSocket, name: string};
type Clients = Record<string, Client>;

type RoomUser = {name: string, index: string };
type Room = {
  roomId: string,
  roomUsers: RoomUser[]
};
type Rooms = Record<string, Room>;

type Ship = {
  position: {
      x: number,
      y: number,
  },
  direction: boolean,
  length: number,
  type: "small"|"medium"|"large"|"huge",
};
type PlayerData = {field: string[][], ships: Ship[]};
type Game = Record<string, PlayerData>;
type Games = Record<string, Game>;

type ClientRequest = {
  type: string,
  data: string,
  id: number,
};


type ClientResponse = {
  type: string,
  data: ServerResponseDataLoginOrCreate 
  | ServerResponseDataUpdateWinners 
  | ServerResponseDataAddUserToRoom 
  | ServerResponseDataAddUserToRoom 
  | ServerResponseDataUpdateRoomState
  | ServerResponseDataStartGame
  | ServerResponseDataAttack
  | ServerResponseDataTurn
  | ServerResponseDataFinish
  | string,
  id: number,
};


type ServerResponseDataLoginOrCreate = {
  name: string,
  index: number | string,
  error: boolean,
  errorText: string,
};


type ServerResponseWinner = {
  name: string,
  wins: number,
};
type ServerResponseDataUpdateWinners = ServerResponseWinner[];


type ServerResponseDataAddUserToRoom = {
  idGame: number | string,
  idPlayer: number | string,
};


type ServerResponseRoomState = {
  roomId: string,
  roomUsers: RoomUser[],
}
type ServerResponseDataUpdateRoomState = ServerResponseRoomState[] | [];


type ServerResponseDataStartGame = {
  ships: Ship[],
  currentPlayerIndex: number | string,
};


type ServerResponseDataAttack = {
  position:
  {
    x: number,
    y: number,
  },
  currentPlayer: number | string,
  status: "miss" | "killed" | "shot",
};


type ServerResponseDataTurn = {
  currentPlayer: number | string
};


type ServerResponseDataFinish = {
  winPlayer: number | string
};



type ClinetRequestLoginOrCreate = {
  type: "reg",
  data:
    {
      name: string,
      password: string,
    },
  id: 0,
};

type ServerResponseLoginOrCreate = {
  type: "reg",
  data:
    {
      name: string,
      index: number | string,
      error: boolean,
      errorText: string,
    },
  id: 0,
};

type ServerResponseUpdateWinners = {
  type: "update_winners",
  data:
    [
      {
        name: string,
        wins: number,
      }
    ],
  id: 0,
};

type ClinetRequestCreateNewRoom = {
  type: "create_room",
  data: "",
  id: 0,
};

type ClinetRequestAddUserToRoom = {
  type: "add_user_to_room",
  data:
    {
      indexRoom: number | string,
    },
   id: 0,
};

type ServerResponseAddUserToRoom = {
  type: "create_game",
  data:
    {
      idGame: number | string,
      idPlayer: number | string,
    },
  id: 0,
};

type ServerResponseUpdateRoomState = {
  type: "update_room",
  data:
    [
      {
        roomId: number | string,
        roomUsers:
          [
            {
              name: string,
              index: number | string,
            }
          ],
      },
    ],
  id: 0,
};

export {
  ExtWebSocket,
  Clients,
  Rooms,
  RoomUser,
  Games,
  ClientRequest,
  ClientResponse,

  ServerResponseDataLoginOrCreate,
  ServerResponseDataUpdateWinners,
  ServerResponseDataAddUserToRoom, 
  ServerResponseDataUpdateRoomState,
  ServerResponseDataStartGame,
  ServerResponseDataAttack,
  ServerResponseDataTurn,
  ServerResponseDataFinish,





  ClinetRequestLoginOrCreate,
  ServerResponseLoginOrCreate,
  ServerResponseUpdateWinners,
  ClinetRequestCreateNewRoom,
  ClinetRequestAddUserToRoom,
  ServerResponseAddUserToRoom,
  ServerResponseUpdateRoomState
} 