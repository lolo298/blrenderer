const createError = require("http-errors");
const server = require("http").createServer();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const Websocket = require("ws");
const fs = require("fs");
const { NodeSSH } = require("node-ssh");
require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

//
// Websocket setup
//

const wss = new Websocket.Server({ port: 8080 });

wss.on("connection", function connection(ws) {
  console.log("new connection");
  ws.send("Welcome new client!");

  // message like {state: "render", filename?: "filename"}
  ws.on("message", function incoming(message) {
    console.log("received: ", message);
    message = message.toString();
    message = JSON.parse(message);
    if (message.state == "close") {
      removeTempFiles(message.filename);
      ws.close();
    }
    if (message.state == "reset") {
      removeTempFiles(message.filename);
    }
    if (message.state == "render") {
      const ssh = new NodeSSH();
      ssh
        .connect({
          host: process.env.SSH_HOST,
          username: process.env.SSH_USER,
          password: process.env.SSH_PASS,
        })
        .then(function () {
          ssh
            .exec("blender -b E:/Blender/tmp/tmp.blend -o E:/Blender/tmp/ -F PNG -f 1", [], {
              onStdout(chunk) {
                ws.send(chunk.toString("utf8"));
              },
              onStderr(chunk) {
                ws.send(chunk.toString("utf8"));
              },
            })
            .then(function (result) {
              render = false;
              ws.send("Rendered");

              ssh
                .getFile("public/images/rendered/tmp.png", "E:/Blender/tmp/0001.png")
                .then(function (file) {
                  ws.send("Transfered");
                });
            });
        });
    }
  });
});

function removeTempFiles(filename) {
  if (!filename) {
    return;
  }
  fs.unlink("public/images/rendered/tmp.png", (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
  fs.unlink("uploads/" + filename, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
  const ssh = new NodeSSH();
  ssh
    .connect({
      host: process.env.SSH_HOST,
      username: process.env.SSH_USER,
      password: process.env.SSH_PASS,
    })
    .then(function () {
      ssh.execCommand("del E:/Blender/tmp");
    });
}

//
// Express setup
//

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
