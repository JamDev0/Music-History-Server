import fastify from "fastify";


//@ts-ignore
const server = fastify();

const port = 3333;

server.listen({port})
  .then(() => {
    console.log(`Running 🏃‍♂️ on ${port} my guy`)
  })

