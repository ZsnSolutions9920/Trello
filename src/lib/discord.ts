const DISCORD_API = "https://discord.com/api/v10";

function getBotToken() {
  return process.env.DISCORD_BOT_TOKEN || "";
}

async function discordFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${DISCORD_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Discord API error ${res.status}: ${body.message || res.statusText}`);
  }

  return res.json();
}

// OAuth: exchange authorization code for access token
export async function exchangeCode(code: string): Promise<{ access_token: string }> {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID || "",
      client_secret: process.env.DISCORD_CLIENT_SECRET || "",
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI || "",
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Discord token exchange failed: ${body.error_description || res.statusText}`);
  }

  return res.json();
}

// OAuth: get the authenticated Discord user's profile
export async function getDiscordUser(accessToken: string): Promise<{ id: string; username: string }> {
  return discordFetch("/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// Bot: create a DM channel with a user
export async function createDMChannel(discordUserId: string): Promise<{ id: string }> {
  return discordFetch("/users/@me/channels", {
    method: "POST",
    headers: { Authorization: `Bot ${getBotToken()}` },
    body: JSON.stringify({ recipient_id: discordUserId }),
  });
}

// Bot: send a message to a channel
export async function sendMessage(channelId: string, content: string): Promise<void> {
  await discordFetch(`/channels/${channelId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bot ${getBotToken()}` },
    body: JSON.stringify({ content }),
  });
}

// Bot: send a DM to a Discord user (creates channel + sends)
export async function sendDirectMessage(discordUserId: string, content: string): Promise<void> {
  const channel = await createDMChannel(discordUserId);
  await sendMessage(channel.id, content);
}

// Bot: send attendance notification to a channel with photo attachment
export async function sendAttendanceToDiscord(content: string, photoBase64: string): Promise<void> {
  const channelId = process.env.DISCORD_ATTENDANCE_CHANNEL_ID;
  if (!channelId) {
    console.warn("DISCORD_ATTENDANCE_CHANNEL_ID not set, skipping attendance notification");
    return;
  }

  // Convert base64 to buffer for multipart upload
  const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Data, "base64");

  const formData = new FormData();
  formData.append("content", content);
  formData.append("files[0]", new Blob([imageBuffer], { type: "image/jpeg" }), "attendance.jpg");

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bot ${getBotToken()}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Discord attendance send failed: ${body.message || res.statusText}`);
  }
}

// Build the OAuth2 authorization URL
export function getOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID || "",
    redirect_uri: process.env.DISCORD_REDIRECT_URI || "",
    response_type: "code",
    scope: "identify",
    state,
  });
  return `https://discord.com/api/oauth2/authorize?${params}`;
}
