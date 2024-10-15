import SpotifyApi from "spotify-web-api-node";
import TrackDto from "../dto/trackDto.ts";
import convertTracksObjectToDto from "../utils/convertTracksObjectToDto.ts";
import SpotifyApiService from "./spotifyApiService.ts";
import { getArtistGroupOrDuo } from "../utils/artistUtils.ts";

const client = SpotifyApiService.getInstance().client;

/**
 * Search tracks with query string artist name
 */
async function searchTracksArtist(artistName: string): Promise<TrackDto[]> {
  const limit = 50;
  let offset = 0;
  const maxOffset = 1000;

  const tracks = Array<SpotifyApi.TrackObjectFull>();

  while (offset < maxOffset) {
    const searchTracksArtist = await client.searchTracks(artistName, {
      limit,
      offset,
    });

    tracks.push(...(searchTracksArtist.body.tracks?.items ?? []));

    offset += limit;
  }

  return convertTracksObjectToDto(tracks);
}

/**
 * Search tracks with query string "feat. {artist name}"
 */
async function searchTracksFeatArtist(artistName: string): Promise<TrackDto[]> {
  const limit = 50;
  let offset = 0;
  const maxOffset = 1000;

  const tracks = Array<SpotifyApi.TrackObjectFull>();

  while (offset < maxOffset) {
    const searchTracksFeatArtist = await client.searchTracks(
      `feat. ${artistName}`,
      {
        limit,
        offset,
      },
    );

    tracks.push(...(searchTracksFeatArtist.body.tracks?.items ?? []));

    offset += limit;
  }

  return convertTracksObjectToDto(tracks);
}

/**
 * Search tracks with query string "with {artist name}"
 */
async function searchTracksWithArtist(artistName: string): Promise<TrackDto[]> {
  const limit = 50;
  let offset = 0;
  const maxOffset = 1000;

  const tracks = Array<SpotifyApi.TrackObjectFull>();

  while (offset < maxOffset) {
    const searchTracksWithArtist = await client.searchTracks(
      `with ${artistName}`,
      {
        limit,
        offset,
      },
    );

    tracks.push(...(searchTracksWithArtist.body.tracks?.items ?? []));

    offset += limit;
  }

  return convertTracksObjectToDto(tracks);
}

/**
 * get all tracks from groups or duos of artist (if exist)
 */
async function searchArtistGroupOrDuo(
  artistName: string,
): Promise<TrackDto[] | null> {
  const tracks = Array<SpotifyApi.TrackObjectFull>();

  // check if artist is or has been in a group or duo
  const groupsOrDuosNames = await getArtistGroupOrDuo(artistName);

  if (!groupsOrDuosNames) {
    return null;
  }

  for (const groupName of groupsOrDuosNames) {
    // get group or duo id from name
    const groupOrDuoIdresult = await SpotifyApiService.getInstance().client
      .searchArtists(groupName);

    const groupOrDuoId = groupOrDuoIdresult.body.artists!.items[0].id;

    // get all tracks from group or duo
    // first get all albums from group or duo
    const groupOrDuoAlbumsResult = await SpotifyApiService.getInstance().client
      .getArtistAlbums(
        groupOrDuoId,
      );

    const groupOrDuoAlbums = groupOrDuoAlbumsResult.body.items;

    // foreach album get all tracks
    for (const album of groupOrDuoAlbums) {
      const albumTracksResult = await SpotifyApiService.getInstance().client
        .getAlbumTracks(album.id);

      tracks.push(
        ...convertSimplifiedTrackToFull(albumTracksResult.body.items),
      );
    }
  }

  return convertTracksObjectToDto(tracks);
}

function convertSimplifiedTrackToFull(
  simplifiedTracks: SpotifyApi.TrackObjectSimplified[],
): SpotifyApi.TrackObjectFull[] {
  return simplifiedTracks.map((track: SpotifyApi.TrackObjectSimplified) => {
    return {
      name: track.name,
      uri: track.uri,
      artists: track.artists,
    } as SpotifyApi.TrackObjectFull;
  });
}

export {
  searchArtistGroupOrDuo,
  searchTracksArtist,
  searchTracksFeatArtist,
  searchTracksWithArtist,
};
