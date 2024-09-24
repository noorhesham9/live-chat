const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const cookiesMiddleware = require("universal-cookie-express");
const ws = require("ws");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const Userr = require("./models/userModel");
const Messagge = require("./models/messageModel");
const authRoutes = require("./routes/register");
const errorHandle = require("./controllers/errorController");
const CustomError = require("./utils/CustomError");
const user = require("./routes/user");
const app = express();
app.use(cookieParser());
app.use(cookiesMiddleware());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(
  cors({
    origin: "http://127.0.0.1:3000",
    credentials: true,
  })
);

dotenv.config({ path: "./config.env" });
app.use(express.json());

app.use("/n", user);

const port = process.env.PORT || 3002;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(`server port ${port}`);
  })
  .catch((err) => console.log(`${err} did not connect`));

const server = app.listen(port, () => {
  console.log("server has started...");
});

const wss = new ws.WebSocketServer({ server });

wss.on("connection", async (connection, req) => {
  console.log("connected");
  const cookies = req.headers.cookie;

  if (cookies) {
    const tokenCOookie = cookies
      .split(/[; ]+/)
      .find((str) => str.startsWith("jwt"));
    if (tokenCOookie) {
      const token = tokenCOookie.split("=")[1];
      if (token) {
        jwt.verify(token, process.env.SECRET_STR, {}, (err, userData) => {
          if (err) {
            throw err;
          }
          const { userId, username } = userData;

          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;

    let fileName = null;
    if (file) {
      console.log("size", file.data.length);
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      filename = Date.now() + "." + ext;
      const path = __dirname + "/uploads/" + filename;
      const bufferData = new Buffer.from(file.data.split(",")[1], "base64");
      fs.writeFile(path, bufferData, () => {
        console.log("file saved:" + path);
      });
    }
    if (recipient && (text || file)) {
      const messagedoc = await Messagge.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? filename : null,
      });

      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              file: file ? filename : null,
              _id: messagedoc._id,
            })
          )
        );
    }
  });

  [...wss.clients].forEach((client) => {
    console.log(wss.clients.username);
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });

  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            username: c.username,
          })),
        })
      );
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log("dead");
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  // server.close(() => {
  //   process.exit(1);
  // });
});

app.use(errorHandle);

app.all("*", (req, res, next) => {
  const err = new CustomError(
    `can't find ${req.originalUrl} on the server`,
    404
  );
  next(err);
});
