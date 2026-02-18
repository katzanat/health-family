const KEYS = {
  FAMILY_MEMBERS: 'healthFamily_members',
  HEALTH_ENTRIES: 'healthFamily_entries',
  CHECKUP_LOGS: 'healthFamily_checkupLogs',
  FAMILY_CODE: 'healthFamily_familyCode',
  DISMISSED_CHECKUPS: 'healthFamily_dismissedCheckups',
  ALLERGIES: 'healthFamily_allergies',
  GROWTH_RECORDS: 'healthFamily_growthRecords',
  MEDICATIONS: 'healthFamily_medications',
  PERIOD_RECORDS: 'healthFamily_periodRecords',
};

function getJSON(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getFamilyMembers() {
  return getJSON(KEYS.FAMILY_MEMBERS) || [];
}

export function saveFamilyMembers(members) {
  setJSON(KEYS.FAMILY_MEMBERS, members);
}

export function getHealthEntries() {
  return getJSON(KEYS.HEALTH_ENTRIES) || [];
}

export function saveHealthEntries(entries) {
  setJSON(KEYS.HEALTH_ENTRIES, entries);
}

export function getCheckupLogs() {
  return getJSON(KEYS.CHECKUP_LOGS) || {};
}

export function saveCheckupLogs(logs) {
  setJSON(KEYS.CHECKUP_LOGS, logs);
}

export function getDismissedCheckups() {
  return getJSON(KEYS.DISMISSED_CHECKUPS) || {};
}

export function saveDismissedCheckups(dismissed) {
  setJSON(KEYS.DISMISSED_CHECKUPS, dismissed);
}

export function getFamilyCode() {
  return localStorage.getItem(KEYS.FAMILY_CODE) || '';
}

export function saveFamilyCode(code) {
  if (code) {
    localStorage.setItem(KEYS.FAMILY_CODE, code);
  } else {
    localStorage.removeItem(KEYS.FAMILY_CODE);
  }
}

export function getAllergies() {
  return getJSON(KEYS.ALLERGIES) || {};
}

export function saveAllergies(allergies) {
  setJSON(KEYS.ALLERGIES, allergies);
}

export function getGrowthRecords() {
  return getJSON(KEYS.GROWTH_RECORDS) || {};
}

export function saveGrowthRecords(records) {
  setJSON(KEYS.GROWTH_RECORDS, records);
}

export function getMedications() {
  return getJSON(KEYS.MEDICATIONS) || {};
}

export function saveMedications(medications) {
  setJSON(KEYS.MEDICATIONS, medications);
}

export function getPeriodRecords() {
  return getJSON(KEYS.PERIOD_RECORDS) || {};
}

export function savePeriodRecords(records) {
  setJSON(KEYS.PERIOD_RECORDS, records);
}
