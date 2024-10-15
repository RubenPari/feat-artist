// deno-lint-ignore-file
import {
  searchArtistGroupOrDuo,
  searchTracksArtist,
  searchTracksFeatArtist,
  searchTracksWithArtist,
} from "../services/trackService.ts";
import {
  addTracksToPlaylist,
  removeAllPlaylistTracks,
} from "../services/playlistService.ts";
import RemoveAllPlaylistTracksResponse from "../models/RemoveAllPlaylistTracksResponse.ts";
import SpotifyApiService from "../services/spotifyApiService.ts";
import { orderTracksByListeners } from "../utils/trackUtils.ts";
import TrackDto from "../dto/trackDto.ts";
import { FastifyReply, FastifyRequest } from "fastify";

const featArtist = async (request: FastifyRequest, reply: FastifyReply) => {
  const idArtist = (request.query as { id: string }).id;

  if (!idArtist) {
    reply.status(400).send({ error: "No id provided" });
    return;
  }

  const artist = await SpotifyApiService.getInstance().client.getArtist(
    idArtist,
  );
  if (!artist.body) {
    reply.status(404).send({ error: "Artist not found" });
    return;
  }

  const artistName = artist.body.name;

  const tracks = await Promise.all([
    searchTracksArtist(artistName),
    searchTracksFeatArtist(artistName),
    searchTracksWithArtist(artistName),
    searchArtistGroupOrDuo(artistName),
  ]);

  const filteredTracks = tracks.flat().filter((track): TrackDto | null => {
    return track &&
        track.artists[0].name !== artistName &&
        !!track.artists.find((artist) => artist.name === artistName)
      ? track
      : null;
  }) as TrackDto[];

  const orderedTracks = await orderTracksByListeners(filteredTracks);

  const playlistId = await getOrCreatePlaylist(artistName);

  const cleared = await removeAllPlaylistTracks(playlistId);

  if (cleared === RemoveAllPlaylistTracksResponse.Failed) {
    reply.status(500).send({ error: "Failed to clear playlist" });
    return;
  }

  const added = await addTracksToPlaylist(
    playlistId,
    orderedTracks.map((track) => track.uri),
  );

  if (!added) {
    reply.status(500).send({ error: "Failed to add tracks to playlist" });
    return;
  }

  reply.send({ message: "Playlist updated" });
};

const getOrCreatePlaylist = async (artistName: string) => {
  const userPlaylists = await SpotifyApiService.getInstance().client
    .getUserPlaylists();
  const playlist = userPlaylists.body.items.find(
    (playlist: any) => playlist.name === `Feat. ${artistName}`,
  );
  if (!playlist) {
    const createdPlaylist = await SpotifyApiService.getInstance().client
      .createPlaylist(
        `Feat. ${artistName}`,
        { description: `Playlist for feat. ${artistName}` },
      );
    return createdPlaylist.body.id;
  }
  return playlist.id;
};

export default featArtist;
