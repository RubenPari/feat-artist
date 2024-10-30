import { FastifyInstance } from "fastify";
import { callback, login, logout } from "../controllers/authControllers.ts";
import featArtist from "../controllers/featArtistController.ts";

export default (app: FastifyInstance) => {
  app.register((auth, _opts, done) => {
    auth.get("/login", login);
    auth.get("/callback", callback);
    auth.get("/logout", logout);
    done();
  }, { prefix: "/auth" });

  app.register((base, _opts, done) => {
    base.post("/feat-artist", featArtist);
    done();
  });
};
