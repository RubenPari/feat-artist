import {
  searchArtistGroupOrDuo,
  searchTracksArtist,
  searchTracksFeatArtist,
  searchTracksWithArtist,
} from '../services/trackService';
import {
  addTracksToPlaylist,
  removeAllPlaylistTracks,
} from '../services/playlistService';
import TrackDto from '../dto/trackDto';
import RemoveAllPlaylistTracksResponse from '../models/RemoveAllPlaylistTracksResponse';
import { Context } from 'elysia';
import SpotifyApiService from '../services/spotifyApiService';
import {
  orderTracksByListeners,
  removeDuplicateTracks,
} from '../utils/trackUtils';

const featArtist = async (context: Context) => {
  // get id artist query parameter
  const idArtist = context.query.id;

  if (!idArtist) {
    context.set.status = 400;
    context.body = {
      error: 'No id provided',
    };
    return;
  }

  // get artist name from id
  const artist =
    await SpotifyApiService.getInstance().client.getArtist(idArtist);

  if (!artist.body) {
    context.set.status = 404;
    context.body = {
      error: 'Artist not found',
    };
    return;
  }

  const artistName = artist.body.name;

  // search all tracks with query artist name and where first artist isn't then
  const searchTracksArtistResult = await searchTracksArtist(artistName);
  const searchTracksFeatArtistResult = await searchTracksFeatArtist(artistName);
  const searchTracksWithArtistResult = await searchTracksWithArtist(artistName);
  const searchGroupOrDuoArtistResult = await searchArtistGroupOrDuo(artistName);

  // combine all search results
  const tracks = searchTracksArtistResult.concat(
    searchTracksFeatArtistResult,
    searchTracksWithArtistResult
  );

  // filter out tracks where artist is present but not as first artist
  const filteredTracks = tracks.filter((track) => {
    return (
      track.artists[0].name !== artistName &&
      track.artists.find((artist) => artist.name === artistName)
    );
  });

  // added tracks from group/duo
  if (searchGroupOrDuoArtistResult) {
    filteredTracks.push(...searchGroupOrDuoArtistResult);
  }

  const uniqueTracks = removeDuplicateTracks(filteredTracks);

  // order tracks by number of listeners on YouTube
  let orderedTracks = new Array<TrackDto>();
  try {
    orderedTracks = await orderTracksByListeners(uniqueTracks);
  } catch (e) {
    console.log(e);

    context.set.status = 500;
    context.body = {
      error: 'Failed to order tracks by listeners',
      messagge: e as string,
    };
    return;
  }

  // get or create playlist for feat. {artist name}
  let playlistId: string;

  // search if user logged in have a playlist named "Feat. {artist name}"
  const userPlaylists =
    await SpotifyApiService.getInstance().client.getUserPlaylists();

  const playlist = userPlaylists.body.items.find(
    (playlist) => playlist.name === `Feat. ${artistName}`
  );

  // if playlist doesn't exist, create it
  if (!playlist) {
    const createdPlaylist =
      await SpotifyApiService.getInstance().client.createPlaylist(
        `Feat. ${artistName}`,
        {
          description: `Playlist for feat. ${artistName}`,
        }
      );

    if (!createdPlaylist.body) {
      context.set.status = 500;
      context.body = {
        error: 'Failed to create playlist for artist' + artistName,
      };
      return;
    }

    playlistId = createdPlaylist.body.id;
  }

  playlistId = playlist!.id;

  // clear playlist before adding new tracks
  const cleared = await removeAllPlaylistTracks(playlistId);

  switch (cleared) {
    case RemoveAllPlaylistTracksResponse.Unauthorized:
      context.set.status = 401;
      context.body = {
        error: 'Unauthorized',
      };
      break;
    case RemoveAllPlaylistTracksResponse.Failed:
      context.set.status = 500;
      context.body = {
        error: 'Failed to clear playlist',
      };
      break;
  }

  // add tracks to playlist
  const added = await addTracksToPlaylist(
    orderedTracks.map((track) => track.uri)
  );

  if (!added) {
    context.set.status = 500;
    context.body = {
      error: 'Failed to add tracks to playlist',
    };
    return;
  }

  context.body = {
    message: 'Tracks added to playlist',
  };
};

export default {
  featArtist,
};
