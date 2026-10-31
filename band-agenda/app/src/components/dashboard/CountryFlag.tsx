import React from "react";

interface CountryFlagProps {
  code: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ code }) => {
  if (!code) return null;
  const isoCode = code.toLowerCase();

  return (
    <img
      src={`/flags/4x3/${isoCode}.svg`}
      alt={code}
      className="w-4 h-3 inline-block object-cover rounded-[1px] shadow-sm mr-1.5 align-middle"
      onError={(e) => {
        (e.target as HTMLElement).style.display = "none";
      }}
    />
  );
};

/** "Afwezig"-vlag: Zwitserse vlag met het kruis 45° gedraaid (wit ✕ op rood).
 *  Zelfde formaat (4:3, w-4 h-3) als de landvlaggen, zodat hij er netjes tussen past. */
export const UnavailableFlag: React.FC = () => (
  <svg
    viewBox="0 0 32 24"
    className="w-4 h-3 inline-block shrink-0 rounded-[1px] shadow-sm mr-1.5 align-middle"
    role="img"
    aria-label="Afwezig"
  >
    <rect width="32" height="24" fill="#da291c" />
    <g transform="rotate(45 16 12)" fill="#fff">
      <rect x="13.75" y="4.5" width="4.5" height="15" />
      <rect x="8.5" y="9.75" width="15" height="4.5" />
    </g>
  </svg>
);
