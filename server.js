const express = require('express');
const socket = require("node-express-socket");
const path = require("path");
const router = express.Router();
const app = express();

router.socket("/test1/:fname/:lname", (req, res) => {
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

router.get("/test1/:fname/:lname", (req, res) => {
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname+'/index.html'));
});

const server = app.listen(8000, () => {
  console.log(`🚀 Server running at port:8000`);
});

app.use(socket(app, server));
app.use(router);
