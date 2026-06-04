import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { getOAuthClient } from "@/lib/youtube";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const origin = new URL(request.url).origin;
  const redirect = (path: string) => NextResponse.redirect(`${origin}${path}`);

  // Accès refusé par l'utilisateur
  if (error) {
    return redirect("/dashboard/settings/connections?error=cancelled");
  }

  if (!code || !state) {
    return redirect("/dashboard/settings/connections?error=invalid");
  }

  // Vérifie le state CSRF
  const cookieStore = await cookies();
  const savedState = cookieStore.get("youtube_oauth_state")?.value;
  cookieStore.delete("youtube_oauth_state");

  if (state !== savedState) {
    return redirect("/dashboard/settings/connections?error=csrf");
  }

  // Récupère l'utilisateur Supabase
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Échange le code contre les tokens
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Récupère les infos du channel YouTube
  const youtube = google.youtube({ version: "v3", auth: client });
  const { data: channelData } = await youtube.channels.list({
    part: ["snippet"],
    mine: true,
  });

  const channel = channelData.items?.[0];
  const channelId = channel?.id ?? "";
  const channelName = channel?.snippet?.title ?? "Ma chaîne";
  const channelAvatar = channel?.snippet?.thumbnails?.default?.url ?? null;

  // Sauvegarde dans Supabase
  await supabase.from("oauth_connections").upsert({
    user_id: user.id,
    provider: "youtube",
    provider_user_id: channelId,
    channel_name: channelName,
    channel_avatar: channelAvatar,
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token ?? null,
    expires_at: tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,provider" });

  return redirect("/dashboard/settings/connections?success=youtube");
}
