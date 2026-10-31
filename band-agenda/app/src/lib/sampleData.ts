// Voorbeelddata voor de demo: twee verzonnen bands, geen echte personen of contacten.
// Datums zijn relatief aan vandaag, zodat de demo altijd "actueel" oogt.

import type { Band, DateItem, Member, TourIdea } from "../types";

type SampleShow = Omit<DateItem, "owner" | "blockedBy"> & { ownerUid: string };
type SampleIdea = Omit<TourIdea, "owner"> & { ownerUid: string };
export interface SampleBand extends Band { members: Member[]; shows: SampleShow[]; ideas: SampleIdea[] }

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const sampleBands = (): SampleBand[] => [
  {
    id: "rotkop",
    name: "Rotkop",
    theme: "ORIGINAL",
    members: [
      { uid: "rotkop-ana", name: "Ana", role: "admin" },
      { uid: "rotkop-bram", name: "Bram", role: "member" },
      { uid: "rotkop-dewi", name: "Dewi", role: "member" },
      { uid: "rotkop-erik", name: "Erik", role: "member" },
    ],
    shows: [
      { id: "r1", ownerUid: "rotkop-ana", date: day(-20), country: "NL", city: "Utrecht", venue: "De Kelder", status: "confirmed", guaranteedFee: "350", isPaid: false, isPublic: true },
      { id: "r2", ownerUid: "rotkop-bram", date: day(-6), country: "BE", city: "Gent", venue: "Zaal Zuid", status: "confirmed", guaranteedFee: "400", isPaid: true, isPublic: true, otherbands: "Knalpot" },
      { id: "r3", ownerUid: "rotkop-ana", date: day(9), country: "DE", city: "Keulen", venue: "Bunker 7", status: "confirmed", guaranteedFee: "500", isPublic: true, tourName: "Winterroest Tour" },
      { id: "r4", ownerUid: "rotkop-ana", date: day(10), country: "DE", city: "Hamburg", venue: "Hafenkeller", status: "option", tourName: "Winterroest Tour" },
      { id: "r5", ownerUid: "rotkop-dewi", date: day(24), country: "NL", city: "Groningen", venue: "Het Pakhuis", status: "option" },
      { id: "r6", ownerUid: "rotkop-erik", date: day(41), country: "FR", city: "Rijsel", venue: "La Cave", status: "cancelled" },
      { id: "rb1", ownerUid: "rotkop-dewi", date: day(23), endDate: day(30), country: "NL", city: "GEBLOKKEERD", venue: "", status: "cancelled", isBlocked: true, reason: "Vakantie" },
      { id: "rb2", ownerUid: "rotkop-bram", date: day(10), country: "NL", city: "GEBLOKKEERD", venue: "", status: "cancelled", isBlocked: true, reason: "Bruiloft" },
    ],
    ideas: [
      { id: "ri1", ownerUid: "rotkop-erik", title: "Scandinavië-rondje", country: "SE", targetPeriod: "Voorjaar", notes: "Vijf shows, met de nachtboot heen" },
      { id: "ri2", ownerUid: "rotkop-ana", title: "Split-ep releasetour", country: "NL", targetPeriod: "Najaar" },
    ],
  },
  {
    id: "lawaai",
    name: "Stil Lawaai",
    theme: "Superdark",
    members: [
      { uid: "lawaai-cees", name: "Cees", role: "admin" },
      { uid: "lawaai-fem", name: "Fem", role: "member" },
      { uid: "lawaai-gijs", name: "Gijs", role: "member" },
    ],
    shows: [
      { id: "l1", ownerUid: "lawaai-cees", date: day(5), country: "NL", city: "Nijmegen", venue: "Het Gat", status: "confirmed", guaranteedFee: "250", isPublic: true },
      { id: "l2", ownerUid: "lawaai-fem", date: day(19), country: "NL", city: "Leiden", venue: "Bar Bas", status: "option" },
      { id: "lb1", ownerUid: "lawaai-gijs", date: day(19), country: "NL", city: "GEBLOKKEERD", venue: "", status: "cancelled", isBlocked: true, reason: "Studio met andere band" },
    ],
    ideas: [{ id: "li1", ownerUid: "lawaai-cees", title: "Festivalzomer", targetPeriod: "Zomer" }],
  },
];
