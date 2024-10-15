import SpotifyApi from "spotify-web-api-node";

export default interface TrackDto {
  uri: string;
  artists: SpotifyApi.ArtistObjectSimplified[];
  name: string;
  listeners: number;
}
