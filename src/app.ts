import fastify from 'fastify';

import cookiePlugin from '@fastify/cookie';
import { historyRoutes } from './routes/history';
import { musicsRoutes } from './routes/musics';

export const app = fastify();

app.register(cookiePlugin);

app.register(musicsRoutes, {
  prefix: 'musics'
});

app.register(historyRoutes, {
  prefix: 'history'
});