import { getAccessToken } from "@/lib/spotify";

export async function GET() {
  const token = await getAccessToken();
  return Response.json({ token });
}