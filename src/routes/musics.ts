import { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import zod from 'zod';
import { Music } from '../entities';
import { knex } from '../services/database';
import { filterArrayBySearchParams } from '../utils/filterArrayBySearchParams';
import { sort } from '../utils/sort';

interface querySearchParams {
  sort_by?: string;
  order?: 'DESC' | 'ASC';
}

export async function musicsRoutes(server: FastifyInstance) {
  server.post('/', async (req, res) => {
    const createMusicBodySchema = zod.object({
      artist: zod.string(),
      name: zod.string(),
      duration: zod.number(),
    });

    const body = createMusicBodySchema.parse(req.body);
  
    const newMusicId = (await knex('musics').returning('id').insert({...body, id: randomUUID(), reproductions: JSON.stringify([])} as Music))[0];
  
    if(newMusicId) {
      return res.status(201).send(newMusicId);
    }
  
    return res.status(400).send('Error on inserting music');
  });
  
  
  server.patch('/', (req, res) => {
  
  });
  
  server.get('/', async (req, res) => {
    const musics = await knex('musics');
    
    const queryKeys = Object.keys(req.query as object);
    
    if(queryKeys.length > 0) {
      const queriesSchema = zod.object({
        artist: zod.string().nullish(),
        duration: zod.number().nullish(),
        name: zod.string().nullish(),
        order: zod.enum(['ASC', 'DESC']).nullish(),
        duration_lower_than: zod.number().nullish(),
        duration_higher_than: zod.number().nullish(),
        sort_by: zod.enum(['artist', 'duration', 'id', 'name', 'duration']).nullish()
      });

      const query = queriesSchema.parse(req.query);
  
      const filteredMusics = filterArrayBySearchParams(musics, query);
  
      const { sort_by, order } = query;
      
      if(sort_by) {
        const sortedMusics = sort(filteredMusics, sort_by, order ?? 'ASC');
  
        return sortedMusics;
      }
  
      return filteredMusics;
    }
  
    return musics;
  });
  
  server.get('/:id', async (req, res) => {
    const routParams = zod.object({
      id: zod.string().uuid(),
    });
    
    const { id } = routParams.parse(req.params);
  
    const music = await knex('musics').where('id', id).first();
  
    if(!music || Object.keys(music).length === 0) {
      return res.code(404).send(`No music found with id: ${id}`);
    }
  
    return music;
  });
  
  server.delete('/:id', async (req, res) => {
    const routParams = zod.object({
      id: zod.string(),
    });
    
    const { id } = routParams.parse(req.params);
  
    const deleteQuantity = await knex('musics').where('id', id).delete();
    
    if(deleteQuantity === 0) {
      return res.code(404).send(`No music found to delete with id: ${id}`);
    }
  
    return deleteQuantity;
  });
  
  server.get('/:id/plays', async (req, res) => {
    const routParams = zod.object({
      id: zod.string(),
    });
    
    const { id } = routParams.parse(req.params);
  
    const music = await knex('musics').where('id', id).first();
  
    if(!music || Object.keys(music).length === 0) {
      return res.code(400).send(`No music found with id: ${id}`);
    }
  
    const reproductions = JSON.parse(music.reproductions);
  
    return reproductions.length;
  });
}