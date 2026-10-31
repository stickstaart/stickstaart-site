// Gedeelde constanten voor de band-agenda

import { createContext, useContext } from "react";

/** Namen van de leden van de band die nu open staat (per band anders, zie App). */
export const MembersContext = createContext<string[]>([]);
export const useMemberNames = () => useContext(MembersContext);

export const COUNTRIES = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albanië" }, { code: "DZ", name: "Algerije" },
  { code: "AD", name: "Andorra" }, { code: "AO", name: "Angola" }, { code: "AR", name: "Argentinië" },
  { code: "AM", name: "Armenië" }, { code: "AU", name: "Australië" }, { code: "AT", name: "Oostenrijk" },
  { code: "AZ", name: "Azerbeidzjan" }, { code: "BE", name: "België" }, { code: "BR", name: "Brazilië" },
  { code: "BG", name: "Bulgarije" }, { code: "CA", name: "Canada" }, { code: "CL", name: "Chili" },
  { code: "CN", name: "China" }, { code: "CO", name: "Colombia" }, { code: "HR", name: "Kroatië" },
  { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Tsjechië" }, { code: "DK", name: "Denemarken" },
  { code: "DE", name: "Duitsland" }, { code: "EE", name: "Estland" }, { code: "FI", name: "Finland" },
  { code: "FR", name: "Frankrijk" }, { code: "GR", name: "Griekenland" }, { code: "HU", name: "Hongarije" },
  { code: "IS", name: "IJsland" }, { code: "IE", name: "Ierland" }, { code: "IT", name: "Italië" },
  { code: "JP", name: "Japan" }, { code: "MX", name: "Mexico" }, { code: "NL", name: "Nederland" },
  { code: "NO", name: "Noorwegen" }, { code: "PL", name: "Polen" }, { code: "PT", name: "Portugal" },
  { code: "RO", name: "Roemenië" }, { code: "ES", name: "Spanje" }, { code: "SE", name: "Zweden" },
  { code: "CH", name: "Zwitserland" }, { code: "GB", name: "Verenigd Koninkrijk" }, { code: "US", name: "Verenigde Staten" }
].sort((a, b) => a.name.localeCompare(b.name));

export const displayName = (member: string) => member;
