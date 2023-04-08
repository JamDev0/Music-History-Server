import { Knex } from 'knex';

Knex;

import { Entry, Music } from '../entities';

declare module 'knex/types/tables' {
  export interface Tables {
    musics: Music;
    history: Entry;
  }
}