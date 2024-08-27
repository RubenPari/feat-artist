import TrackDto from '../dto/trackDto';
import axios from 'axios';
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
} from '../constants/constants';

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
        t.name.includes('Remaster') &&
        track.name.includes('Remaster') &&
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
    const options = {
      method: 'GET',
      url: process.env.X_RAPIDAPI_BASE_ENDPOINT,
      params: {
        q: track.name,
      },
      headers: {
        'x-rapidapi-key': process.env.X_RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.X_RAPIDAPI_HOST,
      },
    };

    const response = await axios.request(options);

    // get number of views from YouTube video
    track.listeners = Number(response.data.contents[0].video.stats.views);
  }

  return tracks_1.sort((a, b) => b.listeners - a.listeners);
}

export { orderTracksByListeners, removeDuplicateTracks };
