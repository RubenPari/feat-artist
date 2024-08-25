import { Context, Elysia } from 'elysia';
import SpotifyApiService from '../services/spotifyApiService';

const authMiddleware = new Elysia().derive(function (context: Context) {
  // Pass if request is for /auth endpoints
  if (context.path.startsWith('/auth')) {
    return;
  }

  const spotifyService = SpotifyApiService.getInstance();
  const accessToken = spotifyService.client.getAccessToken();

  if (!accessToken) {
    context.set.status = 401;
    context.body = {
      error: 'Unauthorized',
    };
    return;
  }
});

export default authMiddleware;
