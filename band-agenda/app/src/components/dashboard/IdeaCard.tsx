import React, { useState } from "react";
import { FiChevronDown, FiEdit2, FiRotateCcw, FiSlash, FiTrash2, FiLock } from "react-icons/fi";
import type { TourIdea } from "../../types";
import { COUNTRIES, displayName } from "./constants";
import { ContactsView } from "./contacts";
import { contactsOfIdea } from "./contactUtils";
import { CountryFlag } from "./CountryFlag";

// Kaart voor een tour-idee, in dezelfde stijl als ShowCard:
// compacte regel (vlagtegel + titel + periode/bands), details en acties na een tik.

const CARD =
  "relative overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 ring-1 ring-white/[0.06] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-15px_rgba(0,0,0,0.9)] transition-all duration-200";

interface IdeaCardProps {
  idea: TourIdea;
  accentText: string;
  onEdit: (idea: TourIdea) => void;
  onDelete: (id: string) => void;
  onToggleScratch: (id: string) => void;
  /** Alleen de eigenaar (of de superadmin) mag wijzigen */
  canEdit?: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, accentText, onEdit, onDelete, onToggleScratch, canEdit = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const scratched = !!idea.isScratched;
  const countryName = COUNTRIES.find((c) => c.code === idea.country)?.name;

  const details: [string, React.ReactNode][] = [];
  if (idea.owner) details.push(["Eigenaar", <span className="font-semibold text-white">{displayName(idea.owner)}</span>]);
  if (idea.targetPeriod) details.push(["Periode", idea.targetPeriod]);
  if (idea.supportBands) details.push(["Bands", idea.supportBands]);
  const contacts = contactsOfIdea(idea);
  if (contacts.length) details.push([contacts.length > 1 ? "Contacten" : "Contact", <ContactsView list={contacts} />]);
  if (idea.notes) details.push(["Notities", <span className="whitespace-pre-line">{idea.notes}</span>]);

  return (
    <div className={`${CARD} ${isOpen ? "ring-white/[0.12]" : "hover:ring-white/[0.1]"} ${scratched ? "opacity-55 saturate-50 hover:opacity-100 hover:saturate-100" : ""}`}>
      <span className={`absolute left-0 inset-y-0 w-[3px] ${scratched ? "bg-zinc-600" : "bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.5)]"}`} />

      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-3 p-2.5 pl-3.5 text-left cursor-pointer"
      >
        {/* Vlagtegel */}
        <div className="w-14 shrink-0 rounded-lg ring-1 ring-white/10 bg-white/[0.03] py-2 flex flex-col items-center gap-1.5" title={countryName}>
          {idea.country ? <span className="scale-[1.6] origin-center"><CountryFlag code={idea.country} /></span> : <span className="text-zinc-500">—</span>}
          <span className="font-mono text-[13px] text-zinc-400">{idea.country || ""}</span>
        </div>

        <div className="grow min-w-0">
          <div className={`font-display text-[26px] md:text-3xl font-bold uppercase leading-none break-words ${scratched ? "text-zinc-400 line-through decoration-2" : accentText}`}>
            {idea.title}
          </div>
          {(idea.targetPeriod || idea.supportBands) && (
            <div className="mt-1 text-base text-zinc-300 leading-snug break-words">
              {idea.targetPeriod}
              {idea.targetPeriod && idea.supportBands && <span className="text-zinc-400"> · </span>}
              {idea.supportBands && <span className="text-zinc-400">w/ {idea.supportBands}</span>}
            </div>
          )}
        </div>

        <FiChevronDown className={`shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="px-3.5 pb-3.5 space-y-3">
          {details.length > 0 && (
            <dl className="pt-3 border-t border-white/[0.06] grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 text-base text-zinc-300">
              {details.map(([label, value]) => (
                <React.Fragment key={label}>
                  <dt className="font-mono text-[13px] uppercase tracking-[0.05em] text-zinc-400 pt-[3px]">{label}</dt>
                  <dd className="break-words min-w-0">{value}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}

          {canEdit ? (
            <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleScratch(idea.id)}
              className="grow flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider ring-1 ring-white/10 text-zinc-300 hover:text-white cursor-pointer"
            >
              {scratched ? <><FiRotateCcw /> Herstellen</> : <><FiSlash /> Doorstrepen</>}
            </button>
            <button
              type="button"
              onClick={() => onEdit(idea)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider text-zinc-200 bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/10 cursor-pointer"
            >
              <FiEdit2 /> Bewerk
            </button>
            <button
              type="button"
              onClick={() => onDelete(idea.id)}
              aria-label="Verwijderen"
              title="Verwijderen"
              className="p-2 rounded-lg text-red-400 ring-1 ring-red-500/25 hover:bg-red-500/10 cursor-pointer"
            >
              <FiTrash2 />
            </button>
          </div>
            </>
          ) : (
            <p className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06] text-sm text-zinc-500">
              <FiLock className="shrink-0" /> Alleen {idea.owner ? displayName(idea.owner) : "de eigenaar"} kan dit idee wijzigen
            </p>
          )}
        </div>
      )}
    </div>
  );
};
