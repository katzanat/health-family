import { useState, useEffect, useRef } from 'react';
import OnboardingPage from './components/onboarding/OnboardingPage';
import DashboardPage from './components/dashboard/DashboardPage';
import LandingPage from './components/LandingPage';
import FamilyCodeScreen from './components/FamilyCodeScreen';
import {
  getFamilyMembers, saveFamilyMembers,
  getHealthEntries, saveHealthEntries,
  getCheckupLogs, saveCheckupLogs,
  getDismissedCheckups, saveDismissedCheckups,
  getFamilyCode, saveFamilyCode,
  getAllergies, saveAllergies,
  getGrowthRecords, saveGrowthRecords,
  getMedications, saveMedications,
  getPeriodRecords, savePeriodRecords,
} from './utils/storage';
import {
  initFirebase,
  signInWithGoogle,
  signOutUser,
  onAuthChange,
  writeMembers,
  writeEntries,
  writeCheckupLogs,
  writeDismissedCheckups,
  writeAllergies,
  writeGrowthRecords,
  writeMedications,
  writePeriodRecords,
  subscribeToFamily,
} from './utils/firebase';
import './App.css';

function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [familyCode, setFamilyCode] = useState(() => getFamilyCode());
  const [members, setMembers] = useState(() => getFamilyMembers());
  const [entries, setEntries] = useState(() => getHealthEntries());
  const [checkupLogs, setCheckupLogs] = useState(() => getCheckupLogs());
  const [dismissedCheckups, setDismissedCheckups] = useState(() => getDismissedCheckups());
  const [allergies, setAllergies] = useState(() => getAllergies());
  const [growthRecords, setGrowthRecords] = useState(() => getGrowthRecords());
  const [medications, setMedications] = useState(() => getMedications());
  const [periodRecords, setPeriodRecords] = useState(() => getPeriodRecords());
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | synced | error
  const [view, setView] = useState(() => (getFamilyMembers().length > 0 ? 'dashboard' : 'onboarding'));

  const isRemoteUpdate = useRef(false);
  const unsubRef = useRef(null);

  // ── Auth listener ──
  useEffect(() => {
    initFirebase();
    const unsub = onAuthChange((firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return unsub;
  }, []);

  // ── Firebase subscription when familyCode is set ──
  useEffect(() => {
    if (!user || !familyCode) {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      return;
    }

    setSyncStatus('syncing');

    unsubRef.current = subscribeToFamily(familyCode, {
      onMembers: (remoteMembers) => {
        isRemoteUpdate.current = true;
        setMembers(remoteMembers);
        saveFamilyMembers(remoteMembers);
        setSyncStatus('synced');
      },
      onEntries: (remoteEntries) => {
        isRemoteUpdate.current = true;
        // Merge: keep local images for entries that exist locally
        setEntries((localEntries) => {
          const localMap = {};
          localEntries.forEach((e) => { localMap[e.id] = e; });
          const merged = remoteEntries.map((re) => ({
            ...re,
            image: localMap[re.id]?.image || undefined,
          }));
          saveHealthEntries(merged);
          return merged;
        });
        setSyncStatus('synced');
      },
      onCheckupLogs: (remoteLogs) => {
        isRemoteUpdate.current = true;
        setCheckupLogs(remoteLogs);
        saveCheckupLogs(remoteLogs);
        setSyncStatus('synced');
      },
      onDismissedCheckups: (remoteDismissed) => {
        isRemoteUpdate.current = true;
        setDismissedCheckups(remoteDismissed);
        saveDismissedCheckups(remoteDismissed);
        setSyncStatus('synced');
      },
      onAllergies: (remoteAllergies) => {
        isRemoteUpdate.current = true;
        setAllergies(remoteAllergies);
        saveAllergies(remoteAllergies);
        setSyncStatus('synced');
      },
      onGrowthRecords: (remoteGrowth) => {
        isRemoteUpdate.current = true;
        setGrowthRecords(remoteGrowth);
        saveGrowthRecords(remoteGrowth);
        setSyncStatus('synced');
      },
      onMedications: (remoteMedications) => {
        isRemoteUpdate.current = true;
        setMedications(remoteMedications);
        saveMedications(remoteMedications);
        setSyncStatus('synced');
      },
      onPeriodRecords: (remotePeriodRecords) => {
        isRemoteUpdate.current = true;
        setPeriodRecords(remotePeriodRecords);
        savePeriodRecords(remotePeriodRecords);
        setSyncStatus('synced');
      },
    });

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [user, familyCode]);

  // ── Persist + sync to Firebase ──
  useEffect(() => {
    saveFamilyMembers(members);
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (familyCode && user) {
      writeMembers(familyCode, members).catch(() => setSyncStatus('error'));
    }
  }, [members]);

  useEffect(() => {
    saveHealthEntries(entries);
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (familyCode && user) {
      writeEntries(familyCode, entries).catch(() => setSyncStatus('error'));
    }
  }, [entries]);

  useEffect(() => {
    saveCheckupLogs(checkupLogs);
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (familyCode && user) {
      writeCheckupLogs(familyCode, checkupLogs).catch(() => setSyncStatus('error'));
    }
  }, [checkupLogs]);

  useEffect(() => {
    saveDismissedCheckups(dismissedCheckups);
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (familyCode && user) {
      writeDismissedCheckups(familyCode, dismissedCheckups).catch(() => setSyncStatus('error'));
    }
  }, [dismissedCheckups]);

  useEffect(() => {
    saveAllergies(allergies);
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (familyCode && user) {
      writeAllergies(familyCode, allergies).catch(() => setSyncStatus('error'));
    }
  }, [allergies]);

  useEffect(() => {
    saveGrowthRecords(growthRecords);
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (familyCode && user) {
      writeGrowthRecords(familyCode, growthRecords).catch(() => setSyncStatus('error'));
    }
  }, [growthRecords]);

  useEffect(() => {
    saveMedications(medications);
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (familyCode && user) {
      writeMedications(familyCode, medications).catch(() => setSyncStatus('error'));
    }
  }, [medications]);

  useEffect(() => {
    savePeriodRecords(periodRecords);
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (familyCode && user) {
      writePeriodRecords(familyCode, periodRecords).catch(() => setSyncStatus('error'));
    }
  }, [periodRecords]);

  // ── Handlers ──
  function handleAddMember(member) {
    setMembers((prev) => [...prev, member]);
  }

  function handleDeleteMember(id) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function handleSaveEntry(entry) {
    setEntries((prev) => [...prev, entry]);
  }

  function handleMarkCheckupDone(memberId, checkupId, date) {
    setCheckupLogs((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [checkupId]: date || new Date().toISOString(),
      },
    }));
  }

  function handleDismissCheckup(memberId, checkupId) {
    setDismissedCheckups((prev) => ({
      ...prev,
      [memberId]: [...(prev[memberId] || []), checkupId],
    }));
  }

  function handleAddAllergy(memberId, allergy) {
    setAllergies((prev) => ({
      ...prev,
      [memberId]: [...(prev[memberId] || []), allergy],
    }));
  }

  function handleDeleteAllergy(memberId, allergyId) {
    setAllergies((prev) => ({
      ...prev,
      [memberId]: (prev[memberId] || []).filter((a) => a.id !== allergyId),
    }));
  }

  function handleAddGrowthRecord(memberId, record) {
    setGrowthRecords((prev) => ({
      ...prev,
      [memberId]: [...(prev[memberId] || []), record],
    }));
  }

  function handleDeleteGrowthRecord(memberId, recordId) {
    setGrowthRecords((prev) => ({
      ...prev,
      [memberId]: (prev[memberId] || []).filter((r) => r.id !== recordId),
    }));
  }

  function handleAddMedication(memberId, med) {
    setMedications((prev) => ({
      ...prev,
      [memberId]: [...(prev[memberId] || []), med],
    }));
  }

  function handleDeleteMedication(memberId, medId) {
    setMedications((prev) => ({
      ...prev,
      [memberId]: (prev[memberId] || []).filter((m) => m.id !== medId),
    }));
  }

  function handleAddPeriodRecord(memberId, record) {
    setPeriodRecords((prev) => ({
      ...prev,
      [memberId]: [...(prev[memberId] || []), record],
    }));
  }

  function handleDeletePeriodRecord(memberId, recordId) {
    setPeriodRecords((prev) => ({
      ...prev,
      [memberId]: (prev[memberId] || []).filter((r) => r.id !== recordId),
    }));
  }

  async function handleGetStarted() {
    try {
      await signInWithGoogle();
    } catch (err) {
      // User closed popup or error — stay on landing
    }
  }

  function handleJoinFamily(code) {
    setFamilyCode(code);
    saveFamilyCode(code);
    setView(members.length > 0 ? 'dashboard' : 'onboarding');
  }

  async function handleSignOut() {
    try {
      await signOutUser();
    } catch {
      // ignore
    }
    setUser(null);
    setFamilyCode('');
    saveFamilyCode('');
    setSyncStatus('idle');
  }

  function handleLeaveFamily() {
    setFamilyCode('');
    saveFamilyCode('');
    setSyncStatus('idle');
  }

  // ── Loading state ──
  if (user === undefined) {
    return (
      <div className="app">
        <div className="loading-screen">
          <h1 className="app-title">Health Family</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // ── Not signed in → Landing ──
  if (!user) {
    return (
      <div className="app">
        <LandingPage onGetStarted={handleGetStarted} />
      </div>
    );
  }

  // ── Signed in but no family code → Family Code Screen ──
  if (!familyCode) {
    return (
      <div className="app">
        <FamilyCodeScreen onJoin={handleJoinFamily} />
      </div>
    );
  }

  // ── Onboarding ──
  if (view === 'onboarding') {
    return (
      <div className="app">
        <OnboardingPage
          members={members}
          onAddMember={handleAddMember}
          onDeleteMember={handleDeleteMember}
          onContinue={() => setView('dashboard')}
        />
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="app">
      <DashboardPage
        members={members}
        entries={entries}
        checkupLogs={checkupLogs}
        onSaveEntry={handleSaveEntry}
        onMarkCheckupDone={handleMarkCheckupDone}
        onManageFamily={() => setView('onboarding')}
        familyCode={familyCode}
        syncStatus={syncStatus}
        onSignOut={handleSignOut}
        onLeaveFamily={handleLeaveFamily}
        userName={user.displayName}
        dismissedCheckups={dismissedCheckups}
        onDismissCheckup={handleDismissCheckup}
        allergies={allergies}
        onAddAllergy={handleAddAllergy}
        onDeleteAllergy={handleDeleteAllergy}
        growthRecords={growthRecords}
        onAddGrowthRecord={handleAddGrowthRecord}
        onDeleteGrowthRecord={handleDeleteGrowthRecord}
        medications={medications}
        onAddMedication={handleAddMedication}
        onDeleteMedication={handleDeleteMedication}
        periodRecords={periodRecords}
        onAddPeriodRecord={handleAddPeriodRecord}
        onDeletePeriodRecord={handleDeletePeriodRecord}
      />
    </div>
  );
}

export default App;
