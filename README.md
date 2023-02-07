# Express.js socket handler

## Installation instruction:

`npm install node-express-socket`

## Use:

### Server side:

```
const express = require('express');
const socket = require("node-express-socket");
const router = express.Router();
const app = express();

router.socket("/test1/:fname/:lname", (req, res) => {
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

router.get("/test1/:fname/:lname", (req, res) => {
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

const server = app.listen(8000, () => {
  console.log(`Server running at port:8000`);
});

app.use(socket(app, server));
app.use(router);
```

If you want to use a general route for 'Not found', it should be after socket use command.

<pre>
const express = require('express');
const socket = require("node-express-socket");
const router = express.Router();
const app = express();

router.socket("/test1/:fname/:lname", (req, res) => {
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

router.get("/test1/:fname/:lname", (req, res) => {
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

const server = app.listen(8000, () => {
  console.log(`Server running at port:8000`);
});

app.use(socket(app, server));
app.use(router);

<b>app.use((req, res, next) => {
  res.status(404).send("404 - not found");
});</b>
</pre>

Get user socket id

<pre>
const express = require('express');
const socket = require("node-express-socket");
const router = express.Router();
const app = express();

router.socket("/test1/:fname/:lname", (req, res) => {
  <b>console.log(req.socketId);</b>
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

router.get("/test1/:fname/:lname", (req, res) => {
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

const server = app.listen(8000, () => {
  console.log(`Server running at port:8000`);
});

app.use(socket(app, server));
app.use(router);

app.use((req, res, next) => {
  res.status(404).send("404 - not found");
});
</pre>

Send message to specific user

<pre>
const express = require('express');
const socket = require("node-express-socket");
const router = express.Router();
const app = express();
let users = [/*user ids*/];

router.socket("/test1/:fname/:lname", (req, res) => {
  <b>users.push(req.socketId);</b>
  <b>res.send.to(...users)("Hi");</b>
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

router.get("/test1/:fname/:lname", (req, res) => {
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

const server = app.listen(8000, () => {
  console.log(`Server running at port:8000`);
});

app.use(socket(app, server));
app.use(router);

app.use((req, res, next) => {
  res.status(404).send("404 - not found");
});
</pre>

Send broadcast message

<pre>
const express = require('express');
const socket = require("node-express-socket");
const router = express.Router();
const app = express();

router.socket("/test1/:fname/:lname", (req, res) => {
  <b>res.send.broadcast("Hi");</b>
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

router.get("/test1/:fname/:lname", (req, res) => {
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

const server = app.listen(8000, () => {
  console.log(`Server running at port:8000`);
});

app.use(socket(app, server));
app.use(router);

app.use((req, res, next) => {
  res.status(404).send("404 - not found");
});
</pre>

Response socket message from out of socket methods

<pre>
const express = require('express');
const socket = require("node-express-socket");
const router = express.Router();
const app = express();

router.socket("/test1/:fname/:lname", (req, res) => {
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

router.get("/test1/:fname/:lname", (req, res) => {
  <b>const sckRes = express().socketResponse</b>
  <b>if (!!sckRes) sckRes("/test1/*/*", "Hi");</b> // For broadcast messaging
  <b>if (!!sckRes) sckRes("/test1/*/*", "Hi", "/*user1 id*/", "/*user2 id*/", ...);</b> // For sending message to specific users
  res.send({m:req.method, q:req.query, b:req.body, p:req.params});
});

const server = app.listen(8000, () => {
  console.log(`Server running at port:8000`);
});

app.use(socket(app, server));
app.use(router);

app.use((req, res, next) => {
  res.status(404).send("404 - not found");
});
</pre>

### Client side:

```
// 1) Create and connect socket object
const socket = io();

// 2) Send request using WebSocket
socket.emit('/test1/joe/gandomi?qp1=v1', {
    var1: "value1",
    var2: "value2"
});

// 3) Receive response using WebSocket
socket.on('/test/*/*', data => {
  console.log(data);
});
```

### Client log:
```
{
    m: "SOCKET",
    q: {
        qp1: "v1"
    },
    p: {
        fname: "joe",
        lname: "gandomi"
    },
    b: {
        var1: "value1",
        var2: "value2"
    }
}
```