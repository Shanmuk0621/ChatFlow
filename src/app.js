import express from "express";
import http from 'http';
import { Server } from "socket.io";
import userRoute from './Routers/userRoute.js';
import messageRoute from "./Routers/messageRouter.js";
import cookieparser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  }
});

export const socketList = {};

io.on("connection", (Socket) => {
  console.log("connected socket ----------->",socketList,Socket);
  
  const userId = Socket.handshake.query.userId;

  socketList[userId] = Socket.id;

  Socket.on("newMsg",(msgContent)=>
  {
    console.log("-------------------------------------------------------------------------")

    console.log("ssomething recieved ", msgContent.content)
    console.log(msgContent);

    if(socketList[msgContent.receiverId])
    {
      io.to(socketList[msgContent.receiverId]).emit("newMsg",msgContent.content)
    }
    
  })

  Socket.on("disconnect", () => {
    delete socketList[userId];
  });
});

app.use("/api/v1/users", userRoute);
app.use("/api/v1/messages", messageRoute);

export default server;
