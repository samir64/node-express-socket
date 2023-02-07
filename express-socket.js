const express = require("express");
const Router = express.Router;

express.Router = options => {
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

module.exports = (app, server) => (req, res, next) => {
  const send = socket => {
    const mainSend = p => {
      socket.emit(req.path, p);
    };

    mainSend.socketSend = path => p => {
      socket.emit(path, p);
    };

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
    socket.onAny((eventName, data) => {
      const path = eventName.replace(/^\/+/, "").replace(/\/+$/, "").trim();
      req.method = "SOCKET";
      req.url = path;

      // console.log(path);

      app._router.handle({ ...req, query: getQueryString(eventName), body: data, path }, { ...res, setHeader: () => { }, send: send(socket) }, next);
    });
  });

  next();
};

