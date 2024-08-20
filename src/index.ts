import fastify from "fastify";
import setUpRoutes from "./routes/route";
import authMiddleware from "./middlewares/authMiddleware";
import process from "node:process";
import console from "node:console";

const server = fastify();

// set up middleware
server.addHook("preHandler", authMiddleware);

setUpRoutes(server);

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
