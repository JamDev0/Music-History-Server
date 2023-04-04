import fastify from 'fastify';

import { env } from './env';
import { historyRoutes } from './routes/history';
import { musicsRoutes } from './routes/musics';

const server = fastify();

server.register(musicsRoutes, {
  prefix: 'musics'
});
server.register(historyRoutes, {
  prefix: 'history'
});

server.listen({port: env.SERVER_PORT})
  .then(() => {
    console.log(`Running 🏃‍♂️ on ${env.SERVER_PORT} my guy`);
  });

