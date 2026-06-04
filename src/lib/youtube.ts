import { google } from "googleapis";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_SITE_URL + "/api/youtube/callback"
  );
}

export function getAuthUrl(state: string): string {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly",
    ],
    state,
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_at: Date }> {
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return {
    access_token: credentials.access_token!,
    expires_at: new Date(credentials.expiry_date!),
  };
}

export async function uploadShort(opts: {
  accessToken: string;
  refreshToken: string;
  filePath: string;
  title: string;
  description?: string;
}): Promise<{ videoId: string; url: string }> {
  const client = getOAuthClient();
  client.setCredentials({
    access_token: opts.accessToken,
    refresh_token: opts.refreshToken,
  });

  const youtube = google.youtube({ version: "v3", auth: client });
  const fs = await import("fs");

  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: opts.title.slice(0, 100),
        description: opts.description ?? "Créé avec Vertau — vertau.app",
        tags: ["shorts", "vertau"],
        categoryId: "22",
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      mimeType: "video/mp4",
      body: fs.createReadStream(opts.filePath),
    },
  });

  const videoId = response.data.id!;
  return {
    videoId,
    url: `https://youtube.com/shorts/${videoId}`,
  };
}
