import React, { useState } from "react";
import { FiChevronDown, FiEdit2, FiTrash2 } from "react-icons/fi";
import type { DateItem } from "../../types";
import { UnavailableFlag } from "./CountryFlag";
import { parseLocalDate } from "./dateUtils";
import { displayName, useMemberNames } from "./constants";
import { blockNames as namesOf } from "./blocks";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short" }).format(d).replace(/\./g, "");

interface BlockGroupProps {
  date: string;
  /** Blokkades die op deze datum beginnen */
  blocks: DateItem[];
  /** Langere periodes die eerder begonnen en deze datum ook dekken */
  covering?: DateItem[];
  isPast?: boolean;
  /** Ingelogde (of als-ingelogde) bandlid: alleen eigen blokkades zijn te bewerken */
  me: string;
  onEditBlock: (block: DateItem) => void;
  onDelete: (id: string) => void;
}

/**
 * Eén compacte regel per datum, ook als meerdere bandleden blokkeren.
 * Elke blokkade blijft een eigen record per persoon; alleen de weergave wordt samengevoegd.
 */
export const BlockGroup: React.FC<BlockGroupProps> = ({ date, blocks, covering = [], isPast = false, me, onEditBlock, onDelete }) => {
  const members = useMemberNames();
  // Eigenaar beslist; "Hele band" is van wie hem aanmaakte
  const isMine = (b: DateItem) => (b.owner ? b.owner === me : namesOf(b).includes(displayName(me)));
  const [isOpen, setIsOpen] = useState(false);
  const pastStyle = isPast ? "opacity-55 saturate-50 hover:opacity-100 hover:saturate-100" : "";
  const start = parseLocalDate(date);
  const all = [...blocks, ...covering];
  const names = [...new Set(all.flatMap(namesOf))];
  const total = members.length;
  const wholeBand = names.includes("Hele band") || members.every((m) => names.includes(m));

  const detailsOf = (b: DateItem) => {
    const end = b.endDate ? parseLocalDate(b.endDate) : null;
    const from = b.date !== date ? parseLocalDate(b.date) : null;
    const range = from && end ? `${fmt(from)} t/m ${fmt(end)}` : end ? `t/m ${fmt(end)}` : "";
    return [b.reason, range].filter(Boolean).join(" · ");
  };

  // Zelfde reden + periode (bv. "Trouwerij Kenny & Denise") één keer tonen
  const groupByDetails = (list: DateItem[]) =>
    list.reduce<{ details: string; items: DateItem[] }[]>((groups, b) => {
      const details = detailsOf(b);
      const same = details && groups.find((g) => g.details.toLowerCase() === details.toLowerCase());
      if (same) same.items.push(b);
      else groups.push({ details, items: [b] });
      return groups;
    }, []);

  const actions = (b: DateItem) => !isMine(b) ? null : (
    <div className="shrink-0 flex items-center">
      <button
        onClick={(e) => { e.stopPropagation(); onEditBlock(b); }}
        className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/10 cursor-pointer"
        title="Bewerk blokkade"
        aria-label="Bewerk blokkade"
      >
        <FiEdit2 className="text-sm" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(b.id); }}
        className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
        title="Verwijder blokkade"
        aria-label="Verwijder blokkade"
      >
        <FiTrash2 className="text-sm" />
      </button>
    </div>
  );

  const dateLabel = (
    <span className="shrink-0 w-[5.5rem] font-mono text-[13px] font-bold uppercase tracking-[0.04em] tabular text-red-300/80">
      {start ? fmt(start) : date}
    </span>
  );

  // Eén persoon, geen overlap: zelfde regel als voorheen, met reden erbij
  if (all.length === 1) {
    const b = all[0];
    const details = detailsOf(b);
    return (
      <div
        id={`show-${b.id}`}
        title={[names.join(", "), details].filter(Boolean).join(" · ")}
        className={`flex items-center gap-2.5 min-h-[34px] rounded-lg px-3 py-1 bg-zinc-800/50 ring-1 ring-white/[0.05] stripes-blocked ${pastStyle}`}
      >
        {dateLabel}
        <UnavailableFlag />
        <div className="grow min-w-0 truncate text-[15px] leading-snug">
          <span className="font-semibold text-zinc-200">{names.join(", ")}</span>
          {details && <span className="text-zinc-400"> · {details}</span>}
        </div>
        {actions(b)}
      </div>
    );
  }

  return (
    <div
      id={`show-${blocks[0]?.id ?? covering[0]?.id}`}
      className={`rounded-lg bg-zinc-800/50 ring-1 ring-white/[0.05] stripes-blocked ${pastStyle}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-2.5 px-3 py-1 text-left cursor-pointer"
      >
        {dateLabel}
        <UnavailableFlag />
        <span className="grow min-w-0 truncate text-[15px] leading-snug font-semibold text-zinc-200">
          {names.join(", ")}
        </span>
        <span
          className={`shrink-0 font-mono text-[12px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full ring-1 ${
            wholeBand ? "bg-red-500/15 text-red-300 ring-red-500/40" : "bg-white/[0.04] text-zinc-400 ring-white/10"
          }`}
        >
          {wholeBand ? "Hele band" : `${names.length}/${total} afwezig`}
        </span>
        <FiChevronDown className={`shrink-0 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <ul className="px-3 pb-1.5 space-y-0.5">
          {groupByDetails(all).map(({ details, items }) => (
            <li key={items[0].id} className="flex items-center gap-2.5 text-[15px] leading-snug">
              {/* Zelfde kolommen als de kopregel: datum + vlag, zodat de namen recht onder elkaar staan */}
              <span className="shrink-0 w-[5.5rem]" aria-hidden />
              <span className="invisible" aria-hidden><UnavailableFlag /></span>
              <div className="grow min-w-0 truncate py-[3px]" title={details}>
                <span className="font-semibold text-zinc-200">{items.flatMap(namesOf).join(", ")}</span>
                {details && <span className="text-zinc-400"> · {details}</span>}
              </div>
              {/* Alleen knoppen voor je eigen blokkade */}
              {items.filter(isMine).map((b) => <React.Fragment key={b.id}>{actions(b)}</React.Fragment>)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
