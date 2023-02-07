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