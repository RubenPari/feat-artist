import SpotifyWebApi from "npm:spotify-web-api-node@5.0.2";
import "jsr:@std/dotenv/load";

class SpotifyApiService {
  private static instance: SpotifyApiService;
  public client: SpotifyWebApi;

  private constructor() {
    this.client = new SpotifyWebApi({
      clientId: Deno.env.get("CLIENT_ID"),
      clientSecret: Deno.env.get("CLIENT_SECRET"),
      redirectUri: Deno.env.get("REDIRECT_URI"),
    });
  }

  public static getInstance(): SpotifyApiService {
    if (!SpotifyApiService.instance) {
      SpotifyApiService.instance = new SpotifyApiService();
    }
    return SpotifyApiService.instance;
  }
}

export default SpotifyApiService;
