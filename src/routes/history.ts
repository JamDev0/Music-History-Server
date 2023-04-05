import { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import zod from 'zod';
import { knex } from '../services/database';
import { filterArrayBySearchParams } from '../utils/filterArrayBySearchParams';
import { sort } from '../utils/sort';

interface querySearchParams {
  sort_by?: string;
  order?: 'DESC' | 'ASC';
}

const sessionIdSchema = zod.string().uuid();

export async function historyRoutes(server: FastifyInstance) {
  server.post('/', async (req, res) => {
    const historyBodySchema = zod.object({
      date: zod.string(),
      music: zod.string(),
      time: zod.object({ from: zod.number(), to: zod.number() })
    });

    const body = historyBodySchema.parse(req.body);

    let sessionId = req.cookies['music-history.sessionId'];

    if(!sessionId) {
      sessionId = randomUUID();

      res.cookie('music-history.sessionId', sessionId, {
        maxAge: 1000 * 60 * 60 * 7, // 7 days
        path: '/'
      });
    }
  
    const newMusicId = await knex('musics').returning('id').insert({...body, id: randomUUID(), reproductions: JSON.stringify([]), sessionId}).first();
  
    if(newMusicId) {
      return res.status(200).send(newMusicId);
    }
  
    return res.status(400).send('Error on inserting music');
  });
  
  server.get('/', async (req, res) => {
    const sessionId = sessionIdSchema.parse(req.cookies['music-history.sessionId']);

    const history = await knex('history').where('sessionId', sessionId);
  
    const queryKeys = Object.keys(req.query as object);
  
    if(queryKeys.length > 0) {
      const queriesSchema = zod.object({
        date: zod.string().nullish(),
        music: zod.string().nullish(),
        order: zod.enum(['ASC', 'DESC']).nullish(),
        play_time_lower_than: zod.number().nullish(),
        play_time_higher_than: zod.number().nullish(),
        sort_by: zod.enum(['date', 'music', 'play_time']).nullish()
      });

      const query = queriesSchema.parse(req.query);
  
      const filteredHistory = filterArrayBySearchParams(history, query);
  
      const { sort_by, order } = query;
      
      if(sort_by) {
        const sortedHistory = sort(filteredHistory, sort_by, order ?? 'ASC');
  
        return sortedHistory;
      }
  
      return filteredHistory;
    }
  
    return history;
  });
  
  server.get('/:id', async (req, res) => {
    const sessionId = sessionIdSchema.parse(req.cookies['music-history.sessionId']);

    const routParams = zod.object({
      id: zod.string().uuid(),
    });
    
    const { id } = routParams.parse(req.params);
  
    const entry = await knex('musics').where({id, sessionId}).first();
  
    if(Object.keys(entry).length === 0) {
      return res.code(400).send(`No entry found with id: ${id}`);
    }
  
    return entry;  
  });
  
  server.delete('/:id', (req, res) => {
  
  });
}