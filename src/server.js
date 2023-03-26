import http from "node:http";
import { jsonMiddleware } from "./middleware/json.js";
import { routes } from "./routes.js";

const server = http.createServer(async (req, res) => {
  const { method, url: route, headers: { host } } = req;

  const url = new URL(`http://${host}${route}`);

  const currentRoute = routes.find(route => {
    return route.method === method && route.path.test(url.pathname)
  })

  if(currentRoute) {
    await jsonMiddleware(req, res);

    const routeParms = url.pathname.match(currentRoute.path).groups;

    req.parms = { ...routeParms }

    console.log({currentRoute})

    return currentRoute.handler(req, res);
  }

  return res.writeHeader(404).end(JSON.stringify({ message: "Invalid Route or method" }));
});

const port = 3333;

server.listen(port);

/*
    routes:

      musics:
        actions: 
          insert new music
          retrieve music list
            every
            by music prop(s)
              ...
              duration_interval
                higher_than
                lower_than

      history:
        actions:
          insert new listened music
          retrieve listened music list
            every
            by date
            by music prop(s)


    table entities:
      music:
        name
        artist
        duration
        reproductions
          history[]

      history entry:
        date
        music
        time
          from
          to
        
  */