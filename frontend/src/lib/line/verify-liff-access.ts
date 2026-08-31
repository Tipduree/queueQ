export type VerifiedLineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
};

export async function verifyLiffAccessToken(
  accessToken: string,
): Promise<VerifiedLineProfile | null> {
  const verifyRes = await fetch(
    `https://api.line.me/oauth2/v2.1/verify?access_token=${encodeURIComponent(accessToken)}`,
  );

  if (!verifyRes.ok) return null;

  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileRes.ok) return null;

  return (await profileRes.json()) as VerifiedLineProfile;
}
