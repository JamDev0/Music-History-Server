import fastify from "fastify";


//@ts-ignore
const server = fastify();

server.post("/musics", (req, res) => {  
})

server.patch("/musics", (req, res) => {

})

server.get("/musics", (req, res) => {
})

server.get("/musics/:id", (req, res) => {
  
})

server.delete("/musics/:id", (req, res) => {
  
})

server.get("/musics/:id/plays", (req, res) => {

})

server.post("/history", (req, res) => {

})

server.get("/history", (req, res) => {

})

server.get("/history/:id", (req, res) => {
  
})

server.delete("/history/:id", (req, res) => {
  
})


const port = 3333;

server.listen({port})
  .then(() => {
    console.log(`Running 🏃‍♂️ on ${port} my guy`)
  })

