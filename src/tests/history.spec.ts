import request from 'supertest';
import { afterAll, beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import { app } from '../app';


describe('history routes', () => {
  beforeAll(async () => {
    await app.ready();
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  it('should be able to create new entry and receive new entry id', async () => {
    const postEntryResponse = await request(app.server)
      .post('/history')
      .send({
        date: '10/10/2004',
        time: {
          from: 0,
          to: 100,
        },
        music: '5b908c9a-d631-11ed-afa1-0242ac120002'
      });

    expect(postEntryResponse.statusCode).toBe(201);
    expectTypeOf(postEntryResponse.body.id).toBeString();
  });

  it('should be able to only get the entry its created', async () => {
    const entryBodyTime = {
      from: 0,
      to: 100,
    };

    const entryBody = {
      date: '10/10/2004',
      time: entryBodyTime,
      music: '5b908c9a-d631-11ed-afa1-0242ac120002'
    };

    const postEntryResponse = await request(app.server)
      .post('/history')
      .send(entryBody);

    const cookies = postEntryResponse.get('Set-Cookie');

    const entryId = postEntryResponse.body.id;

    const getEntryResponse = await request(app.server)
      .get('/history')
      .set('Cookie', cookies);

    expect(getEntryResponse.statusCode).toBe(200);

    expect(getEntryResponse.body).toEqual([
      expect.objectContaining({
        ...entryBody,
        time: JSON.stringify(entryBodyTime),
        id: entryId 
      })
    ]);
  });

  it('should be able to only get the entry its created by its id', async () => {
    const entryBodyTime = {
      from: 0,
      to: 100,
    };

    const entryBody = {
      date: '10/10/2004',
      time: entryBodyTime,
      music: '5b908c9a-d631-11ed-afa1-0242ac120002'
    };

    const postEntryResponse = await request(app.server)
      .post('/history')
      .send(entryBody);

    const cookies = postEntryResponse.get('Set-Cookie');

    const entryId = postEntryResponse.body.id;

    const getEntryByIdResponse = await request(app.server)
      .get(`/history/${entryId}`)
      .set('Cookie', cookies);

    expect(getEntryByIdResponse.statusCode).toBe(200);

    expect(getEntryByIdResponse.body).toEqual(expect.objectContaining({
      ...entryBody,
      time: JSON.stringify(entryBodyTime),
      id: entryId 
    }));
  });
});