const express = require('express');
const socket = require("node-express-socket");
const router = express.Router();
const app = express();

console.log(socket);

router.socket("/test1/:fname/:lname", (req, res) => {
  res.send({q:req.query, b:req.body, p:req.params});
});

router.get("/test1/:fname/:lname", (req, res) => {
  res.send({q:req.query, b:req.body, p:req.params});
});

const server = app.listen(8000, () => {
  console.log(`🚀 Server running at port:8000`);
});

app.use(socket(app, server));
app.use(router);
