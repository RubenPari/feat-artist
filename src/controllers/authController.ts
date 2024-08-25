import { v4 as uuidv4 } from 'uuid';
import SpotifyApiService from '../services/spotifyApiService';
import { Context } from 'elysia';

const login = (context: Context) => {
  const scopes = process.env.SCOPES ? process.env.SCOPES.split(' ') : [];

  const state = uuidv4();

  const authorizeURL =
    SpotifyApiService.getInstance().client.createAuthorizeURL(scopes, state);

  context.redirect(authorizeURL);
};

const callback = async (context: Context) => {
  const code = context.query.code;

  if (!code) {
    context.set.status = 400;
    context.body = {
      error: 'No code provided',
    };
    return;
  }

  try {
    const data =
      await SpotifyApiService.getInstance().client.authorizationCodeGrant(
        code!
      );

    const { access_token, refresh_token } = data.body;

    SpotifyApiService.getInstance().client.setAccessToken(access_token);
    SpotifyApiService.getInstance().client.setRefreshToken(refresh_token);

    context.response = {
      message: 'You are now logged in to Spotify!',
    };
  } catch (error) {
    console.error(error);

    context.set.status = 500;
    context.body = {
      error: 'Error occurred while logging in',
    };
  }
};

const logout = (context: Context) => {
  SpotifyApiService.getInstance().client.resetAccessToken();
  SpotifyApiService.getInstance().client.resetRefreshToken();

  context.response = {
    message: 'You have been logged out of Spotify!',
  };
};

export { callback, login, logout };
