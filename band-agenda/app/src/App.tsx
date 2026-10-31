import { useMemo, useState } from "react";
import Dashboard from "./components/Dashboard";
import { MembersContext } from "./components/dashboard/constants";
import { sampleBands } from "./lib/sampleData";
import { demoStore, resetDemo } from "./lib/store";

// Demo-inlog: kies een band en een lid (of superadmin). In fase 2 komt hier Google-login via Firebase Auth.
interface Session {
  bandId: string;
  /** uid van het lid, of SUPERADMIN */
  uid: string;
  /** Superadmin: naam van het lid waarvoor je werkt */
  actingAs?: string;
}

const SUPERADMIN = "superadmin";
const SESSION_KEY = "band_agenda_demo_session";

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* geen opslag: sessie geldt alleen voor dit tabblad */
  }
}

export default function App() {
  const bands = useMemo(() => sampleBands(), []);
  const [session, setSessionState] = useState<Session | null>(loadSession);
  const [pickedBand, setPickedBand] = useState<string | null>(null);
  // Na "Reset demo" opnieuw inlezen
  const [resetCount, setResetCount] = useState(0);

  const setSession = (s: Session | null) => {
    saveSession(s);
    setSessionState(s);
  };

  const band = bands.find((b) => b.id === session?.bandId);
  const isSuperadmin = session?.uid === SUPERADMIN;
  const member = band?.members.find((m) => m.uid === session?.uid);
  const actingName = isSuperadmin ? (session?.actingAs ?? band?.members[0]?.name) : member?.name;

  const store = useMemo(
    () => (band ? demoStore(band.id, band.members, { uid: session!.uid, isSuperadmin }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [band?.id, session?.uid, resetCount],
  );

  if (band && store && actingName) {
    return (
      <MembersContext.Provider value={band.members.map((m) => m.name)}>
        <Dashboard
          key={`${band.id}-${resetCount}`}
          band={band}
          members={band.members}
          currentUser={actingName}
          isSuperadmin={isSuperadmin}
          store={store}
          onActAs={(name) => setSession({ ...session!, actingAs: name })}
          onResetDemo={() => { resetDemo(band.id); setResetCount((n) => n + 1); }}
          onSwitchBand={() => { setPickedBand(null); setSession(null); }}
          onLogout={() => { setPickedBand(null); setSession(null); }}
        />
      </MembersContext.Provider>
    );
  }

  const chosen = bands.find((b) => b.id === pickedBand);
  const card = "w-full text-left px-4 py-3.5 rounded-xl bg-zinc-900 ring-1 ring-white/10 hover:ring-white/30 cursor-pointer transition";

  return (
    <div className="min-h-screen bg-black text-gray-100 band-agenda flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Band-agenda</h1>
          <p className="text-sm text-zinc-400">
            Demo met verzonnen bands en voorbeelddata. Probeer gerust alles uit: je wijzigingen blijven alleen op dit apparaat.
          </p>
        </div>

        {!chosen ? (
          <div className="space-y-2">
            <h2 className="font-mono text-[13px] uppercase tracking-[0.06em] text-zinc-400">Kies een band</h2>
            {bands.map((b) => (
              <button key={b.id} type="button" onClick={() => setPickedBand(b.id)} className={card}>
                <span className="block font-display text-2xl font-bold uppercase tracking-wide">{b.name}</span>
                <span className="block text-sm text-zinc-400">{b.members.map((m) => m.name).join(", ")}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h2 className="font-mono text-[13px] uppercase tracking-[0.06em] text-zinc-400">Log in als lid van {chosen.name}</h2>
              <button type="button" onClick={() => setPickedBand(null)} className="text-sm text-zinc-400 hover:text-white cursor-pointer">Terug</button>
            </div>
            {chosen.members.map((m) => (
              <button key={m.uid} type="button" onClick={() => setSession({ bandId: chosen.id, uid: m.uid })} className={card}>
                <span className="font-semibold">{m.name}</span>
                {m.role === "admin" && <span className="ml-2 text-xs font-mono uppercase text-zinc-500">band-admin</span>}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSession({ bandId: chosen.id, uid: SUPERADMIN, actingAs: chosen.members[0].name })}
              className={`${card} ring-amber-600/50`}
            >
              <span className="font-semibold text-amber-400">Superadmin</span>
              <span className="block text-sm text-zinc-400">Kan als elk lid werken en alles wijzigen</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
