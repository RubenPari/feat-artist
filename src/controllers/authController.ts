import { v4 as uuidv4 } from "npm:uuid@^10.0.0";
import SpotifyApiService from "../services/spotifyApiService.ts";
import "jsr:@std/dotenv/load";
import { Context } from "elysia";
import console from "node:console";

const login = (context: Context) => {
  const scopes = Deno.env.get("SCOPES")
    ? Deno.env.get("SCOPES").split(" ")
    : [];

  const state = uuidv4();

  const authorizeURL = SpotifyApiService.getInstance().client
    .createAuthorizeURL(scopes, state);

  context.redirect(authorizeURL);
};

const callback = async (context: Context) => {
  const code = context.query.code;

  if (!code) {
    context.set.status = 400;
    context.body = {
      error: "No code provided",
    };
    return;
  }

  try {
    const data = await SpotifyApiService.getInstance().client
      .authorizationCodeGrant(code!);

    const { access_token, refresh_token } = data.body;

    SpotifyApiService.getInstance().client.setAccessToken(access_token);
    SpotifyApiService.getInstance().client.setRefreshToken(refresh_token);

    context.response = {
      "message": "You are now logged in to Spotify!",
    };
  } catch (error) {
    console.error(error);

    context.set.status = 500;
    context.body = {
      error: "Error occurred while logging in",
    };
  }
};

const logout = (context: Context) => {
  SpotifyApiService.getInstance().client.resetAccessToken();
  SpotifyApiService.getInstance().client.resetRefreshToken();

  context.response = {
    "message": "You have been logged out of Spotify!",
  };
};

export { callback, login, logout };
