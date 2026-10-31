import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { parseLocalDate, todayString } from "./dateUtils";

// Datumkiezer: veld-knop + kalender als eigen sheet (mobiel van onder, desktop gecentreerd).
// Zo is de kalender nooit krap, ook niet als er twee velden naast elkaar staan.

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateString: string) => void;
  /** Vroegst kiesbare datum (YYYY-MM-DD), bijv. de begindatum bij "t/m" */
  min?: string;
  /** Titel boven de kalender */
  label?: string;
}

const MONTHS = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const WEEKDAYS = ["ma", "di", "wo", "do", "vr", "za", "zo"];
const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, min, label = "Kies datum" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState({ y: 0, m: 0 });

  const open = () => {
    const d = parseLocalDate(value) ?? parseLocalDate(min || "") ?? new Date();
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setIsOpen(true);
  };
  const shift = (delta: number) =>
    setView(({ y, m }) => {
      const n = m + delta;
      return { y: y + Math.floor(n / 12), m: ((n % 12) + 12) % 12 };
    });
  const pick = (date: string) => {
    onChange(date);
    setIsOpen(false);
  };

  // Esc sluit alleen de kalender (capture + preventDefault: de sheet eronder laat hem dan met rust)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [isOpen]);

  const display = (() => {
    const d = parseLocalDate(value);
    if (!d) return "Kies datum";
    return new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
      .format(d)
      .replace(/\./g, "");
  })();

  const today = todayString();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const firstDay = new Date(view.y, view.m, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // maandag = eerste kolom

  return (
    <>
      {/* VELD */}
      <button
        type="button"
        onClick={open}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-black/40 ring-1 ring-white/10 text-base text-zinc-100 text-left cursor-pointer hover:ring-white/20"
      >
        <FiCalendar className="shrink-0 text-zinc-400" />
        <span className="truncate">{display}</span>
      </button>

      {/* KALENDER-SHEET — via portal naar <body>, zodat klikken niet via een omliggend <label>/<form> terugkomen */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[60] band-agenda" role="dialog" aria-modal="true" aria-label={label}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-zinc-950 ring-1 ring-white/10 p-4 space-y-3
                       pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.9)]
                       md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm md:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] uppercase tracking-[0.06em] text-zinc-400">{label}</span>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Sluiten" className="p-2 -mr-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer">
                <FiX />
              </button>
            </div>

            {/* Maand-navigatie */}
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => shift(-1)} aria-label="Vorige maand" className="p-3 rounded-xl text-zinc-200 hover:bg-white/10 cursor-pointer">
                <FiChevronLeft className="text-xl" />
              </button>
              <div className="font-display text-[28px] font-bold uppercase tracking-wide text-white leading-none">
                {MONTHS[view.m]} {view.y}
              </div>
              <button type="button" onClick={() => shift(1)} aria-label="Volgende maand" className="p-3 rounded-xl text-zinc-200 hover:bg-white/10 cursor-pointer">
                <FiChevronRight className="text-xl" />
              </button>
            </div>

            {/* Weekdagen */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[13px] uppercase text-zinc-400">
              {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
            </div>

            {/* Dagen */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: offset }).map((_, i) => <span key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = iso(view.y, view.m, day);
                const isSelected = date === value;
                const isToday = date === today;
                const disabled = !!min && date < min;
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => pick(date)}
                    aria-pressed={isSelected}
                    className={`aspect-square rounded-xl text-lg font-semibold tabular transition-colors ${
                      isSelected
                        ? "bg-red-600 text-white"
                        : disabled
                        ? "text-zinc-700 cursor-not-allowed"
                        : `text-zinc-100 bg-white/[0.04] hover:bg-white/10 cursor-pointer ${isToday ? "ring-1 ring-white/50" : ""}`
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => pick(min && today < min ? min : today)}
                className="grow py-3 rounded-xl text-base font-semibold text-zinc-200 ring-1 ring-white/10 hover:bg-white/5 cursor-pointer"
              >
                Vandaag
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};
