import React, { useState } from "react";
import type { ContactPerson, TourIdea } from "../../types";
import { ContactsEditor } from "./contacts";
import { contactsOfIdea, contactsSummary, tidyContacts } from "./contactUtils";
import { CountryButton, CountryPicker, Field, FormSheet, Section } from "./formKit";
import { INPUT, LABEL } from "./formStyles";

// Formulier voor een tour-idee: zelfde sheet als bij shows.
// Basis: titel, land, periode. Rest in uitklapbare blokken met samenvatting.

export type IdeaDraft = Omit<TourIdea, "id">;

interface IdeaFormSheetProps {
  /** null = nieuw idee */
  initial: TourIdea | null;
  defaultOwner: string;
  canChangeOwner: boolean;
  saveButtonClass: string;
  onSave: (draft: IdeaDraft) => void;
  onClose: () => void;
}

export const IdeaFormSheet: React.FC<IdeaFormSheetProps> = ({ initial, defaultOwner, canChangeOwner, saveButtonClass, onSave, onClose }) => {
  const [d, setD] = useState<IdeaDraft>(() => ({
    title: initial?.title || "",
    country: initial?.country || "NL",
    targetPeriod: initial?.targetPeriod || "",
    supportBands: initial?.supportBands || "",
    notes: initial?.notes || "",
    owner: initial?.owner || defaultOwner,
    isScratched: initial?.isScratched ?? false,
  }));
  const [contacts, setContacts] = useState<ContactPerson[]>(() => contactsOfIdea(initial));
  const set = <K extends keyof IdeaDraft>(key: K, value: IdeaDraft[K]) => setD((prev) => ({ ...prev, [key]: value }));

  const [open, setOpen] = useState<Record<string, boolean>>(() => ({
    lineup: !!initial?.supportBands,
    contact: contactsOfIdea(initial).length > 0,
    notes: !!initial?.notes,
  }));
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  const summaries = {
    lineup: d.supportBands ? `w/ ${d.supportBands}` : "",
    contact: contactsSummary(contacts),
    notes: d.notes ? d.notes.slice(0, 40) + (d.notes.length > 40 ? "…" : "") : "",
  };
  const canSave = !!d.title.trim();

  return (
    <FormSheet
      title={initial ? "Idee bewerken" : "Nieuw tour-idee"}
      owner={d.owner || ""}
      onOwnerChange={(o) => set("owner", o)}
      canChangeOwner={canChangeOwner}
      canSave={canSave}
      saveLabel={initial ? "Wijzigingen opslaan" : "Idee opslaan"}
      saveButtonClass={saveButtonClass}
      onSubmit={() =>
        onSave({
          ...d,
          title: d.title.trim(),
          // oud formaat opruimen
          contactPerson: undefined,
          contactPhone: undefined,
          contactEmail: undefined,
          contacts: tidyContacts(contacts),
        })
      }
      onClose={onClose}
    >
      {/* ---- BASIS ---- */}
      <div className="space-y-3">
        <Field label="Titel / concept">
          <input
            type="text"
            value={d.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Bijv. UK Tour, Japan Run"
            className={INPUT}
            autoFocus={!initial}
            required
          />
        </Field>

        <div>
          <span className={LABEL}>Land &amp; periode</span>
          <div className="flex gap-2">
            <CountryButton value={d.country || "NL"} open={isCountryOpen} onToggle={() => setIsCountryOpen((o) => !o)} />
            <input
              type="text"
              value={d.targetPeriod}
              onChange={(e) => set("targetPeriod", e.target.value)}
              placeholder="Bijv. najaar 2027"
              aria-label="Doelperiode"
              className={INPUT}
            />
          </div>
          {isCountryOpen && (
            <CountryPicker value={d.country || "NL"} onChange={(code) => set("country", code)} onClose={() => setIsCountryOpen(false)} />
          )}
        </div>
      </div>

      {/* ---- EXTRA (uitklapbaar) ---- */}
      <div className="space-y-2">
        <Section title="Line-up" summary={summaries.lineup} open={open.lineup} onToggle={() => toggle("lineup")}>
          <Field label="Samen met bands">
            <input type="text" value={d.supportBands} onChange={(e) => set("supportBands", e.target.value)} placeholder="Gescheiden door komma's" className={INPUT} />
          </Field>
        </Section>

        <Section title="Contact / agent" summary={summaries.contact} open={open.contact} onToggle={() => toggle("contact")}>
          <ContactsEditor value={contacts} onChange={setContacts} />
        </Section>

        <Section title="Notities" summary={summaries.notes} open={open.notes} onToggle={() => toggle("notes")}>
          <textarea
            value={d.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={4}
            placeholder="Route, budget, ideeën…"
            className={`${INPUT} resize-y`}
          />
        </Section>
      </div>
    </FormSheet>
  );
};
