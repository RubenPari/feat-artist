import { FastifyInstance } from "fastify";
import authController from "../controllers/authController";
import featEminemController from "../controllers/featEminemController";

const setUpRoutes = (fastify: FastifyInstance) => {
  // ######## /auth ########
  fastify.register(
    (fastify, _opts, done) => {
      fastify.get("/login", authController.login);
      fastify.get("/callback", authController.callback);
      fastify.get("/logout", authController.logout);
      done();
    },
    { prefix: "/auth" },
  );

  // ######## /feat-artist ########
  fastify.register(
    (fastify, _opts, done) => {
      fastify.get("/", featEminemController.featEminem);
      done();
    },
    { prefix: "/feat-artist" },
  );
};

export default setUpRoutes;
