import TrackDto from "../dto/trackDto.ts";
import SpotifyApi from "spotify-web-api-node";

export default function convertTracksObjectToDto(
  tracksObjects:
    | SpotifyApi.TrackObjectFull[]
    | SpotifyApi.TrackObjectSimplified[],
): TrackDto[] {
  return tracksObjects.map((track) => {
    return {
      name: track.name,
      uri: track.uri,
      artists: track.artists,
      listeners: 0,
    };
  });
}
