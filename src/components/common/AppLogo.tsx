/**
 * App Logo — SVG recreation of Android ic_launcher_foreground.xml
 * Singing lips + "J" and "j" musical notes + sound arcs + sparkles
 */

interface AppLogoProps {
  size?: number;
}

export default function AppLogo({ size = 160 }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 108 108"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Lips gradient (gold → bronze → brown) */}
        <linearGradient id="lipsGrad" x1="54" y1="46" x2="54" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E3AD43" />
          <stop offset="0.35" stopColor="#D4960A" />
          <stop offset="0.7" stopColor="#795548" />
          <stop offset="1" stopColor="#5D4037" />
        </linearGradient>
        {/* Mouth interior radial gradient */}
        <radialGradient id="mouthGrad" cx="54" cy="65" r="15" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1A1210" />
          <stop offset="0.7" stopColor="#211A16" />
          <stop offset="1" stopColor="#2C2320" />
        </radialGradient>
      </defs>

      {/* LIPS — Soft outer glow (gold halo) */}
      <path
        d="M22,65 C22,52 32,43 43,48 C49,51 52,58.5 54,58 C56,57.5 59,50 65,48 C76,43 86,53 86,65 C86,76 72,86 54,86 C36,86 22,76 22,65 Z"
        fill="#E3AD43"
        fillOpacity="0.22"
      />

      {/* LIPS — Main outer shape (gold gradient) */}
      <path
        d="M26,65 C26,55 34,46.5 43,50 C48,52.5 52,58 54,57.5 C56,57 60,51.5 65,50 C74,46.5 82,55 82,65 C82,74 70,82 54,82 C38,82 26,74 26,65 Z"
        fill="url(#lipsGrad)"
      />

      {/* LIPS — Mouth interior (singing, open) */}
      <path
        d="M32,65 C32,59.5 42,55 54,55 C66,55 76,59.5 76,65 C76,70 66,74.5 54,74.5 C42,74.5 32,70 32,65 Z"
        fill="url(#mouthGrad)"
      />

      {/* Teeth hint — subtle white arc at top of mouth */}
      <path
        d="M39,58.5 Q46,56 54,56 Q62,56 69,58.5"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.40"
      />

      {/* LIPS — Highlight sheens */}
      <path
        d="M36,55 C40,51 45,50.5 43,54"
        stroke="#FFF5CC"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M65,50.5 C69,51.5 72,54 69,55.5"
        stroke="#FFF5CC"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.6"
      />
      <path
        d="M43,77 C49,80 59,80 65,77"
        stroke="#D4960A"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.35"
      />

      {/* "J" MUSICAL NOTE — left side (capital J) */}
      {/* J note head — tilted oval at bottom-left (the J hook) */}
      <path
        d="M27,43 C25,39 34,37 36,41 C38,45 29,47 27,43 Z"
        fill="#FFFFFF"
      />
      {/* J stem — vertical, from right of head upward */}
      <path
        d="M36.5,41 L36.5,20"
        stroke="#FFFFFF"
        strokeWidth="3.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* J flag — eighth-note flag curving right from stem top */}
      <path
        d="M36.5,20 C46,23.5 48,31 42,37"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* "j" MUSICAL NOTE — right side (lowercase j) */}
      {/* j dot (tittle) — small filled circle above stem */}
      <circle cx="72" cy="17" r="3" fill="#FFFFFF" />
      {/* j note head — tilted oval at bottom-left (the j hook) */}
      <path
        d="M63,43 C61,39.5 69,37.5 71,41 C73,44.5 65,46.5 63,43 Z"
        fill="#FFFFFF"
      />
      {/* j stem — vertical, from right of head upward */}
      <path
        d="M71.5,41 L71.5,23"
        stroke="#FFFFFF"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* j flag — smaller eighth-note flag curving right */}
      <path
        d="M71.5,23 C79,26 81,32 76,37"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* SOUND ARCS — singing emanation (muted sage) */}
      <path
        d="M22,59 Q16,65 22,71"
        stroke="#557767"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.70"
      />
      <path
        d="M18,55 Q10,65 18,75"
        stroke="#557767"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.40"
      />

      {/* SPARKLES — small accents */}
      {/* Star — small sage, upper centre between notes */}
      <path
        d="M54,22 L54.8,20.2 L56.5,19.5 L54.8,18.8 L54,17 L53.2,18.8 L51.5,19.5 L53.2,20.2 Z"
        fill="#557767"
        fillOpacity="0.85"
      />
      {/* Star — small gold, right side */}
      <path
        d="M86,55 L86.7,53.3 L88.5,52.5 L86.7,51.7 L86,50 L85.3,51.7 L83.5,52.5 L85.3,53.3 Z"
        fill="#E3AD43"
        fillOpacity="0.70"
      />
      {/* Dot — lower right (sage) */}
      <circle cx="85" cy="70" r="1.8" fill="#557767" fillOpacity="0.40" />
      {/* Dot — bottom left */}
      <circle cx="23" cy="78" r="1.5" fill="#FFFFFF" fillOpacity="0.30" />
    </svg>
  );
}
