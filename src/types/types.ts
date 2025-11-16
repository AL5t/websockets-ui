import { WebSocket } from "ws";

type ClientRequest = {
  type: string,
  data: string,
  id: number,
}

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

interface ExtWebSocket extends WebSocket {
  isAlive: boolean,
}

export {
  ExtWebSocket,
  ClientRequest,

  ClinetRequestLoginOrCreate,
  ServerResponseLoginOrCreate,
  ServerResponseUpdateWinners,
  ClinetRequestCreateNewRoom,
  ClinetRequestAddUserToRoom,
  ServerResponseAddUserToRoom,
  ServerResponseUpdateRoomState
} 