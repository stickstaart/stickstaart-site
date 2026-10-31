import type { DateItem } from "../../types";
import { displayName } from "./constants";

/** Namen uit blockedBy; oude records kunnen nog "Rob, Johnny" bevatten */
export const blockNames = (b: DateItem) =>
  (b.blockedBy || "?").split(",").map((n) => displayName(n.trim())).filter(Boolean);

/** Wie is er afwezig op deze datum (losse dagen én periodes die de datum dekken) */
export const absentOn = (date: string, items: DateItem[]) => [
  ...new Set(
    items
      .filter((b) => b.isBlocked && b.date <= date && (b.endDate || b.date) >= date)
      .flatMap(blockNames),
  ),
];
