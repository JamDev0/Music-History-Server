import fastify from 'fastify';

import { randomUUID } from 'node:crypto';
import { Music } from './entities';
import { env } from './env';
import { knex } from './services/database';
import { areThereWrongQueries } from './utils/areThereWrongQueries';
import { filterArrayBySearchParams } from './utils/filterArrayBySearchParams';
import { objectHasAllProperties } from './utils/objectHasAllProperties';
import { sort } from './utils/sort';

interface querySearchParams {
  sort_by?: string;
  order?: 'DESC' | 'ASC';
}

const server = fastify();

server.post('/musics', async (req, res) => {
  const { body } = req;

  const isBodyRight = objectHasAllProperties<Omit<Music, 'id'>>(body, ['artist', 'duration', 'name']);
  

  if(!isBodyRight) {
    return res.status(400).send('Missing/wrong properties');
  }

  const newMusicId = (await knex('musics').returning('id').insert({...body, id: randomUUID(), reproductions: JSON.stringify([])} as Music))[0];

  if(newMusicId) {
    return res.status(200).send(newMusicId);
  }

  return res.status(400).send('Error on inserting music');
});


server.patch('/musics', (req, res) => {

});

server.get('/musics', async (req, res) => {
  const musics = await knex('musics');

  const queries = req.query as (querySearchParams & Music);

  const queryKeys = Object.keys(queries as object);

  if(queryKeys.length > 0) {
    const searchQueries: ((keyof (querySearchParams & Music)) | 'duration_lower_than' | 'duration_higher_than')[] = ['artist', 'duration', 'id', 'name', 'order', 'duration_lower_than', 'duration_higher_than'];

    const wrongQueriesMessage = areThereWrongQueries(searchQueries, queryKeys);

    if(wrongQueriesMessage) {
      return res.code(400).send(wrongQueriesMessage);
    }

    const filteredMusics = filterArrayBySearchParams(musics, queries);

    const { sort_by, order } = queries;
    
    if(sort_by) {
      const sortedMusics = sort(filteredMusics, sort_by, order ?? 'ASC');

      return sortedMusics;
    }

    return filteredMusics;
  }

  return musics;
});

server.get('/musics/:id', async (req, res) => {
  const { id } = req.params;

  if(!id) {
    return res.code(400).send('Id not provided');
  }

  const music = await knex('musics').where('id', id);

  if(music.length === 0) {
    return res.code(400).send(`No music found with id: ${id}`);
  }

  return music;
});

server.delete('/musics/:id', (req, res) => {
  const { id } = req.params;

  if(!id) {
    return res.code(400).send('Id not provided');
  }

  const idk = knex('musics').where('id', id).delete();
  
  console.log({idk});

  return;
});

server.get('/musics/:id/plays', async (req, res) => {
  const { id } = req.params;

  if(!id) {
    return res.code(400).send('Id not provided');
  }

  const music = (await knex('musics').where('id', id))[0] as Music;

  if(Object.keys(music).length === 0) {
    return res.code(400).send(`No music found with id: ${id}`);
  }

  const reproductions = JSON.parse(music.reproductions);

  console.log(reproductions);

  return reproductions.length;
});

server.post('/history', (req, res) => {
  const { body } = req;

  const isBodyRight = objectHasAllProperties<Omit<Music, 'id'>>(body, ['artist', 'duration', 'name']);
  

  if(!isBodyRight) {
    return res.status(400).send('Missing/wrong properties');
  }

  const newMusicId = (await knex('musics').returning('id').insert({...body, id: randomUUID(), reproductions: JSON.stringify([])} as Music))[0];

  if(newMusicId) {
    return res.status(200).send(newMusicId);
  }

  return res.status(400).send('Error on inserting music');
});

server.get('/history', async (req, res) => {
  const history = await knex('history');

  const queries = req.query as (querySearchParams & Music);

  const queryKeys = Object.keys(queries as object);

  if(queryKeys.length > 0) {
    const searchQueries: ((keyof (querySearchParams & Music)) | 'duration_lower_than' | 'duration_higher_than')[] = ['artist', 'duration', 'id', 'name', 'order', 'duration_lower_than', 'duration_higher_than'];

    const wrongQueriesMessage = areThereWrongQueries(searchQueries, queryKeys);

    if(wrongQueriesMessage) {
      return res.code(400).send(wrongQueriesMessage);
    }

    const filteredHistory = filterArrayBySearchParams(history, queries);

    const { sort_by, order } = queries;
    
    if(sort_by) {
      const sortedHistory = sort(filteredHistory, sort_by, order ?? 'ASC');

      return sortedHistory;
    }

    return filteredHistory;
  }

  return history;
});

server.get('/history/:id', async (req, res) => {
  const { id } = req.params;

  if(!id) {
    return res.code(400).send('Id not provided');
  }

  const entry = await knex('musics').where('id', id);

  if(entry.length === 0) {
    return res.code(400).send(`No entry found with id: ${id}`);
  }

  return entry;  
});

server.delete('/history/:id', (req, res) => {

});

server.listen({port: env.SERVER_PORT})
  .then(() => {
    console.log(`Running 🏃‍♂️ on ${env.SERVER_PORT} my guy`);
  });

