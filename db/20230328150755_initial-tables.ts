import { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('musics', (table) => {
    table.uuid('id').primary().index();
    table.string('name').notNullable();
    table.string('artist').notNullable();
    table.integer('duration').notNullable();
    table.json('reproductions').notNullable();
  });

  await knex.schema.createTable('history', (table) => {
    table.uuid('id').primary().index();
    table.dateTime('date', { useTz: false }).defaultTo(knex.fn.now()).notNullable();
    table.json('time').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('musics');

  await knex.schema.dropTable('history');
}

