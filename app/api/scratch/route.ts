import { getAccessToken, spotifyGet, getNowPlaying } from "@/lib/spotify";

export async function GET() {
  // const token = await getAccessToken();
  // return Response.json({ token });

  // const res = await spotifyGet(
  //   "/me/player/currently-playing",
  //   "no-store",
  //   true,
  // );
  // return Response.json(res);

  const res = await getNowPlaying("no-store");
  return Response.json(res);
}
