import React from "react";
import { FiMail, FiPhone, FiPlus, FiTrash2 } from "react-icons/fi";
import type { ContactPerson } from "../../types";
import { Field } from "./formKit";
import { INPUT } from "./formStyles";

// Contactpersonen bewerken en tonen; hulpfuncties staan in contactUtils.ts.

const ROLE_SUGGESTIONS = ["Promotor", "Zaal", "Agent", "Booker", "Geluid", "Band"];

/** Bewerken: lijst met personen + knop om er een toe te voegen */
export const ContactsEditor: React.FC<{ value: ContactPerson[]; onChange: (list: ContactPerson[]) => void }> = ({ value, onChange }) => {
  const list = value.length ? value : [{}];
  const update = (i: number, key: keyof ContactPerson, v: string) =>
    onChange(list.map((c, idx) => (idx === i ? { ...c, [key]: v } : c)));
  const remove = (i: number) => onChange(list.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <datalist id="contact-roles">
        {ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
      </datalist>
      {list.map((c, i) => (
        <div key={i} className={list.length > 1 ? "space-y-3 pb-3 border-b border-white/[0.06] last:border-0 last:pb-0" : "space-y-3"}>
          <div className="flex items-end gap-2">
            <Field label={list.length > 1 ? `Naam ${i + 1}` : "Naam"} className="grow">
              <input type="text" value={c.name || ""} onChange={(e) => update(i, "name", e.target.value)} className={INPUT} />
            </Field>
            {list.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Contactpersoon verwijderen"
                title="Contactpersoon verwijderen"
                className="shrink-0 p-3 rounded-lg text-red-400 ring-1 ring-red-500/25 hover:bg-red-500/10 cursor-pointer"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
          <Field label="Rol">
            <input
              type="text"
              list="contact-roles"
              value={c.role || ""}
              onChange={(e) => update(i, "role", e.target.value)}
              placeholder="Promotor, zaal, agent…"
              className={INPUT}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Telefoon">
              <input type="tel" inputMode="tel" value={c.phone || ""} onChange={(e) => update(i, "phone", e.target.value)} className={INPUT} />
            </Field>
            <Field label="E-mail">
              <input type="email" inputMode="email" value={c.email || ""} onChange={(e) => update(i, "email", e.target.value)} className={INPUT} />
            </Field>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...list, {}])}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider text-zinc-300 ring-1 ring-white/10 hover:text-white hover:bg-white/[0.04] cursor-pointer"
      >
        <FiPlus /> Contactpersoon toevoegen
      </button>
    </div>
  );
};

const LINK = "inline-flex items-center gap-1 text-zinc-200 hover:text-white underline decoration-zinc-600 underline-offset-2";

/** Tonen in de uitgeklapte kaart: elke persoon op een eigen regel, tik om te bellen/mailen */
export const ContactsView: React.FC<{ list: ContactPerson[] }> = ({ list }) => (
  <span className="flex flex-col gap-2">
    {list.map((c, i) => (
      <span key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {(c.name || c.role) && (
          <span>
            {c.name}
            {c.role && <span className="text-zinc-400">{c.name ? " · " : ""}{c.role}</span>}
          </span>
        )}
        {c.phone && <a href={`tel:${c.phone}`} className={LINK}><FiPhone className="text-sm" />{c.phone}</a>}
        {c.email && <a href={`mailto:${c.email}`} className={`${LINK} break-all`}><FiMail className="text-sm" />{c.email}</a>}
      </span>
    ))}
  </span>
);
