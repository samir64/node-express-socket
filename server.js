const express = require('express');
const socket = require("./express-socket");
const path = require("path");
const router = express.Router();
const app = express();

const userIds = [];

router.socket("/test1/:fname/:lname", (req, res, next) => {
  // global.sendToAll = res.send.broadcast;

  if (!userIds.some(uid => uid === req.socketId)) {
    userIds.push(req.socketId);
  }
  const otherIds = userIds.filter(uid => uid !== req.socketId);

  res.send.to(...otherIds)("Hi others");
  res.send.broadcast("Hi evryone");
  res.send({ method: req.method, query: req.query, body: req.body, param: req.params, socketId: req.socketId });
  next();
});

router.socket("/test1/:fname/:lname", (req, res, next) => {
  res.send("Hi");
});

router.get("/test1/:fname/:lname", (req, res) => {
  const socket = express().socketResponse;
  if (userIds.length > 0) socket("/test2", "He he", userIds);
  if (!!socket) socket("/test2", "Ho ho");

  res.send({ method: req.method, query: req.query, body: req.body, param: req.params, socketId: req.socketId });
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const server = app.listen(8000, () => {
  console.log(`🚀 Server running at port:8000`);
});

app.use(router);
app.use(socket(app, server));

app.use((req, res) => {
  res.status(400).send({ result: "not found" });
})
