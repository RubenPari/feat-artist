import axios from 'axios';

/**
 * Get a list of name of duo/group that the artist is in or has participated in
 */
async function getArtistGroupOrDuo(
  artistName: string
): Promise<string[] | null> {
  const aswere = `Aswer me if the artist ${artistName} is in or has participated in a musical group or duo. Responde with 'no' or a list of artists (like 'Artist 1, Artist 2, Artist 3').`;

  const options = {
    method: 'POST',
    url: process.env.X_RAPIDAPI_CHATGPT_BASE_ENDPOINT!,
    headers: {
      'x-rapidapi-key': process.env.X_RAPIDAPI_KEY!,
      'x-rapidapi-host': process.env.X_RAPIDAPI_CHATGPT_HOST!,
      'Content-Type': 'application/json',
    },
    data: {
      messages: [
        {
          role: 'user',
          content: aswere,
        },
      ],
      web_access: true,
    },
  };

  try {
    const response = await axios.request(options);

    const result = response.data.choices[0].message?.content;

    if (result === 'no') {
      return null;
    }

    return result.split(', ');
  } catch (error) {
    console.error('Error searching artist group or duo:', error);

    return null;
  }
}

export { getArtistGroupOrDuo };
