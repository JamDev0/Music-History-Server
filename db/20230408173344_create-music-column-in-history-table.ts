import { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('history', (table) => {
    table.string('music');
  });

}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('history', (table) => {
    table.dropColumn('music');
  });
}

