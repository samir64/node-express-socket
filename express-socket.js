const express = require("express");
const Router = express.Router;

const ExpressRouter = options => {
  const router = Router(options);

  Router.socket = (path, ...callbacks) => {
    router.use(path, ...callbacks.map(callback => (req, res, next) => {
      if (req.method === "SOCKET") {
        const pathPrefixFinder = path.replace(/\/:\w+/g, "/.*") + "$";
        const prefix = req.path.replace(new RegExp(pathPrefixFinder), "");
        const fullPath = prefix + path.replace(/\/:\w+/g, "/*");
        callback(req, { ...res, send: res.send.socketSend(fullPath) }, next);
      } else {
        next();
      }
    }));
  };

  return router;
};

// Router.socket = () => { };
ExpressRouter();

express.Router = ExpressRouter;

module.exports = (app, server) => (req, res, next) => {
  const sendToUsers = (ids, path, p) => {
    if (ids.length > 0) {
      let sto = io;
      ids.forEach(id => {
        sto = sto.to(id);
      })
      sto.emit(path, p);
    }
  }

  const sendToAll = (path, p) => {
    io.emit(path, p);
  }

  const send = socket => {
    let toSocketId;
    let broadcast = false;
    let reqPath = req.path;

    const mainSend = p => {
      if (!!broadcast) {
        sendToAll(reqPath, p);
        broadcast = false;
      } else {
        if (!!toSocketId) {
          sendToUsers(toSocketId, reqPath, p);
          toSocketId = undefined;
        } else {
          socket.emit(reqPath, p);
        }
      }
    };

    const socketSend = path => {
      reqPath = path;

      return mainSend;
    };

    const toUser = (...id) => {
      toSocketId = id;

      return mainSend;
    };

    const toAll = p => {
      broadcast = true;

      mainSend(p);
    };

    mainSend.socketSend = socketSend;
    mainSend.to = toUser;
    mainSend.broadcast = toAll;

    return mainSend;
  };

  const getQueryString = (queryString = "") => {
    let result = queryString;

    result = result.split("?")?.[1];
    result = result?.split("&");
    result = result?.reduce((res, cur) => ({ ...res, [cur.split("=")[0]]: cur.split("=")[1] }), {});

    return result;
  };

  const io = require('socket.io')(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
      // allowedHeaders: ["my-custom-header"],
    },
  });

  io.on('connection', socket => {
    console.log(`User connected: ${socket.id}`);
    express.application.socketResponse = (path, p, ...ids) => {
      if (ids.length === 0) {
        sendToAll(path, p);
      } else {
        sendToUsers(ids, path, p);
      }
    };

    socket.onAny((eventName, data) => {
      const path = "/" + eventName.replace(/^\/+/, "").replace(/\/+$/, "").trim();
      req.method = "SOCKET";
      req.url = path;
      req.socketId = socket.id;

      // console.log(path);

      const newReq = { ...req, query: getQueryString(eventName), body: data, path };
      const newRes = { ...res, setHeader: () => { }, send: send(socket) };
      newRes.status = () => newRes;

      app._router.handle(newReq, newRes, next);
    });
  });

  next();
};

