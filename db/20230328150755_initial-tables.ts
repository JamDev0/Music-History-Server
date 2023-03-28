import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("musics", (table) => {
    table.uuid("id").primary().index();
    table.string("name").notNullable();
    table.string("artist").notNullable();
    table.integer("duration").notNullable();
    table.json("reproductions").notNullable();
  })

  await knex.schema.createTable("history", (table) => {
    table.uuid("id").primary().index();
    table.dateTime("date", { useTz: false }).defaultTo(knex.fn.now()).notNullable();
    table.json("time").notNullable();
  })
}

/*
    routes:

      musics:
        actions: 
          insert new music
          retrieve music list
            every
            by music prop(s)
              ...
              duration_interval
                higher_than
                lower_than

      history:
        actions:
          insert new listened music
          retrieve listened music list
            every
            by date
            by music prop(s)


    table entities:
      music:
        name
        artist
        duration
        reproductions
          history[]

      history entry:
        date
        music
        time
          from
          to
        
  */

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("musics");

  await knex.schema.dropTable("history");
}

