import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  push,
} from 'firebase/database';

let app = null;
let db = null;
let auth = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function initFirebase() {
  if (app) return { app, db, auth };
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
  return { app, db, auth };
}

// ── Auth ──

export async function signInWithGoogle() {
  const { auth } = initFirebase();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser() {
  const { auth } = initFirebase();
  await signOut(auth);
}

export function onAuthChange(callback) {
  const { auth } = initFirebase();
  return onAuthStateChanged(auth, callback);
}

// ── Family code ──

export function generateFamilyCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createFamily(code) {
  const { db } = initFirebase();
  const familyRef = ref(db, `families/${code}`);
  await set(familyRef, { createdAt: new Date().toISOString() });
}

export async function familyExists(code) {
  const { db } = initFirebase();
  const familyRef = ref(db, `families/${code}`);
  const snapshot = await get(familyRef);
  return snapshot.exists();
}

// ── Data helpers ──

function arrayToMap(arr) {
  const map = {};
  arr.forEach((item) => {
    map[item.id] = { ...item };
  });
  return map;
}

function mapToArray(map) {
  if (!map) return [];
  return Object.keys(map).map((key) => ({ ...map[key], id: key }));
}

function stripImages(entries) {
  return entries.map(({ image, ...rest }) => rest);
}

export async function writeMembers(code, members) {
  const { db } = initFirebase();
  const membersRef = ref(db, `families/${code}/members`);
  await set(membersRef, arrayToMap(members));
}

export async function writeEntries(code, entries) {
  const { db } = initFirebase();
  const entriesRef = ref(db, `families/${code}/entries`);
  await set(entriesRef, arrayToMap(stripImages(entries)));
}

export async function writeCheckupLogs(code, logs) {
  const { db } = initFirebase();
  const logsRef = ref(db, `families/${code}/checkupLogs`);
  await set(logsRef, logs);
}

export async function writeDismissedCheckups(code, dismissed) {
  const { db } = initFirebase();
  const dismissedRef = ref(db, `families/${code}/dismissedCheckups`);
  await set(dismissedRef, dismissed);
}

export async function writeAllergies(code, allergies) {
  const { db } = initFirebase();
  const allergiesRef = ref(db, `families/${code}/allergies`);
  await set(allergiesRef, allergies);
}

export async function writeGrowthRecords(code, records) {
  const { db } = initFirebase();
  const recordsRef = ref(db, `families/${code}/growthRecords`);
  await set(recordsRef, records);
}

export async function writeMedications(code, medications) {
  const { db } = initFirebase();
  const medsRef = ref(db, `families/${code}/medications`);
  await set(medsRef, medications);
}

export async function writePeriodRecords(code, records) {
  const { db } = initFirebase();
  const recordsRef = ref(db, `families/${code}/periodRecords`);
  await set(recordsRef, records);
}

// ── Real-time subscriptions ──

export function subscribeToFamily(code, callbacks) {
  const { db } = initFirebase();

  const unsubMembers = onValue(ref(db, `families/${code}/members`), (snap) => {
    callbacks.onMembers(mapToArray(snap.val()));
  });

  const unsubEntries = onValue(ref(db, `families/${code}/entries`), (snap) => {
    callbacks.onEntries(mapToArray(snap.val()));
  });

  const unsubLogs = onValue(ref(db, `families/${code}/checkupLogs`), (snap) => {
    callbacks.onCheckupLogs(snap.val() || {});
  });

  const unsubDismissed = onValue(ref(db, `families/${code}/dismissedCheckups`), (snap) => {
    callbacks.onDismissedCheckups(snap.val() || {});
  });

  const unsubAllergies = onValue(ref(db, `families/${code}/allergies`), (snap) => {
    callbacks.onAllergies(snap.val() || {});
  });

  const unsubGrowth = onValue(ref(db, `families/${code}/growthRecords`), (snap) => {
    callbacks.onGrowthRecords(snap.val() || {});
  });

  const unsubMedications = onValue(ref(db, `families/${code}/medications`), (snap) => {
    callbacks.onMedications(snap.val() || {});
  });

  const unsubPeriod = onValue(ref(db, `families/${code}/periodRecords`), (snap) => {
    callbacks.onPeriodRecords(snap.val() || {});
  });

  return () => {
    unsubMembers();
    unsubEntries();
    unsubLogs();
    unsubDismissed();
    unsubAllergies();
    unsubGrowth();
    unsubMedications();
    unsubPeriod();
  };
}
