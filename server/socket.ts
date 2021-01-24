import * as socketIO from "socket.io";
import initEmitter from "socket.io-emitter";
import { createAdapter } from "socket.io-redis";
import http from "http";
import { client as redis } from "./redis";

const init = (server: http.Server) => {
  const io: socketIO.Server = require("socket.io")(server);
  io.adapter(createAdapter("redis://localhost:6379"));

  registerFromClient(io);
  registerFromServer();
};

const emitter = initEmitter({ host: "localhost", port: 6379 });

// client発
const registerFromClient = (io: socketIO.Server) => {
  io.sockets.on("connection", (socket) => {
    console.log("Connected from" + socket.id);

    socket.on("disconnect", () => {
      console.log("disconnect");
    });
  });
};

// server発
const registerFromServer = () => {
  redis.on("message", (channel, message) => {
    switch (channel) {
      case "EXEC_API":
        emitter.broadcast.emit("NOTICE_EXEC_API", message);
        break;
      case "SHUTDOWN":
        emitter.broadcast.emit("NOTICE_SHUTDOWN", message);
        break;
    }
  });
};

export { init };
