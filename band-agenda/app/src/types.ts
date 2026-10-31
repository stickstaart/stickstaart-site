// Gedeelde types voor de band-agenda.
// `owner` (naam) is wat de schermen tonen; `ownerUid` is wat de Firestore-regels controleren.
// De opslaglaag (src/lib/store) zet het een in het ander om.

export type ShowStatus = "confirmed" | "option" | "cancelled";

export interface ContactPerson {
  name?: string;
  /** Promotor, zaal, agent, … */
  role?: string;
  email?: string;
  phone?: string;
}

export interface DateItem {
  id: string;
  date: string;
  country: string;
  city: string;
  venue: string;
  otherbands?: string;
  status: ShowStatus;
  /** Oud formaat: één contact. Nieuw: `contacts` */
  contact?: ContactPerson;
  contacts?: ContactPerson[];
  guaranteedFee?: string;
  paymentMethod?: "cash" | "wire";
  /** Gage ontvangen (alleen relevant voor afgelopen, bevestigde shows) */
  isPaid?: boolean;
  breakEvenInfo?: string;
  owner?: string;
  ownerUid?: string;
  drivers?: string;
  transportMethod?: string;
  transportCost?: string;
  isBlocked?: boolean;
  blockedBy?: string;
  /** Blokkade over meerdere dagen: laatste dag (t/m), YYYY-MM-DD */
  endDate?: string;
  /** Blokkade: reden (vakantie, andere band, studio, ...) */
  reason?: string;
  // Publieke tourlijst
  isPublic?: boolean;
  tourName?: string;
  // Audit (gezet door de opslaglaag, uid's)
  createdBy?: string;
  updatedBy?: string;
}

export interface TourIdea {
  id: string;
  title: string;
  country?: string;
  supportBands?: string;
  targetPeriod?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  contacts?: ContactPerson[];
  notes?: string;
  isScratched?: boolean;
  owner?: string;
  ownerUid?: string;
  createdBy?: string;
  updatedBy?: string;
}

export type Role = "admin" | "member";

export interface Member {
  uid: string;
  name: string;
  role: Role;
}

export interface Band {
  id: string;
  name: string;
  theme?: string;
}
