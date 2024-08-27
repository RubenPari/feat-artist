import SpotifyApi from 'spotify-web-api-node';

interface TrackDto {
  uri: string;
  artists: SpotifyApi.ArtistObjectSimplified[];
  name: string;
  listeners: number;
}

export default TrackDto;
