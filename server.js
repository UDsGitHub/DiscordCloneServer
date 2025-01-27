import http from "http";
import { app } from "./index.js";
import { config } from "./config/index.js";
import { Server } from "socket.io";
import { socketHandler } from "./sockets/index.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
  },
});

socketHandler(io);

server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});