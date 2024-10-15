import SpotifyWebApi from "spotify-web-api-node";

class SpotifyApiService {
  private static instance: SpotifyApiService;
  public client: SpotifyWebApi;

  private constructor() {
    this.client = new SpotifyWebApi({
      clientId: Deno.env.get("CLIENT_ID")!,
      clientSecret: Deno.env.get("CLIENT_SECRET")!,
      redirectUri: Deno.env.get("REDIRECT_URI")!,
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
