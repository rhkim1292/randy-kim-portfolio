import { getAccessToken } from "@/lib/spotify";
import { spotifyGet } from "@/lib/spotify";

export async function GET() {
  // const token = await getAccessToken();
  // return Response.json({ token });
  const res = await spotifyGet("/me/player/currently-playing", "no-store", true);
  return Response.json(res);
}
