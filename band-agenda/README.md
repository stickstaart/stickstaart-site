# Band-agenda (demo)

Losse multi-tenant versie van de band-agenda, afgeleid van de Disturbance-agenda. Bedoeld voor `agenda.stickstaart.com`.

## Mappen
- `app/` – Vite + React 19 + TS + Tailwind v4. Eigen Vercel-project met **Root Directory `band-agenda/app`**.
- `firebase/` – `firestore.rules` (multi-tenant, strikt) en tests (`npm test`, start de Firestore-emulator; vereist Java 21).

## Fase 1 (nu)
Demo zonder Firebase: kies een verzonnen band en log in als lid of superadmin. Data komt uit `app/src/lib/sampleData.ts`
en blijft in de browser (localStorage); "Reset demo" in Instellingen zet het terug. `src/lib/store.ts` past dezelfde
eigenaarsregels toe als `firestore.rules`.

## Fase 2
Nieuw Firebase-project, Google-login, `firestoreStore` naast `demoStore` op `bands/{bandId}/...`.
Superadmin = document `superadmins/{uid}` (alleen via console). Voor Google-login op iPhone: `authDomain` op eigen domein
en `/__/auth` doorsturen naar `<project>.firebaseapp.com` (zelfde aanpak als Disturbance).

## Lokaal
```
cd band-agenda/app && npm install && npm run dev
```
