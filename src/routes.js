import { randomUUID } from "node:crypto";
import { Database } from "./services/database.js";
import { buildRoutePath } from "./utils/buildRoutePath.js";
import { sort } from "./utils/sort.js";

const database = new Database();

const musicEntityKeys = ["artist", "name", "duration", "id"];

const historyEntityKeys = ["date", "music_id", "time", "id"];

const musicsSearchParams = ["artist", "name", "duration", "duration_higher_than", "duration_lower_than", "sort_by", "order", "id"];

const historySearchParams = ["date", "music_id", "listened_for_more_than", "listened_for_less_than", "sort_by", "order", "id"];

export const routes = [
  {
    path: buildRoutePath("/musics"),
    method: "POST",
    handler: (req, res) => {
      if(!req.body) {
        return res.writeHeader(400).end(JSON.stringify({ message: "Body is missing" }));
      }

      const parsedBody = JSON.parse(req.body);

      const isBodyRight = musicEntityKeys.reduce((acc, key) => {
        if(key === "id") {
          return acc && true;
        }

        return acc && ( key in parsedBody );
      }, true);

      if(!isBodyRight) {
        return res.writeHeader(400).end(JSON.stringify({ message: "Body is missing property" }));
      }

      database.insert("musics", {...parsedBody, "id": randomUUID()});
      
      return res.writeHeader(201).end();
    }
  },
  {
    path: buildRoutePath("/musics"),
    method: "GET",
    handler: (req, res) => {
      const { headers: { host }, url: route } = req;
          
      const url = new URL(`http://${host}${route}`); 

      const musics = database.select("musics");

      const searchParams = Object.fromEntries(url.searchParams);

      const searchParamsKeys = Array.from(url.searchParams.keys());

      if(searchParamsKeys.length > 0) {
        const isThereAInvalidSearchParam = !searchParamsKeys.reduce((acc, key) => {
          if(!musicsSearchParams.find(musicSearchParm => musicSearchParm === key)) {
            return false;
          }

          return (acc && true);
        }, [true])

        if(isThereAInvalidSearchParam) {
          return res.writeHeader(400).end(JSON.stringify({ message: `Invalid search param` }));
        }

        const filteredMusics = musics.filter(music => {
          return searchParamsKeys.reduce((acc, key) => {
            if(key !== "sort_by" && key !== "order") {
              if(key === "duration_lower_than" && key === "duration_higher_than") {
                return acc && searchParams[key] > music.duration < searchParams[key]
              }
              
              if(key === "duration_higher_than") {
                return acc && music.duration > searchParams[key]
              }

              if(key === "duration_lower_than") {
                return acc && music.duration < searchParams[key]
              }
              
              if(key === "duration") {
                return acc && ( Math.abs(searchParams["duration"] - music.duration) < 10 );
              }

              if(key === "id") {
                return (acc && ( music[key] === searchParams[key] ));
              }

              return (acc && ( music[key].includes(searchParams[key]) ));
            }

            return true && acc
          }, true);
        });

        const { sort_by, order } = searchParams;

        if(sort_by) {
          const sortedMusics = sort(filteredMusics, sort_by, order);

          return res.writeHeader(200).end(JSON.stringify(sortedMusics));
        }

        return res.writeHeader(200).end(JSON.stringify(filteredMusics));
      }

      return res.writeHeader(200).end(JSON.stringify(musics));
    }
  },
  {
    path: buildRoutePath("/musics/:id"),
    method: "GET",
    handler: (req, res) => {
      const musics = database.select("musics");

      const music = musics.find(entry => entry.id === req.parms.id)

      const ok = !!music;

      if(ok) {
        return res.writeHeader(200).end(JSON.stringify(music));
      } else {
        return res.writeHeader(404).end(JSON.stringify({ message: "No music was found with the given id." }));
      }
    }
  },
  {
    path: buildRoutePath("/musics/:id"),
    method: "DELETE",
    handler: (req, res) => {
      const { ok } = database.delete("musics", req.parms.id);

      if(ok) {
        return res.writeHeader(200).end();
      } else {
        return res.writeHeader(404).end(JSON.stringify({ message: "No music was found with the given id." }));
      }
    }
  },
  {
    path: buildRoutePath("/musics/:id/plays"),
    method: "GET",
    handler: (req, res) => {
      const musics = database.select("musics");

      const music = musics.find(entry => entry.id === req.parms.id);

      const ok = !!music;

      if(ok) {
        const plays = music.reproductions.length;

        return res.writeHeader(200).end(JSON.stringify({ plays: plays }));
      } else {
        return res.writeHeader(404).end(JSON.stringify({ message: "No history entry was found with the given id." }));
      }
    }
  },
  {
    path: buildRoutePath("/musics"),
    method: "PATCH",
    handler: (req, res) => {
      const { history_id, music_id } = req.body;

      if(!history_id || !music_id) {
        return res.writeHeader(400).end(JSON.stringify({ message: "Body is missing property" }))
      }

      const { ok } = database.patch("push", "musics", music_id, "reproductions", history_id);

      if(ok) {
        return res.writeHeader(200).end();
      }

      return res.writeHeader(404).end(JSON.stringify({ message: "No music was found with the given id." }));
    }
  },
  {
    path: buildRoutePath("/history"),
    method: "POST",
    handler: (req, res) => {
      if(!req.body) {
        return res.writeHeader(400).end(JSON.stringify({ message: "Body is missing" }));
      }
      
      const parsedBody = JSON.parse(req.body);

      const isBodyRight = historyEntityKeys.reduce((acc, key) => {
        if(key === "id") {
          return acc && true
        }

        return acc && ( key in parsedBody );
      }, true);

      if(!isBodyRight) {
        return res.writeHeader(400).end(JSON.stringify({ message: "Body is missing property" }));
      }

      const entryId = randomUUID();

      const parsedReqBody = JSON.parse(req.body)

      database.insert("history", {...parsedReqBody, "id": entryId});

      const { music_id } = parsedReqBody;

      const { ok } = database.patch("push", "musics", music_id, "reproductions", entryId);

      if(ok) {
        return res.writeHeader(201).end();
      }

      return res.writeHeader(404).end(JSON.stringify({ message: "No music was found with the given id." }));
    }
  },
  {
    path: buildRoutePath("/history"),
    method: "GET",
    handler: (req, res) => {
      const { headers: { host }, url: route } = req;
          
      const url = new URL(`http://${host}${route}`); 

      const history = database.select("history");

      const searchParams = Object.fromEntries(url.searchParams);

      const searchParamsKeys = Array.from(url.searchParams.keys());

      if(searchParamsKeys.length > 0) {
        const isThereAInvalidSearchParam = !searchParamsKeys.reduce((acc, key) => {
          if(!historySearchParams.find(historySearchParam => historySearchParam === key)) {
            return false;
          }

          return (acc && true);
        }, [true])

        if(isThereAInvalidSearchParam) {
          return res.writeHeader(400).end(JSON.stringify({ message: `Invalid search param` }));
        }

        const filteredHistory = history.filter(entry => {
          return searchParamsKeys.reduce((acc, key) => {
            if(key !== "sort_by" && key !== "order") {
              // if(key === "duration_interval") {
              //   return acc && ( searchParams[key] );
              // }

              if(key === "listened_for_less_than" && key === "listened_for_more_than") {
                return acc && searchParams[key] > entry.time.from + entry.time.to < searchParams[key];
              }
              
              if(key === "listened_for_more_than") {
                return acc && entry.time.from + entry.time.to > searchParams[key];
              }

              if(key === "listened_for_less_than") {
                return acc && entry.time.from + entry.time.to < searchParams[key];
              }

              if(key === "id" || key === "music_id") {
                return (acc && ( entry[key] === searchParams[key] ));
              }

              return (acc && ( entry[key].includes(searchParams[key]) ));
            }

            return true && acc
          }, true);
        });

        const { sort_by, order } = searchParams;

        if(sort_by) {
          const sortedHistory = sort(filteredHistory, sort_by, order);

          return res.writeHeader(200).end(JSON.stringify(sortedHistory));
        }

        return res.writeHeader(200).end(JSON.stringify(filteredHistory));
      }

      return res.writeHeader(200).end(JSON.stringify(history));
    }
  },
  {
    path: buildRoutePath("/history/:id"),
    method: "GET",
    handler: (req, res) => {
      const history = database.select("history");

      const historyEntry = history.find(entry => entry.id === req.parms.id);

      const ok = !!historyEntry;

      if(ok) {
        return res.writeHeader(200).end(JSON.stringify(historyEntry));
      } else {
        return res.writeHeader(404).end(JSON.stringify({ message: "No history entry was found with the given id." }));
      }
    }
  },
  {
    path: buildRoutePath("/history/:id"),
    method: "DELETE",
    handler: (req, res) => {
      const { ok } = database.delete("history", req.parms.id);

      if(ok) {
        return res.writeHeader(200).end();
      } else {
        return res.writeHeader(404).end(JSON.stringify({ message: "No history entry was found with the given id." }));
      }
    }
  }
]