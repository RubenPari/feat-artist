import Fastify from "fastify";
import routes from "./routes/routes.ts";

const app = Fastify();

app.register(routes);

app.listen({ port: 3000 }, function (err) {
  if (err) {
    app.log.error(err);
    Deno.exit(1);
  }
});
