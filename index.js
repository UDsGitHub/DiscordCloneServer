import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { AuthRoutes, UserRoutes, ServerRoutes } from "./routes/index.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());



const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  console.log('user connected ', socket.id);

  socket.on('join_room', (data) => {
    socket.join(data.room);
    console.log('user with id: ', socket.id, ' joined room ', data.room)
  })

  socket.on('leave_room', (data) => {
    socket.leave(data.room);
    console.log('user with id: ', socket.id, ' left room ', data.room)
  })

  socket.on('send_message', (data) => {
    console.log(data)
    socket.to(data.room).emit('receive_message', data)
  })

})

app.get("/", (req, res) => {
  res.send("welcome to the backend");
});

app.use("/auth", AuthRoutes);
app.use('/user', UserRoutes)
app.use('/servers', ServerRoutes)

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
