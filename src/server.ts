import { app } from './app';

import { env } from './env';

app.listen({port: env.PORT})
  .then(() => {
    console.log(`Running on ${env.PORT} my guy`);
  });

