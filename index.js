const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require('mongoose');
const db = require('./db');
const Message = require('./messageModel');

const route = require("./route");
const { addUser, findUser, getRoomUsers, removeUser } = require("./users");

const app = express();

app.use(cors({ origin: "*" }));
app.use(route);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

db.once('open', () => {
  console.log('Database connection established');

  app.get('/messages/:room', async (req, res) => {
    try {
      const room = req.params.room; // Получаем комнату из параметров запроса
      const messages = await Message.find({ room }); // Получаем сообщения только для этой комнаты
      res.json(messages); // Отправляем сообщения в формате JSON в ответ на запрос клиента
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal server error" }); // Отправляем сообщение об ошибке в случае возникновения ошибки
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", ({ name, room }) => {
      socket.join(room);

      const { user, isExist } = addUser({ name, room });


      io.to(user.room).emit("room", {
        data: { users: getRoomUsers(user.room) },
      });
    });

    

    socket.on("sendMessage", async ({ message, params }) => {
      const user = findUser(params);

      if (user) {
        const newMessage = new Message({
          user: user.name,
          room: user.room,
          message: message,
        });

        await newMessage.save();

        io.to(user.room).emit("message", { data: { user: user.name, message } });
      }
    });

    socket.on("leftRoom", ({ params }) => {
      const user = removeUser(params);

      if (user) {
        const { room, name } = user;

        io.to(room).emit("room", {
          data: { users: getRoomUsers(room) },
        });
      }
    });

    io.on("disconnect", () => {
      console.log("Disconnect");
    });
  });

  server.listen(3333, () => {
    console.log("Server is running");
  });
});
