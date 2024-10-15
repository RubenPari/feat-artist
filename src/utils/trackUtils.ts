import { GoogleGenerativeAI } from "@google/generative-ai";
import TrackDto from "../dto/trackDto.ts";
import {
    ACOUSTIC,
    CLEAR,
    DETRIMENTAL,
    EDITED,
    INSTRUMENTAL,
    INTERNATIONAL_RADIO_EDIT,
    LIVE,
    NBA_VERSION,
    RADIO_EDIT,
} from "../costants/constants.ts";

/**
 * Remove duplicate tracks based on track name
 */
function removeDuplicateTracks(tracks: TrackDto[]): TrackDto[] {
    // filter tracks with extra content in name
    let filteredTracks = tracks.filter((track) => {
        return (
            !track.name.includes(INTERNATIONAL_RADIO_EDIT) &&
            !track.name.includes(RADIO_EDIT) &&
            !track.name.includes(LIVE) &&
            !track.name.includes(EDITED) &&
            !track.name.includes(ACOUSTIC) &&
            !track.name.includes(INSTRUMENTAL) &&
            !track.name.includes(NBA_VERSION) &&
            !track.name.includes(CLEAR) &&
            !track.name.includes(DETRIMENTAL)
        );
    });

    // remove track where string name is similar (80%) to another track
    filteredTracks = filteredTracks.filter((track) => {
        return !filteredTracks.find((t) => {
            return t.name.includes(track.name) && t.name !== track.name;
        });
    });

    // remove duplicates based on multiple remastered versions
    // (es "2007 Remaster" and "2005 Remaster" taking "2007 Remaster" only)
    filteredTracks = filteredTracks.filter((track) => {
        return !filteredTracks.find((t) => {
            return (
                t.name.includes("Remaster") &&
                track.name.includes("Remaster") &&
                t.name !== track.name
            );
        });
    });

    // remove duplicates based on track name completely equal
    filteredTracks = filteredTracks.filter((track, index, self) => {
        return index === self.findIndex((t) => t.name === track.name);
    });

    return filteredTracks;
}

async function orderTracksByListeners(tracks: TrackDto[]): Promise<TrackDto[]> {
    const tracks_1 = tracks.slice(0, 5);

    for (const track of tracks_1) {
        const answer = "Il video della traccia " + track.name +
            ' presente su youtube come video ufficiale (o nel caso in cui non ci sia quello che viene considerato "de-facto" quello di riferimento) quante visualizzazioni ha? Rispondi solo con il numero intero';

        const genAI = new GoogleGenerativeAI(
            Deno.env.get("GOOGLE_GEMINI_API_KEY")!,
        );

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(answer);
        const response = await result.response;
        const textResponse = response.text();

        // try to convert text number to number type
        try {
            track.listeners = Number(textResponse);
        } catch (_) {
            track.listeners = 0;
        }

        if (isNaN(track.listeners)) {
            track.listeners = 0;
        }

        track.listeners = Math.round(track.listeners);
    }

    return tracks_1.sort((a, b) => b.listeners - a.listeners);
}

export { orderTracksByListeners, removeDuplicateTracks };
