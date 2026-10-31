import React, { useState } from "react";
import { FiAlertTriangle, FiCheck, FiGlobe } from "react-icons/fi";
import type { ContactPerson, DateItem, ShowStatus } from "../../types";
import { ContactsEditor } from "./contacts";
import { contactsOfShow, contactsSummary, tidyContacts } from "./contactUtils";
import { useMemberNames } from "./constants";
import { CountryButton, CountryPicker, Field, FormSheet, MoneyInput, Section } from "./formKit";
import { chipClass, INPUT, LABEL, num, splitList } from "./formStyles";
import { CustomDatePicker } from "./CustomDatePicker";
import { todayString } from "./dateUtils";

// ------------------------------------------------------------------
// Formulier voor een nieuwe / te bewerken show, als sheet.
// Mobiel: schuift van onder omhoog. Desktop: gecentreerd venster.
// Basis altijd zichtbaar; de rest in uitklapbare blokken met samenvatting.
// ------------------------------------------------------------------

export type ShowDraft = Omit<DateItem, "id">;

const STATUS_OPTIONS: { value: ShowStatus; label: string; active: string }[] = [
  { value: "option", label: "Optie", active: "bg-amber-500/15 text-amber-300 ring-amber-500/50" },
  { value: "confirmed", label: "Bevestigd", active: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/50" },
  { value: "cancelled", label: "Afgelast", active: "bg-red-500/15 text-red-300 ring-red-500/50" },
];
const TRANSPORT_OPTIONS = ["Busje", "Eigen auto", "Trein", "Vliegtuig"];

interface ShowFormSheetProps {
  /** null = nieuwe show */
  initial: DateItem | null;
  defaultOwner: string;
  canChangeOwner: boolean;
  saveButtonClass: string;
  onSave: (draft: ShowDraft) => void;
  onClose: () => void;
  /** Wie heeft deze datum geblokkeerd */
  absentOn?: (date: string) => string[];
}

export const ShowFormSheet: React.FC<ShowFormSheetProps> = ({ initial, defaultOwner, canChangeOwner, saveButtonClass, onSave, onClose, absentOn }) => {
  const MEMBER_NAMES = useMemberNames();
  const [d, setD] = useState<ShowDraft>(() => ({
    date: initial?.date || todayString(),
    country: initial?.country || "NL",
    city: initial?.city || "",
    venue: initial?.venue || "",
    otherbands: initial?.otherbands || "",
    tourName: initial?.tourName || "",
    status: initial?.status || "option",
    isPublic: !!initial?.isPublic,
    guaranteedFee: initial?.guaranteedFee || "",
    paymentMethod: initial?.paymentMethod || "cash",
    drivers: initial?.drivers || "",
    transportMethod: initial?.transportMethod || "",
    transportCost: initial?.transportCost || "",
    breakEvenInfo: initial?.breakEvenInfo || "",
    owner: initial?.owner || defaultOwner,
  }));
  const set = <K extends keyof ShowDraft>(key: K, value: ShowDraft[K]) => setD((prev) => ({ ...prev, [key]: value }));
  const [contacts, setContacts] = useState<ContactPerson[]>(() => contactsOfShow(initial));

  // Bij bewerken: blokken met gegevens staan open
  const [open, setOpen] = useState<Record<string, boolean>>(() => ({
    lineup: !!(initial?.otherbands || initial?.tourName),
    money: !!initial?.guaranteedFee,
    transport: !!(initial?.drivers || initial?.transportMethod || initial?.transportCost),
    contact: contactsOfShow(initial).length > 0,
    notes: !!initial?.breakEvenInfo,
  }));
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const [isCountryOpen, setIsCountryOpen] = useState(false);


  // Chauffeurs: bandleden als knopjes, anderen als vrij veld
  const driverList = splitList(d.drivers);
  const memberDrivers = driverList.filter((n) => MEMBER_NAMES.includes(n));
  const otherDrivers = driverList.filter((n) => !MEMBER_NAMES.includes(n)).join(", ");
  const setDrivers = (members: string[], others: string) => set("drivers", [...members, ...splitList(others)].join(", "));
  // Vrij veld voor "andere chauffeurs" lokaal bijhouden, zodat je komma's en spaties kunt typen
  const [othersText, setOthersText] = useState(otherDrivers);
  const toggleDriver = (name: string) =>
    setDrivers(memberDrivers.includes(name) ? memberDrivers.filter((n) => n !== name) : [...memberDrivers, name], othersText);

  // Samenvattingen
  const fee = num(d.guaranteedFee);
  const cost = num(d.transportCost);
  const net = fee - cost;
  const euro = (n: number) => `€${Number.isInteger(n) ? n : n.toFixed(2)}`;
  const summaries = {
    lineup: [d.otherbands && `w/ ${d.otherbands}`, d.tourName].filter(Boolean).join(" · "),
    money: d.guaranteedFee
      ? `${euro(fee)} · ${d.paymentMethod === "wire" ? "bank" : "cash"}${d.transportCost ? ` → netto ${net >= 0 ? "+" : "−"}${euro(Math.abs(net))}` : ""}`
      : "",
    transport: [d.transportMethod, d.drivers, d.transportCost && euro(cost)].filter(Boolean).join(" · "),
    contact: contactsSummary(contacts),
    notes: d.breakEvenInfo ? d.breakEvenInfo.slice(0, 40) + (d.breakEvenInfo.length > 40 ? "…" : "") : "",
  };

  const canSave = !!d.date && !!d.city.trim();
  const absent = absentOn ? absentOn(d.date) : [];
  const isConfirmed = d.status === "confirmed";

  const handleSubmit = () => {
    onSave({
      ...d,
      city: d.city.trim(),
      drivers: [...memberDrivers, ...splitList(othersText)].join(", "),
      isPublic: isConfirmed && !!d.isPublic,
      contact: undefined, // oud formaat opruimen
      contacts: tidyContacts(contacts),
    });
  };

  return (
    <FormSheet
      title={initial ? "Show bewerken" : "Nieuwe show"}
      owner={d.owner || ""}
      onOwnerChange={(o) => set("owner", o)}
      canChangeOwner={canChangeOwner}
      canSave={canSave}
      saveLabel={initial ? "Wijzigingen opslaan" : "Show opslaan"}
      saveButtonClass={saveButtonClass}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
          {/* ---- BASIS ---- */}
          <div className="space-y-3">
            <Field label="Datum">
              <CustomDatePicker label="Datum van de show" value={d.date} onChange={(v) => set("date", v)} />
            </Field>
            {absent.length > 0 && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-200 ring-1 ring-red-500/30">
                <FiAlertTriangle className="shrink-0 mt-0.5 text-red-300" />
                <span>
                  <span className="font-semibold">{absent.join(", ")}</span> {absent.length === 1 ? "heeft" : "hebben"} deze datum geblokkeerd
                  {" "}({absent.length}/{MEMBER_NAMES.length} afwezig).
                </span>
              </div>
            )}

            <div>
              <span className={LABEL}>Stad</span>
              <div className="flex gap-2">
                <CountryButton value={d.country} open={isCountryOpen} onToggle={() => setIsCountryOpen((o) => !o)} />
                <input
                  type="text"
                  value={d.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Bijv. Rotterdam"
                  className={INPUT}
                  autoFocus={!initial}
                  required
                />
              </div>
              {isCountryOpen && (
                <CountryPicker value={d.country} onChange={(code) => set("country", code)} onClose={() => setIsCountryOpen(false)} />
              )}
            </div>

            <Field label="Zaal / venue">
              <input type="text" value={d.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Bijv. Rotown" className={INPUT} />
            </Field>

            <div>
              <span className={LABEL}>Status</span>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-black/40 ring-1 ring-white/[0.06]" role="radiogroup" aria-label="Status">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={d.status === o.value}
                    onClick={() => set("status", o.value)}
                    className={`py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                      d.status === o.value ? `ring-1 ${o.active}` : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Website: alleen bij bevestigd */}
            {isConfirmed && (
              <button
                type="button"
                onClick={() => set("isPublic", !d.isPublic)}
                aria-pressed={!!d.isPublic}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl ring-1 text-left transition-colors cursor-pointer ${
                  d.isPublic ? "bg-sky-500/10 ring-sky-500/40" : "ring-white/10 hover:ring-white/20"
                }`}
              >
                <FiGlobe className={d.isPublic ? "text-sky-300" : "text-zinc-400"} />
                <span className="grow">
                  <span className={`block text-base font-semibold ${d.isPublic ? "text-sky-200" : "text-zinc-200"}`}>Aankondigen op website</span>
                  <span className="block text-sm text-zinc-400">Onder TOUR, na de datum vanzelf onder HISTORY. Zonder gage of contact.</span>
                </span>
                {/* Schakelaar */}
                <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${d.isPublic ? "bg-sky-500" : "bg-zinc-700"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${d.isPublic ? "left-[18px]" : "left-0.5"}`} />
                </span>
              </button>
            )}
          </div>

          {/* ---- EXTRA (uitklapbaar) ---- */}
          <div className="space-y-2">
            <Section title="Line-up & event" summary={summaries.lineup} open={open.lineup} onToggle={() => toggle("lineup")}>
              <Field label="Andere bands">
                <input type="text" value={d.otherbands} onChange={(e) => set("otherbands", e.target.value)} placeholder="Gescheiden door komma's" className={INPUT} />
              </Field>
              <Field label="Festival / tournaam">
                <input type="text" value={d.tourName} onChange={(e) => set("tourName", e.target.value)} placeholder="Optioneel" className={INPUT} />
              </Field>
            </Section>

            <Section title="Geld" summary={summaries.money} open={open.money} onToggle={() => toggle("money")}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gage">
                  <MoneyInput value={d.guaranteedFee || ""} onChange={(v) => set("guaranteedFee", v)} />
                </Field>
                <div>
                  <span className={LABEL}>Betaling</span>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-black/40 ring-1 ring-white/[0.06]">
                    {(["cash", "wire"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => set("paymentMethod", m)}
                        className={`py-1.5 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                          d.paymentMethod === m ? "bg-white/15 text-white ring-1 ring-white/30" : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {m === "cash" ? "Cash" : "Bank"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {(d.guaranteedFee || d.transportCost) && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/30 text-sm">
                  <span className="text-zinc-400">
                    Netto (gage − vervoer{d.transportCost ? ` ${euro(cost)}` : ""})
                  </span>
                  <span className={`font-mono tabular font-bold ${net >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                    {net >= 0 ? "+" : "−"}{euro(Math.abs(net))}
                  </span>
                </div>
              )}
            </Section>

            <Section title="Vervoer" summary={summaries.transport} open={open.transport} onToggle={() => toggle("transport")}>
              <div>
                <span className={LABEL}>Hoe</span>
                <div className="flex flex-wrap gap-2">
                  {TRANSPORT_OPTIONS.map((t) => (
                    <button key={t} type="button" onClick={() => set("transportMethod", d.transportMethod === t ? "" : t)} className={chipClass(d.transportMethod === t)}>
                      {d.transportMethod === t && <FiCheck className="inline mr-1 -mt-0.5" />}
                      {t}
                    </button>
                  ))}
                </div>
                {!TRANSPORT_OPTIONS.includes(d.transportMethod || "") && (
                  <input
                    type="text"
                    value={d.transportMethod}
                    onChange={(e) => set("transportMethod", e.target.value)}
                    placeholder="Of iets anders…"
                    className={`${INPUT} mt-2`}
                  />
                )}
              </div>
              <div>
                <span className={LABEL}>Chauffeurs</span>
                <div className="flex flex-wrap gap-2">
                  {MEMBER_NAMES.map((n) => (
                    <button key={n} type="button" onClick={() => toggleDriver(n)} className={chipClass(memberDrivers.includes(n))}>
                      {memberDrivers.includes(n) && <FiCheck className="inline mr-1 -mt-0.5" />}
                      {n}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={othersText}
                  onChange={(e) => setOthersText(e.target.value)}
                  onBlur={() => setDrivers(memberDrivers, othersText)}
                  placeholder="Anderen (bijv. Berrie)"
                  className={`${INPUT} mt-2`}
                />
              </div>
              <Field label="Kosten vervoer">
                <MoneyInput value={d.transportCost || ""} onChange={(v) => set("transportCost", v)} />
              </Field>
            </Section>

            <Section title="Contact" summary={summaries.contact} open={open.contact} onToggle={() => toggle("contact")}>
              <ContactsEditor value={contacts} onChange={setContacts} />
            </Section>

            <Section title="Afspraken" summary={summaries.notes} open={open.notes} onToggle={() => toggle("notes")}>
              <textarea
                value={d.breakEvenInfo}
                onChange={(e) => set("breakEvenInfo", e.target.value)}
                rows={3}
                placeholder="Break-even, eten & slapen, bijzonderheden…"
                className={`${INPUT} resize-y`}
              />
            </Section>
          </div>
    </FormSheet>
  );
};
