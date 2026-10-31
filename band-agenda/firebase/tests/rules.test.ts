// Tests voor firestore.rules. Draaien: npm test (start de Firestore-emulator, vereist Java).
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, getDocs, collection, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";

let env: RulesTestEnvironment;

// Twee bands: "rotkop" (ana = admin, bram = lid) en "lawaai" (cees). sam = superadmin, geen lid.
const verified = { email_verified: true };
const as = (uid: string) => env.authenticatedContext(uid, verified).firestore();
const anon = () => env.unauthenticatedContext().firestore();

const audit = (uid: string) => ({ createdBy: uid, updatedBy: uid, updatedAt: serverTimestamp() });
const show = (owner: string, actor = owner) => ({ date: "2026-12-01", city: "Utrecht", status: "confirmed", ownerUid: owner, ...audit(actor) });

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-band-agenda",
    firestore: { rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8") },
  });
});
afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "superadmins/sam"), {});
    await setDoc(doc(db, "bands/rotkop"), { name: "Rotkop" });
    await setDoc(doc(db, "bands/rotkop/members/ana"), { name: "Ana", role: "admin" });
    await setDoc(doc(db, "bands/rotkop/members/bram"), { name: "Bram", role: "member" });
    await setDoc(doc(db, "bands/lawaai"), { name: "Lawaai" });
    await setDoc(doc(db, "bands/lawaai/members/cees"), { name: "Cees", role: "admin" });
    await setDoc(doc(db, "bands/rotkop/shows/s1"), { ...show("ana"), updatedAt: new Date() });
    await setDoc(doc(db, "bands/rotkop/publicShows/s1"), { date: "2026-12-01", city: "Utrecht" });
  });
});

describe("tenant-isolatie", () => {
  it("lid leest eigen band", () => assertSucceeds(getDocs(collection(as("bram"), "bands/rotkop/shows"))));
  it("lid van andere band leest niets", async () => {
    await assertFails(getDocs(collection(as("cees"), "bands/rotkop/shows")));
    await assertFails(getDoc(doc(as("cees"), "bands/rotkop")));
    await assertFails(getDocs(collection(as("cees"), "bands/rotkop/members")));
  });
  it("niet ingelogd leest niets privé", () => assertFails(getDocs(collection(anon(), "bands/rotkop/shows"))));
  it("onbevestigd e-mailadres komt er niet in", () =>
    assertFails(getDocs(collection(env.authenticatedContext("bram").firestore(), "bands/rotkop/shows"))));
  it("bandlijst alleen voor superadmin", async () => {
    await assertFails(getDocs(collection(as("ana"), "bands")));
    await assertSucceeds(getDocs(collection(as("sam"), "bands")));
  });
  it("publieke tourlijst is voor iedereen leesbaar", () =>
    assertSucceeds(getDocs(collection(anon(), "bands/rotkop/publicShows"))));
});

describe("eigen shows en blokkades", () => {
  it("lid maakt eigen show", () => assertSucceeds(setDoc(doc(as("bram"), "bands/rotkop/shows/s2"), show("bram"))));
  it("lid maakt geen show op naam van een ander", () =>
    assertFails(setDoc(doc(as("bram"), "bands/rotkop/shows/s2"), show("ana", "bram"))));
  it("lid wijzigt andermans show niet", () =>
    assertFails(updateDoc(doc(as("bram"), "bands/rotkop/shows/s1"), { city: "Gouda", updatedBy: "bram", updatedAt: serverTimestamp() })));
  it("eigenaar wijzigt eigen show", () =>
    assertSucceeds(updateDoc(doc(as("ana"), "bands/rotkop/shows/s1"), { city: "Gouda", updatedBy: "ana", updatedAt: serverTimestamp() })));
  it("eigenaar kan show niet aan ander geven", () =>
    assertFails(updateDoc(doc(as("ana"), "bands/rotkop/shows/s1"), { ownerUid: "bram", updatedBy: "ana", updatedAt: serverTimestamp() })));
  it("updatedBy vervalsen mag niet", () =>
    assertFails(updateDoc(doc(as("ana"), "bands/rotkop/shows/s1"), { city: "Gouda", updatedBy: "bram", updatedAt: serverTimestamp() })));
  it("lid verwijdert andermans show niet", () => assertFails(deleteDoc(doc(as("bram"), "bands/rotkop/shows/s1"))));
  it("eigenaar verwijdert eigen show", () => assertSucceeds(deleteDoc(doc(as("ana"), "bands/rotkop/shows/s1"))));
  it("blokkade van ander bandlid niet aan te passen", async () => {
    await assertSucceeds(setDoc(doc(as("bram"), "bands/rotkop/shows/b1"), { ...show("bram"), isBlocked: true }));
    await assertFails(updateDoc(doc(as("ana"), "bands/rotkop/shows/b1"), { reason: "x", updatedBy: "ana", updatedAt: serverTimestamp() }));
  });
  it("lid van andere band schrijft niet in deze band", () =>
    assertFails(setDoc(doc(as("cees"), "bands/rotkop/shows/s9"), show("cees"))));
  it("eigenaar moet lid van de band zijn", () =>
    assertFails(setDoc(doc(as("sam"), "bands/rotkop/shows/s9"), show("cees", "sam"))));
  it("ideeën volgen dezelfde regels", async () => {
    await assertSucceeds(setDoc(doc(as("bram"), "bands/rotkop/ideas/i1"), { title: "Tour", ownerUid: "bram", ...audit("bram") }));
    await assertFails(deleteDoc(doc(as("ana"), "bands/rotkop/ideas/i1")));
  });
});

