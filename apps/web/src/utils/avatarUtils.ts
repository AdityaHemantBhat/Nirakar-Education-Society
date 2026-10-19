/**
 * Generates a clean SVG data-URI avatar with the person's initials.
 * Used as a fallback when a faculty/alumni photo is missing or fails to load.
 * No external requests — zero flash of a wrong image.
 */
export function getInitialsAvatar(name: string, size = 256): string {
  // Extract up to two initials from the name (skip honorifics)
  const cleaned = name
    .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Shri|Smt\.)\s+/i, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (parts[0]?.[0] ?? '?').toUpperCase();

  // Deterministic hue from name string
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const bg = `hsl(${hue}, 42%, 32%)`;
  const fg = `hsl(${hue}, 80%, 90%)`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bg}" rx="${size * 0.18}"/>
  <text
    x="50%" y="54%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="${size * 0.38}"
    font-weight="700"
    fill="${fg}"
    letter-spacing="2"
  >${initials}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
