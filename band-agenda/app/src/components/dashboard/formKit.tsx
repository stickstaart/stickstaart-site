import React, { useEffect, useState } from "react";
import { FiCheck, FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import { COUNTRIES, displayName, useMemberNames } from "./constants";
import { CountryFlag } from "./CountryFlag";
import { INPUT, LABEL, QUICK_COUNTRIES } from "./formStyles";

// Gedeelde bouwstenen voor de formulier-sheets: velden, uitklapblokken, landkiezer en de sheet zelf.

/** Label boven het veld (geen placeholder-als-label) */
export const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className={LABEL}>{label}</span>
    {children}
  </label>
);

/** Bedragveld met € ervoor en cijfertoetsenbord op mobiel */
export const MoneyInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-base">€</span>
    <input
      type="text"
      inputMode="decimal"
      value={value}
      placeholder={placeholder ?? "0"}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ""))}
      className={`${INPUT} pl-7 font-mono tabular`}
    />
  </div>
);

/** Uitklapbaar blok met samenvatting in de kop */
export const Section: React.FC<{ title: string; summary?: string; open: boolean; onToggle: () => void; children: React.ReactNode }> = ({
  title, summary, open, onToggle, children,
}) => (
  <div className={`rounded-xl ring-1 transition-colors ${open ? "ring-white/12 bg-white/[0.02]" : "ring-white/[0.06]"}`}>
    <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-3 px-3.5 py-3 text-left cursor-pointer">
      <span className="text-base font-semibold text-zinc-100 shrink-0">{title}</span>
      <span className="grow min-w-0 truncate text-right text-sm text-zinc-400">{!open && summary}</span>
      <FiChevronDown className={`shrink-0 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="px-3.5 pb-3.5 space-y-3">{children}</div>}
  </div>
);

/** Eigen landkiezer binnen de sheet (native <select> rendert op desktop als piepklein menu buiten beeld) */
export const CountryPicker: React.FC<{ value: string; onChange: (code: string) => void; onClose: () => void }> = ({ value, onChange, onClose }) => {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const results = query
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(query) || c.code.toLowerCase() === query)
    : COUNTRIES;
  const pick = (code: string) => {
    onChange(code);
    onClose();
  };
  return (
    <div className="mt-2 rounded-xl bg-zinc-900 ring-1 ring-white/10 p-3 space-y-3">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); if (results[0]) pick(results[0].code); }
            if (e.key === "Escape") { e.stopPropagation(); onClose(); }
          }}
          placeholder="Zoek land…"
          className={`${INPUT} pl-9`}
          autoFocus
        />
      </div>

      {!query && (
        <div className="flex flex-wrap gap-1.5">
          {QUICK_COUNTRIES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => pick(code)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-mono ring-1 cursor-pointer ${
                value === code ? "bg-white/15 text-white ring-white/40" : "text-zinc-300 ring-white/10 hover:ring-white/25"
              }`}
            >
              <CountryFlag code={code} />
              {code}
            </button>
          ))}
        </div>
      )}

      <ul className="max-h-48 overflow-y-auto overscroll-contain -mx-1 space-y-0.5" role="listbox" aria-label="Land">
        {results.map((c) => (
          <li key={c.code}>
            <button
              type="button"
              role="option"
              aria-selected={value === c.code}
              onClick={() => pick(c.code)}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-base text-left cursor-pointer ${
                value === c.code ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5"
              }`}
            >
              <CountryFlag code={c.code} />
              <span className="grow">{c.name}</span>
              <span className="font-mono text-[13px] text-zinc-400">{c.code}</span>
              {value === c.code && <FiCheck className="text-zinc-300" />}
            </button>
          </li>
        ))}
        {results.length === 0 && <li className="px-2 py-3 text-sm text-zinc-400">Geen land gevonden</li>}
      </ul>
    </div>
  );
};

/** Vlagknop + landkiezer eronder (zoals bij "Stad") */
export const CountryButton: React.FC<{ value: string; open: boolean; onToggle: () => void }> = ({ value, open, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={open}
    aria-label={`Land: ${COUNTRIES.find((c) => c.code === value)?.name ?? value}`}
    className={`shrink-0 flex items-center gap-1.5 px-3 rounded-lg bg-black/40 ring-1 text-base text-zinc-200 cursor-pointer ${open ? "ring-white/30" : "ring-white/10"}`}
  >
    <CountryFlag code={value} />
    <span className="font-mono text-sm">{value}</span>
    <FiChevronDown className={`text-zinc-400 text-sm transition-transform ${open ? "rotate-180" : ""}`} />
  </button>
);

interface FormSheetProps {
  title: string;
  owner: string;
  onOwnerChange: (owner: string) => void;
  canChangeOwner: boolean;
  canSave: boolean;
  saveLabel: string;
  saveButtonClass: string;
  onSubmit: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

/** Sheet: mobiel van onder, desktop gecentreerd. Kop met titel + eigenaar, scrollende inhoud, vaste voet. */
export const FormSheet: React.FC<FormSheetProps> = ({
  title, owner, onOwnerChange, canChangeOwner, canSave, saveLabel, saveButtonClass, onSubmit, onClose, children,
}) => {
  const members = useMemberNames();
  // Esc sluit (tenzij een binnenliggend element Esc al afhandelde); achtergrond scrollt niet mee
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !e.defaultPrevented && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 band-agenda" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={(e) => { e.preventDefault(); if (canSave) onSubmit(); }}
        className="absolute inset-x-0 bottom-0 max-h-[92dvh] flex flex-col rounded-t-2xl bg-zinc-950 ring-1 ring-white/10
                   shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.9)]
                   md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[88vh] md:rounded-2xl"
      >
        <div className="md:hidden flex justify-center pt-2">
          <span className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        <div className="flex items-center gap-3 px-4 pt-3 pb-3 border-b border-white/[0.06]">
          <div className="grow min-w-0">
            <h2 className="font-display text-[28px] font-bold uppercase tracking-wide text-white leading-none">{title}</h2>
            <div className="mt-1 flex items-center gap-1 text-sm text-zinc-400">
              Eigenaar:
              {canChangeOwner ? (
                <select
                  value={owner}
                  onChange={(e) => onOwnerChange(e.target.value)}
                  className="bg-transparent text-zinc-200 font-semibold focus:outline-none cursor-pointer"
                >
                  {members.map((m) => (
                    <option key={m} value={m} className="bg-zinc-900">{displayName(m)}</option>
                  ))}
                </select>
              ) : (
                <span className="text-zinc-200 font-semibold">{displayName(owner)}</span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Sluiten" className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer">
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="grow overflow-y-auto overscroll-contain px-4 py-4 space-y-4">{children}</div>

        <div className="flex gap-2 px-4 py-3 border-t border-white/[0.06] bg-zinc-950/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-3 rounded-xl text-base font-semibold text-zinc-300 ring-1 ring-white/10 hover:bg-white/5 cursor-pointer">
            Annuleren
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className={`grow py-3 rounded-xl text-base font-bold uppercase tracking-wider border transition-opacity ${saveButtonClass} ${
              canSave ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
            }`}
          >
            {saveLabel}
          </button>
        </div>
      </form>
    </div>
  );
};