describe("publieke tourlijst", () => {
  it("eigenaar publiceert samen met show", async () => {
    const db = as("ana");
    const b = writeBatch(db);
    b.update(doc(db, "bands/rotkop/shows/s1"), { city: "Gouda", updatedBy: "ana", updatedAt: serverTimestamp() });
    b.set(doc(db, "bands/rotkop/publicShows/s1"), { date: "2026-12-01", country: "NL", city: "Gouda", venue: "", bands: [], tour: null });
    await assertSucceeds(b.commit());
  });
  it("ander lid kan publieke show niet wijzigen", () =>
    assertFails(setDoc(doc(as("bram"), "bands/rotkop/publicShows/s1"), { date: "2026-12-01", city: "Fake" })));
  it("geen privévelden in publieke show", () =>
    assertFails(setDoc(doc(as("ana"), "bands/rotkop/publicShows/s1"), { date: "2026-12-01", guaranteedFee: "500" })));
  it("eigenaar verwijdert show en publieke show samen", async () => {
    const db = as("ana");
    const b = writeBatch(db);
    b.delete(doc(db, "bands/rotkop/shows/s1"));
    b.delete(doc(db, "bands/rotkop/publicShows/s1"));
    await assertSucceeds(b.commit());
  });
});

describe("superadmin", () => {
  it("leest elke band", () => assertSucceeds(getDocs(collection(as("sam"), "bands/lawaai/shows"))));
  it("maakt show namens een lid", () => assertSucceeds(setDoc(doc(as("sam"), "bands/rotkop/shows/s3"), show("bram", "sam"))));
  it("wijzigt andermans show en eigenaar", () =>
    assertSucceeds(updateDoc(doc(as("sam"), "bands/rotkop/shows/s1"), { ownerUid: "bram", updatedBy: "sam", updatedAt: serverTimestamp() })));
  it("superadmin-lijst niet zelf aan te vullen", () => assertFails(setDoc(doc(as("ana"), "superadmins/ana"), {})));
});

describe("ledenbeheer", () => {
  it("band-admin voegt lid toe", () =>
    assertSucceeds(setDoc(doc(as("ana"), "bands/rotkop/members/dirk"), { name: "Dirk", role: "member" })));
  it("gewoon lid voegt niemand toe", () =>
    assertFails(setDoc(doc(as("bram"), "bands/rotkop/members/dirk"), { name: "Dirk", role: "member" })));
  it("lid maakt zichzelf geen admin", () =>
    assertFails(updateDoc(doc(as("bram"), "bands/rotkop/members/bram"), { role: "admin" })));
  it("admin van andere band beheert hier niets", () =>
    assertFails(setDoc(doc(as("cees"), "bands/rotkop/members/cees"), { name: "Cees", role: "admin" })));
  it("band-admin verwijdert zichzelf niet", () => assertFails(deleteDoc(doc(as("ana"), "bands/rotkop/members/ana"))));
});
