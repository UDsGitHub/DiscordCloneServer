import { Server, Socket } from "socket.io";

export const socketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("user connected ", socket.id);

    socket.on("join_room", (data) => {
      socket.join(data.room);
      console.log("user with id: ", socket.id, " joined room ", data.room);
    });

    socket.on("leave_room", (data) => {
      socket.leave(data.room);
      console.log("user with id: ", socket.id, " left room ", data.room);
    });

    socket.on("send_message", (data) => {
      console.log(data);
      socket.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected ", socket.id);
    });
  });
};
