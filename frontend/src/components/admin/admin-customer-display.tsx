const AVATAR_COLORS = [
  "#c2410c",
  "#d4a373",
  "#365314",
  "#9a3412",
  "#b8834f",
  "#166534",
  "#92400e",
  "#7c2d12",
];

export function avatarInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

export function customerDisplayName(
  conversation: { displayName: string | null; lineUserId: string },
): string {
  return conversation.displayName?.trim() || conversation.lineUserId.slice(0, 8);
}

export function CustomerAvatar({
  name,
  seed,
  size = "md",
}: {
  name: string;
  seed: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <span
      className={`admin-customer-panel__avatar admin-customer-panel__avatar--${size}`}
      style={{ backgroundColor: avatarColor(seed) }}
      aria-hidden="true"
    >
      {avatarInitials(name)}
    </span>
  );
}
