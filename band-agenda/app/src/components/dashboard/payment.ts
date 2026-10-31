import type { DateItem } from "../../types";

/** Vanaf deze datum houden we betalingen bij; oudere (geïmporteerde) shows gelden als afgehandeld,
 *  tenzij iemand ze expliciet op "niet betaald" zet. */
export const PAYMENT_TRACKING_SINCE = "2026-10-01";

/** Kan er een betaling openstaan: afgelopen, bevestigde show met gage */
export const hasPayment = (s: DateItem, today: string) =>
  !s.isBlocked && s.status === "confirmed" && s.date < today && (parseFloat(s.guaranteedFee || "0") || 0) > 0;

/** Gage nog niet binnen: blijft zichtbaar en kleurt rood */
export const isUnpaid = (s: DateItem, today: string) =>
  hasPayment(s, today) && s.isPaid !== true && (s.isPaid === false || s.date >= PAYMENT_TRACKING_SINCE);
