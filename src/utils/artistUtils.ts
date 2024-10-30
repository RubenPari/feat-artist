import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Get a list of name of duo/group that the artist is in or has participated in
 */
async function getArtistGroupOrDuo(
  artistName: string,
): Promise<string[] | null> {
  const answer =
    `Answer me if the artist ${artistName} is in or has participated in a musical group or duo. Respond with 'no' or a list of artists (like 'Artist 1, Artist 2, Artist 3').`;

  const genAI = new GoogleGenerativeAI(
    Deno.env.get("GOOGLE_GEMINI_API_KEY")!,
  );

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(answer);
  const response = await result.response;
  const text = response.text();

  if (text === "no") {
    return null;
  }

  return text.split(", ");
}

export { getArtistGroupOrDuo };
