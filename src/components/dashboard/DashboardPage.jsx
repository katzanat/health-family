import { useState, useRef, useEffect } from 'react';
import MemberDashboard from './MemberDashboard';
import HealthEntryModal from './HealthEntryModal';
import { getRecommendedCheckups } from '../../data/checkupRecommendations';
import { getCheckupStatus, formatDate } from '../../utils/checkupUtils';

const ROLE_ICONS = {
  Mom: '\u{1F469}',
  Dad: '\u{1F468}',
  Brother: '\u{1F466}',
  Sister: '\u{1F467}',
  Grandparent: '\u{1F9D3}',
  Other: '\u{1F9D1}',
};

const SYNC_LABELS = {
  idle: '',
  syncing: 'Syncing...',
  synced: 'Synced',
  error: 'Sync error',
};

function AttentionSection({ members, entries, checkupLogs, dismissedCheckups, appointments, onGoToMember }) {
  const today = new Date();
  const items = [];

  members.forEach((m) => {
    const memberLogs = checkupLogs[m.id] || {};
    const memberDismissed = (dismissedCheckups[m.id] || []);
    const recommended = getRecommendedCheckups(m.age, m.gender);
    recommended.forEach((c) => {
      if (memberDismissed.includes(c.id)) return;
      const status = getCheckupStatus(memberLogs[c.id], c.frequencyMonths);
      if (status === 'overdue' || status === 'due-soon') {
        items.push({
          key: `${m.id}-${c.id}`,
          memberId: m.id,
          memberName: m.name,
          label: c.name,
          type: status,
        });
      }
    });

    entries
      .filter((e) => e.memberId === m.id && e.followUp && e.followUpDate && new Date(e.followUpDate) < today)
      .forEach((e) => {
        items.push({
          key: `followup-${e.id}`,
          memberId: m.id,
          memberName: m.name,
          label: `Follow-up: ${e.description?.slice(0, 40) || 'symptom'}`,
          type: 'followup',
          date: e.followUpDate,
        });
      });

    (appointments[m.id] || [])
      .filter((a) => a.date && new Date(a.date) < today && !a.outcome)
      .forEach((a) => {
        items.push({
          key: `appt-${a.id}`,
          memberId: m.id,
          memberName: m.name,
          label: `Appointment outcome missing: ${a.specialty || a.doctorName || 'doctor visit'}`,
          type: 'overdue',
          date: a.date,
        });
      });
  });

  if (items.length === 0) return null;

  return (
    <div className="attention-section">
      <h3 className="attention-title">⚠️ Needs Attention ({items.length})</h3>
      <div className="attention-list">
        {items.map((item) => (
          <button
            key={item.key}
            className={`attention-item attention-item-${item.type}`}
            onClick={() => onGoToMember(item.memberId)}
          >
            <span className="attention-member">{item.memberName}</span>
            <span className="attention-label">{item.label}</span>
            {item.date && <span className="attention-date">Due {formatDate(item.date)}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage({
  members,
  entries,
  checkupLogs,
  onSaveEntry,
  onDeleteEntry,
  onMarkCheckupDone,
  onManageFamily,
  familyCode,
  syncStatus,
  onSignOut,
  onLeaveFamily,
  userName,
  dismissedCheckups,
  onDismissCheckup,
  allergies,
  onAddAllergy,
  onDeleteAllergy,
  growthRecords,
  onAddGrowthRecord,
  onDeleteGrowthRecord,
  medications,
  onAddMedication,
  onDeleteMedication,
  periodRecords,
  onAddPeriodRecord,
  onDeletePeriodRecord,
  appointments,
  onAddAppointment,
  onDeleteAppointment,
  onUpdateAppointment,
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [preselectedMemberId, setPreselectedMemberId] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const menuRef = useRef(null);

  function handleCopyCode() {
    navigator.clipboard?.writeText(familyCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  function handleAddEntry(memberId) {
    setPreselectedMemberId(memberId || '');
    setShowModal(true);
  }

  function handleSaveEntry(entry) {
    onSaveEntry(entry);
    setShowModal(false);
  }

  if (selectedMember) {
    return (
      <>
        <div className="dashboard-top-bar">
          <h1 className="app-title">Symptom<span className="brand-accent">Nest</span></h1>
          <div className="dashboard-actions">
            {syncStatus && syncStatus !== 'idle' && (
              <span className={`sync-badge sync-${syncStatus}`}>{SYNC_LABELS[syncStatus]}</span>
            )}
            <div className="hamburger-wrap" ref={menuRef}>
              <button
                className="btn btn-secondary hamburger-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menu"
              >
                ☰
              </button>
              {menuOpen && (
                <div className="hamburger-menu">
                  {userName && <div className="hamburger-user">Hi, {userName.split(' ')[0]}</div>}
                  {familyCode && (
                    <div className="hamburger-code">
                      <span className="hamburger-code-label">Family code</span>
                      <div className="hamburger-code-row">
                        <span className="family-code-badge">{familyCode}</span>
                        <button className="btn-link hamburger-copy-btn" onClick={handleCopyCode}>
                          {codeCopied ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                  <hr className="hamburger-divider" />
                  <button className="hamburger-item" onClick={() => { onManageFamily(); setMenuOpen(false); }}>
                    👨‍👩‍👧 Manage Family
                  </button>
                  {onLeaveFamily && (
                    <button className="hamburger-item" onClick={() => { onLeaveFamily(); setMenuOpen(false); }}>
                      🚪 Leave Family
                    </button>
                  )}
                  {onSignOut && (
                    <button className="hamburger-item hamburger-item-danger" onClick={() => { onSignOut(); setMenuOpen(false); }}>
                      Sign Out
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <MemberDashboard
          member={selectedMember}
          entries={entries}
          checkupLogs={checkupLogs}
          onMarkCheckupDone={onMarkCheckupDone}
          onAddEntry={handleAddEntry}
          onDeleteEntry={onDeleteEntry}
          onBack={() => setSelectedMemberId(null)}
          dismissedCheckups={dismissedCheckups}
          onDismissCheckup={onDismissCheckup}
          allergies={allergies}
          onAddAllergy={onAddAllergy}
          onDeleteAllergy={onDeleteAllergy}
          growthRecords={growthRecords}
          onAddGrowthRecord={onAddGrowthRecord}
          onDeleteGrowthRecord={onDeleteGrowthRecord}
          medications={medications}
          onAddMedication={onAddMedication}
          onDeleteMedication={onDeleteMedication}
          periodRecords={periodRecords}
          onAddPeriodRecord={onAddPeriodRecord}
          onDeletePeriodRecord={onDeletePeriodRecord}
          appointments={appointments}
          onAddAppointment={onAddAppointment}
          onDeleteAppointment={onDeleteAppointment}
          onUpdateAppointment={onUpdateAppointment}
        />
        {showModal && (
          <HealthEntryModal
            members={members}
            onSave={handleSaveEntry}
            onClose={() => setShowModal(false)}
            preselectedMemberId={preselectedMemberId}
          />
        )}
      </>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-top-bar">
        <div>
          <h1 className="app-title">Symptom<span className="brand-accent">Nest</span></h1>
          <p className="slogan">Your family's symptoms, all in one place</p>
        </div>
        <div className="dashboard-actions">
          {syncStatus && syncStatus !== 'idle' && (
            <span className={`sync-badge sync-${syncStatus}`}>{SYNC_LABELS[syncStatus]}</span>
          )}
          <button className="btn btn-primary" onClick={() => handleAddEntry('')}>+ Add Symptom</button>
          <div className="hamburger-wrap" ref={menuRef}>
            <button
              className="btn btn-secondary hamburger-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              ☰
            </button>
            {menuOpen && (
              <div className="hamburger-menu">
                {userName && <div className="hamburger-user">Hi, {userName.split(' ')[0]}</div>}
                {familyCode && (
                  <div className="hamburger-code">
                    <span className="hamburger-code-label">Family code</span>
                    <span className="family-code-badge">{familyCode}</span>
                  </div>
                )}
                <hr className="hamburger-divider" />
                <button className="hamburger-item" onClick={() => { onManageFamily(); setMenuOpen(false); }}>
                  👨‍👩‍👧 Manage Family
                </button>
                {onLeaveFamily && (
                  <button className="hamburger-item" onClick={() => { onLeaveFamily(); setMenuOpen(false); }}>
                    🚪 Leave Family
                  </button>
                )}
                {onSignOut && (
                  <button className="hamburger-item hamburger-item-danger" onClick={() => { onSignOut(); setMenuOpen(false); }}>
                    Sign Out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AttentionSection
        members={members}
        entries={entries}
        checkupLogs={checkupLogs}
        dismissedCheckups={dismissedCheckups}
        appointments={appointments}
        onGoToMember={setSelectedMemberId}
      />

      <div className="family-grid">
        {members.map((m) => (
          <div key={m.id} className="family-dashboard-card" onClick={() => setSelectedMemberId(m.id)}>
            <div className="family-card-icon">
              {m.avatar
                ? <img src={m.avatar} alt={m.name} className="member-avatar-lg" />
                : (ROLE_ICONS[m.role] || '\u{1F9D1}')
              }
            </div>
            <h3>{m.name}</h3>
            <p>{m.role} &middot; {m.age} yrs</p>
            <p className="card-hint">Click to view checkups & symptoms</p>
          </div>
        ))}
      </div>

      {showModal && (
        <HealthEntryModal
          members={members}
          onSave={handleSaveEntry}
          onClose={() => setShowModal(false)}
          preselectedMemberId={preselectedMemberId}
        />
      )}
    </div>
  );
}
