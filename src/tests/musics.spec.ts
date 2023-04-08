import { execSync } from 'node:child_process';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, expectTypeOf, it } from 'vitest';
import { app } from '../app';

describe('Musics routes', () => {
  beforeAll(async () => {
    await app.ready();
  });
  
  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create new music and receive new musics id', async () => {
    const response = await request(app.server)
      .post('/musics')
      .send({
        artist: 'MjB',
        name: 'Blind Bend',
        duration: 186,
      });
  
    expect(response.statusCode).toBe(201);
    
    expectTypeOf(response.body.id).toBeString();
  });

  it('should be able to list musics', async () => {
    const listMusicsResponse = await request(app.server)
      .get('/musics');

    expect(listMusicsResponse.statusCode).toBe(200);
  });

  it('should be able to get created music by its id', async () => {
    const musicBody = {
      artist: 'MjB',
      name: 'Blind Bend',
      duration: 186,
    };

    const createMusicResponse = await request(app.server)
      .post('/musics')
      .send(musicBody); 

    const musicId = createMusicResponse.body.id;

    const getMusicByIdResponse = await request(app.server)
      .get(`/musics/${musicId}`);

    expect(getMusicByIdResponse.statusCode).toBe(200);

    expect(getMusicByIdResponse.body).toStrictEqual({...musicBody, id: musicId, reproductions: '[]'});
  });

  it('should be able to delete created music by its id', async () => {
    const createMusicResponse = await request(app.server)
      .post('/musics')
      .send({
        artist: 'MjB',
        name: 'Blind Bend',
        duration: 186,
      }); 

    const musicId = createMusicResponse.body.id;

    const deleteMusicResponse = await request(app.server)
      .delete(`/musics/${musicId}`);

    expect(deleteMusicResponse.statusCode).toBe(200);

    const getMusicByIdResponse = await request(app.server)
      .get(`/musics/${musicId}`);

    expect(getMusicByIdResponse.statusCode).toBe(404);
  });

  it('should be able to get created music plays', async () => {
    const createMusicResponse = await request(app.server)
      .post('/musics')
      .send({
        artist: 'MjB',
        name: 'Blind Bend',
        duration: 186,
      }); 

    const musicId = createMusicResponse.body.id;

    const getMusicPlaysResponse = await request(app.server)
      .get(`/musics/${musicId}/plays`);

    expect(getMusicPlaysResponse.statusCode).toBe(200);

    expect(getMusicPlaysResponse.body).toBe(0);
  });
});
