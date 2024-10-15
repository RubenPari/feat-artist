import spotifyApiService from "./spotifyApiService.ts";
import RemoveAllPlaylistTracksResponse from "../models/RemoveAllPlaylistTracksResponse.ts";

async function addTracksToPlaylist(
    idPlaylist: string,
    tracks: string[],
): Promise<boolean> {
    const limit = 100;
    let offset = 0;

    while (offset < tracks.length) {
        const currentTracks = tracks.slice(offset, offset + limit);

        try {
            const added = await spotifyApiService
                .getInstance()
                .client.addTracksToPlaylist(
                    idPlaylist,
                    currentTracks,
                );

            if (added.statusCode !== 201) {
                console.error(`Failed to add tracks, error: ${added.body}`);
                return false;
            }
        } catch (error) {
            console.error("Error adding tracks to playlist:", error);
            return false;
        }

        offset += limit;
    }

    return true;
}

async function removeAllPlaylistTracks(
    id: string,
): Promise<RemoveAllPlaylistTracksResponse> {
    let responseStatus = RemoveAllPlaylistTracksResponse.Successful;

    const urlEndpoint = new URL(
        "/playlist/delete-tracks",
        Deno.env.get("CLEAR_SONGS_API_BASE_URL")!,
    );
    urlEndpoint.searchParams.set("id", id);

    const request = new Request(
        urlEndpoint,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );

    try {
        const response = await fetch(request);

        switch (response.status) {
            case 500:
                console.error("Failed to clear playlist");
                responseStatus = RemoveAllPlaylistTracksResponse.Failed;
                break;
            case 401:
                console.error("Unauthorized to clear playlist");
                responseStatus = RemoveAllPlaylistTracksResponse.Unauthorized;
                break;
        }
    } catch (error) {
        console.error(error);
        responseStatus = RemoveAllPlaylistTracksResponse.Failed;
    }

    return responseStatus;
}

export { addTracksToPlaylist, removeAllPlaylistTracks };
