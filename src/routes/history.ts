import { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import zod from 'zod';
import { checkIfSessionIdExists } from '../pre-handlers/check-session-id-exist';
import { knex } from '../services/database';
import { filterArrayBySearchParams } from '../utils/filterArrayBySearchParams';
import { sort } from '../utils/sort';

export async function historyRoutes(server: FastifyInstance) {
  server.post('/', async (req, res) => {
    const historyBodySchema = zod.object({
      date: zod.string(),
      time: zod.object({ from: zod.number(), to: zod.number() })
    });

    const body = historyBodySchema.parse(req.body);

    let session_id = req.cookies['music-history.session_id'] as string;

    if(!session_id) {
      session_id = randomUUID();

      res.cookie('music-history.session_id', session_id, {
        maxAge: 1000 * 60 * 60 * 7, // 7 days
        path: '/'
      });
    }
  
    const newEntryId = await knex('history').returning('id').insert({...body, id: randomUUID(), session_id});
  
    if(newEntryId) {
      return res.status(200).send(newEntryId);
    }
  
    return res.status(400).send('Error on inserting music');
  });
  
  server.get(
    '/', 
    {
      preHandler: [checkIfSessionIdExists]
    },
    async (req, res) => {
      const session_id = req.cookies['music-history.session_id'];

      if(!session_id) {
        return res.status(401).send({ message: 'Unauthorized request' });
      }

      const history = await knex('history').where('session_Id', session_id);
  
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
  
  server.get(
    '/:id',
    {
      preHandler: [checkIfSessionIdExists]
    }, 
    async (req, res) => {
      const session_id = req.cookies['music-history.session_id'];

      const routParams = zod.object({
        id: zod.string().uuid(),
      });
    
      const { id } = routParams.parse(req.params);
  
      const entry = await knex('history').where({ id, session_id }).first();
  
      if(!entry || Object.keys(entry).length === 0) {
        return res.code(400).send(`No entry found with id: ${id}`);
      }
  
      return entry;  
    }); 
}