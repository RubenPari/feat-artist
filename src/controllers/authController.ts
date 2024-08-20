import { FastifyReply, FastifyRequest } from "fastify";
import { v4 as uuidv4 } from "uuid";
import SpotifyApiService from "../services/spotifyApiService";
import "jsr:@std/dotenv/load";

const login = (_request: FastifyRequest, reply: FastifyReply) => {
  const scopes = Deno.env.get("SCOPES")
    ? Deno.env.get("SCOPES").split(" ")
    : [];

  const state = uuidv4();

  const authorizeURL = SpotifyApiService.getInstance().client
    .createAuthorizeURL(scopes, state);

  reply.redirect(authorizeURL);
};

const callback = async (request: FastifyRequest, reply: FastifyReply) => {
  const code = request.query.code as string;

  try {
    const data = await SpotifyApiService.getInstance().client
      .authorizationCodeGrant(code);

    const { access_token, refresh_token } = data.body;

    SpotifyApiService.getInstance().client.setAccessToken(access_token);
    SpotifyApiService.getInstance().client.setRefreshToken(refresh_token);

    reply.send("You are now logged in to Spotify!");
  } catch (error) {
    console.error(error);
    reply.send("An error occurred while trying to log in to Spotify.");
  }
};

const logout = (_request: FastifyRequest, reply: FastifyReply) => {
  SpotifyApiService.getInstance().client.resetAccessToken();
  SpotifyApiService.getInstance().client.resetRefreshToken();

  reply.send("You are now logged out of Spotify!");
};

export default {
  login,
  callback,
  logout,
};
