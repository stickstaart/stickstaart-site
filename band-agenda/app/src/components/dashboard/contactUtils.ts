import type { ContactPerson, DateItem, TourIdea } from "../../types";

// Meerdere contactpersonen per show of tour-idee.
// Oude records hebben nog één contact (show.contact / idee.contactPerson…); die wordt de eerste in de lijst.

export const hasData = (c: ContactPerson) => !!(c.name || c.role || c.phone || c.email);

export const contactsOfShow = (s: Partial<DateItem> | null | undefined): ContactPerson[] =>
  s?.contacts?.length ? s.contacts : s?.contact && hasData(s.contact) ? [s.contact] : [];

export const contactsOfIdea = (i: Partial<TourIdea> | null | undefined): ContactPerson[] =>
  i?.contacts?.length
    ? i.contacts
    : i?.contactPerson || i?.contactPhone || i?.contactEmail
    ? [{ name: i.contactPerson, phone: i.contactPhone, email: i.contactEmail }]
    : [];

/** Lege velden en lege personen weg, voor het opslaan */
export const tidyContacts = (list: ContactPerson[]): ContactPerson[] =>
  list
    .map((c) => ({
      name: c.name?.trim() || undefined,
      role: c.role?.trim() || undefined,
      phone: c.phone?.trim() || undefined,
      email: c.email?.trim() || undefined,
    }))
    .filter(hasData);

/** Samenvatting voor het dichtgeklapte blok in het formulier */
export const contactsSummary = (list: ContactPerson[]) => {
  const filled = list.filter(hasData);
  if (!filled.length) return "";
  const first = [filled[0].name, filled[0].role && `(${filled[0].role})`].filter(Boolean).join(" ");
  return filled.length > 1 ? `${first} +${filled.length - 1}` : first || filled[0].phone || filled[0].email || "";
};
