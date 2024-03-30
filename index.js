let all_username = {};

const server = Bun.serve({
  //port: 443,
  async fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/chat") {
      console.log(`upgrade!`);
      const success = server.upgrade(req);
      return success
        ? undefined
        : new Response("WebSocket upgrade error", { status: 400 });
    }

    let file = '';
    if (url.pathname === '/') {
      file = Bun.file('public/index.html');
    } else {
      //ファイルパスで指定されたファイルを読み込む
      file = Bun.file(`public${url.pathname}`);
    }

    //ファイルが存在するか
    const check_file = await file.exists();

    if (check_file === true) {
      return new Response(file);
    } else {
      return new Response('404 Not Found', { status: 404 });
    }

  },

  /*
    tls: {
      cert: Bun.file("./letsencrypt32647435.crt"),
      key: Bun.file('./letsencrypt32647435.key'),
    },
  */


  websocket: {
    open(ws) {
      ws.subscribe("room");
      //server.publish("room", msg);
      ws.send(JSON.stringify(all_username));
    },
    message(ws, message) {
      if (Object.keys(all_username).length < 2) {
        const json_data = JSON.parse(message);
        const username = String(Object.keys(json_data));

        if (username.length <= 8) {
          console.log(Object.keys(all_username).length);
          if (typeof all_username[username] === 'undefined') {
            all_username[username] = new Date();
            server.publish('room', JSON.stringify(all_username));
            const data = {};
            data['has-been-decided'] = username;
            ws.send(JSON.stringify(data));
          } else {
            const data = {};
            data['already-in-use'] = new Date();
            ws.send(JSON.stringify(data));
          }
        } else {
          const too_long = {};
          too_long['this-name-is-too-long'] = username;
          ws.send(JSON.stringify(too_long));
        }

      } else {
        console.log('too many players');
        const data = {}
        data['too-many-players'] = new Date();
        ws.send(JSON.stringify(data));
      }
    },
    close(ws) {
      ws.unsubscribe("room");
    },
  },

});

console.log(`Listening on ${server.hostname}:${server.port}`);
