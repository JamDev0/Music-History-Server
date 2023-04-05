// eslint-disable-next-line
import { Entry, Music } from '../entities';

declare module 'knex/types/table' {
  export interface Tables {
    musics: Music;
    history: Entry;
  }
}