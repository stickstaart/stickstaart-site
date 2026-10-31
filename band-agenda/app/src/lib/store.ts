// Opslaglaag: één interface, twee uitvoeringen.
//   - demoStore (nu): voorbeelddata in de browser (localStorage), geen login nodig.
//   - firestoreStore (fase 2): dezelfde functies op bands/{bandId}/... in Firestore.
// De demo past dezelfde eigenaarsregels toe als firestore.rules, zodat de demo zich gedraagt als het echte product.
import type { DateItem, Member, TourIdea } from "../types";
import { sampleBands } from "./sampleData";

type Unsubscribe = () => void;

export interface Actor {
  /** Echte gebruiker (bij "werken als" blijft dit de superadmin) */
  uid: string;
  isSuperadmin: boolean;
}

export interface AgendaStore {
  newId(): string;
  subscribeShows(cb: (s: DateItem[]) => void, onError?: (e: Error) => void): Unsubscribe;
  subscribeIdeas(cb: (i: TourIdea[]) => void, onError?: (e: Error) => void): Unsubscribe;
  saveShow(show: DateItem, isNew: boolean): Promise<void>;
  patchShow(current: DateItem, fields: Partial<DateItem>): Promise<void>;
  deleteShow(id: string): Promise<void>;
  saveIdea(idea: TourIdea, isNew: boolean): Promise<void>;
  patchIdea(id: string, fields: Partial<TourIdea>): Promise<void>;
  deleteIdea(id: string): Promise<void>;
}

/** Zelfde controle als canCreateOwned/canUpdateOwned/canDeleteOwned in firestore.rules */
export function checkOwnership(actor: Actor, members: Member[], before: { ownerUid?: string } | undefined, after: { ownerUid?: string } | undefined) {
  if (actor.isSuperadmin) {
    if (after && !members.some((m) => m.uid === after.ownerUid)) throw new Error("Eigenaar is geen lid van deze band.");
    return;
  }
  const isMember = members.some((m) => m.uid === actor.uid);
  if (!isMember) throw new Error("Je bent geen lid van deze band.");
  if (before && before.ownerUid !== actor.uid) throw new Error("Alleen de eigenaar kan dit wijzigen.");
  if (after && after.ownerUid !== actor.uid) throw new Error("Je kunt alleen items op je eigen naam zetten.");
}

// ---------- Demo: voorbeelddata in localStorage ----------

interface DemoData { shows: DateItem[]; ideas: TourIdea[] }

const demoKey = (bandId: string) => `band_agenda_demo_${bandId}`;

function seed(bandId: string): DemoData {
  const band = sampleBands().find((b) => b.id === bandId);
  if (!band) return { shows: [], ideas: [] };
  const audit = (uid: string) => ({ createdBy: uid, updatedBy: uid });
  return {
    shows: band.shows.map((s) => ({ ...s, ...audit(s.ownerUid) })),
    ideas: band.ideas.map((i) => ({ ...i, ...audit(i.ownerUid) })),
  };
}

function readDemo(bandId: string): DemoData {
  try {
    const raw = localStorage.getItem(demoKey(bandId));
    if (raw) return JSON.parse(raw);
  } catch {
    /* kapotte of geblokkeerde opslag: opnieuw beginnen */
  }
  return seed(bandId);
}

/** Demo terug naar de beginstand (knop in Instellingen) */
export function resetDemo(bandId: string) {
  try {
    localStorage.removeItem(demoKey(bandId));
  } catch {
    /* niets aan te doen */
  }
}

export function demoStore(bandId: string, members: Member[], actor: Actor): AgendaStore {
  let data = readDemo(bandId);
  const showSubs = new Set<(s: DateItem[]) => void>();
  const ideaSubs = new Set<(i: TourIdea[]) => void>();

  const nameOf = (uid?: string) => members.find((m) => m.uid === uid)?.name;
  const uidOf = (name?: string) => members.find((m) => m.name === name)?.uid;
  // Schermen werken met namen; opslag met uid's
  const viewShow = (s: DateItem): DateItem => ({ ...s, owner: nameOf(s.ownerUid), blockedBy: s.blockedBy ?? (s.isBlocked ? nameOf(s.ownerUid) : undefined) });
  const viewIdea = (i: TourIdea): TourIdea => ({ ...i, owner: nameOf(i.ownerUid) });
  const toStored = <T extends { owner?: string; ownerUid?: string }>(item: T): T => {
    const { owner, ...rest } = item;
    return { ...rest, ownerUid: uidOf(owner) ?? item.ownerUid } as T;
  };

  const emit = () => {
    try {
      localStorage.setItem(demoKey(bandId), JSON.stringify(data));
    } catch {
      /* privévenster: demo werkt dan alleen in dit tabblad */
    }
    const shows = data.shows.map(viewShow);
    const ideas = data.ideas.map(viewIdea);
    showSubs.forEach((cb) => cb(shows));
    ideaSubs.forEach((cb) => cb(ideas));
  };

  const write = async <T extends { id: string; ownerUid?: string; createdBy?: string }>(list: T[], next: T | null, id: string, isNew: boolean): Promise<T[]> => {
    const before = list.find((x) => x.id === id);
    if (isNew && before) throw new Error("Bestaat al.");
    if (!isNew && !before) throw new Error("Niet gevonden.");
    checkOwnership(actor, members, before, next ?? undefined);
    if (!next) return list.filter((x) => x.id !== id);
    const stamped = { ...next, createdBy: before?.createdBy ?? actor.uid, updatedBy: actor.uid };
    return before ? list.map((x) => (x.id === id ? stamped : x)) : [...list, stamped];
  };

  const clean = <T extends object>(o: T): T => JSON.parse(JSON.stringify(o));

  return {
    newId: () => Math.random().toString(36).slice(2, 12),
    subscribeShows(cb) {
      showSubs.add(cb);
      cb(data.shows.map(viewShow));
      return () => showSubs.delete(cb);
    },
    subscribeIdeas(cb) {
      ideaSubs.add(cb);
      cb(data.ideas.map(viewIdea));
      return () => ideaSubs.delete(cb);
    },
    async saveShow(show, isNew) {
      data = { ...data, shows: await write(data.shows, clean(toStored(show)), show.id, isNew) };
      emit();
    },
    async patchShow(current, fields) {
      const stored = data.shows.find((s) => s.id === current.id);
      if (!stored) throw new Error("Niet gevonden.");
      data = { ...data, shows: await write(data.shows, clean({ ...stored, ...fields }), current.id, false) };
      emit();
    },
    async deleteShow(id) {
      data = { ...data, shows: await write(data.shows, null, id, false) };
      emit();
    },
    async saveIdea(idea, isNew) {
      data = { ...data, ideas: await write(data.ideas, clean(toStored(idea)), idea.id, isNew) };
      emit();
    },
    async patchIdea(id, fields) {
      const stored = data.ideas.find((i) => i.id === id);
      if (!stored) throw new Error("Niet gevonden.");
      data = { ...data, ideas: await write(data.ideas, clean({ ...stored, ...fields }), id, false) };
      emit();
    },
    async deleteIdea(id) {
      data = { ...data, ideas: await write(data.ideas, null, id, false) };
      emit();
    },
  };
}
