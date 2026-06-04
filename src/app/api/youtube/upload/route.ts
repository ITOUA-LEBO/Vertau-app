import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadShort, refreshAccessToken } from "@/lib/youtube";
import path from "path";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { clipId } = await request.json();

  // Récupère le clip
  const { data: clip } = await supabase
    .from("clips")
    .select("*")
    .eq("id", clipId)
    .eq("user_id", user.id)
    .single();

  if (!clip?.file_path) {
    return NextResponse.json({ error: "Clip introuvable" }, { status: 404 });
  }

  // Récupère la connexion YouTube
  const { data: connection } = await supabase
    .from("oauth_connections")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "youtube")
    .single();

  if (!connection) {
    return NextResponse.json({ error: "Compte YouTube non connecté" }, { status: 400 });
  }

  // Rafraîchit le token si expiré
  let accessToken = connection.access_token;
  if (connection.expires_at && new Date(connection.expires_at) < new Date()) {
    const refreshed = await refreshAccessToken(connection.refresh_token);
    accessToken = refreshed.access_token;
    await supabase.from("oauth_connections").update({
      access_token: accessToken,
      expires_at: refreshed.expires_at.toISOString(),
    }).eq("id", connection.id);
  }

  // Upload sur YouTube
  const { videoId, url } = await uploadShort({
    accessToken,
    refreshToken: connection.refresh_token,
    filePath: clip.file_path,
    title: clip.title,
    description: `${clip.hook ?? ""}\n\nCréé avec Vertau — vertau.app`,
  });

  return NextResponse.json({ videoId, url });
}
