// deno-lint-ignore-file no-explicit-any
import Fastify from "fastify";
import * as process from "node:os";

const app = Fastify();

app.get("/", (_request: any, _reply: any) => {
    return { hello: "world" };
});

// Run the server!
app.listen({ port: 3000 }, function (err) {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
})
