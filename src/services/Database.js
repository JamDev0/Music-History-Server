import fs from "node:fs/promises";

const dbPath = new URL("../db.json", import.meta.url);

const initialMusics = [
  {
    name: "Bohemian Rhapsody",
    artist: "Queen",
    duration: 354,
    id: "d88af42f-292e-4912-9d71-6cbfca6e6357",
    reproductions: [],
  },
  {
    name: "Stairway to Heaven",
    artist: "Led Zeppelin",
    duration: 482,
    id: "b7878c71-f2f2-4c2f-bdbd-4963b861246e",
    reproductions: [],
  },
  {
    name: "Smells Like Teen Spirit",
    artist: "Nirvana",
    duration: 301,
    id: "369a92e8-352b-40b6-ba77-dac0d9c11abf",
    reproductions: [],
  },
  {
    name: "Billie Jean",
    artist: "Michael Jackson",
    duration: 294,
    id: "ebbf4f4a-1b91-4753-95a3-ef885ddcfaaf",
    reproductions: [],
  },
  {
    name: "Purple Haze",
    artist: "Jimi Hendrix",
    duration: 174,
    id: "965c4fc2-4a4c-4bb1-86c3-ccdc500449c7",
    reproductions: [],
  },
  {
    name: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    duration: 356,
    id: "1a07b834-b99c-47fa-96a8-8c08f1e01e48",
    reproductions: [],
  },
  {
    name: "Like a Rolling Stone",
    artist: "Bob Dylan",
    duration: 369,
    id: "b0af97ea-8e81-4ce4-a39b-4f25f15a0b75",
    reproductions: [],
  },
  {
    name: "Watermelon Sugar",
    artist: "Harry Styles",
    duration: 174,
    id: "49c0cb12-621c-46ea-9a54-142a1b7cc377",
    reproductions: [],
  },
  {
    name: "Stayin' Alive",
    artist: "Bee Gees",
    duration: 284,
    id: "e32bbf27-035b-48f3-b8d3-982f9b6f9bdf",
    reproductions: [],
  },
  {
    name: "Smooth",
    artist: "Santana featuring Rob Thomas",
    duration: 275,
    id: "f1a676a2-c2e7-4326-bce9-7145a6e00b6f",
    reproductions: [],
  }
];

export class Database {
  #database = {};

  constructor() {
    fs.readFile(dbPath, { encoding: "utf-8" })
    .then(data => {
      this.#database = JSON.parse(data);
    })
    .catch(() => {
      this.#database.musics = initialMusics;

      this.#persists();
    })
  }

  #persists() {
    fs.writeFile(dbPath, JSON.stringify(this.#database));
  }

  insert(table, data) {
    if(this.#database[table]) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persists();
  }

  select(table) {
    const data = this.#database[table] ?? [];
    
    return data;
  }

  delete(table, id) {
    const entryExists = !!this.#database[table].find(entry => entry.id === id);

    if(!entryExists) {
      return { ok: false }
    }

    this.#database[table] = this.#database[table].filter(entry => entry.id !== id);

    this.#persists();

    return { ok: true }
  }

  patch(method, table, entryId, property, value) {
    const entryExists = !!this.#database[table].find(entry => entry.id === entryId)

    if(!entryExists) {
      return { ok: false }
    }

    switch(method) {
      case "push": {
        console.log(this.#database[table])

        this.#database[table].forEach(entry => entry.id === entryId && entry[property].push(value))

        console.log(this.#database[table]);
      }
    }

    this.#persists();

    return { ok: true };
  }
}