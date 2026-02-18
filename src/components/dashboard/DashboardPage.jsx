import { useState } from 'react';
import MemberDashboard from './MemberDashboard';
import HealthEntryModal from './HealthEntryModal';

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

export default function DashboardPage({
  members,
  entries,
  checkupLogs,
  onSaveEntry,
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
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [preselectedMemberId, setPreselectedMemberId] = useState('');

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
          <h1 className="app-title">Health Family</h1>
          <div className="dashboard-meta">
            {syncStatus && syncStatus !== 'idle' && (
              <span className={`sync-badge sync-${syncStatus}`}>
                {SYNC_LABELS[syncStatus]}
              </span>
            )}
          </div>
        </div>
        <MemberDashboard
          member={selectedMember}
          entries={entries}
          checkupLogs={checkupLogs}
          onMarkCheckupDone={onMarkCheckupDone}
          onAddEntry={handleAddEntry}
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
          <h1 className="app-title">Health Family</h1>
          <p className="slogan">My Family Health Tracker</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={() => handleAddEntry('')}>+ Add Health Entry</button>
          <button className="btn btn-secondary" onClick={onManageFamily}>Manage Family</button>
        </div>
      </div>

      <div className="dashboard-info-bar">
        <div className="dashboard-info-left">
          {userName && <span className="user-greeting">Hi, {userName.split(' ')[0]}</span>}
          {familyCode && <span className="family-code-badge">Family: {familyCode}</span>}
          {syncStatus && syncStatus !== 'idle' && (
            <span className={`sync-badge sync-${syncStatus}`}>
              {SYNC_LABELS[syncStatus]}
            </span>
          )}
        </div>
        <div className="dashboard-info-right">
          {onLeaveFamily && (
            <button className="btn btn-secondary btn-sm" onClick={onLeaveFamily}>Leave Family</button>
          )}
          {onSignOut && (
            <button className="btn btn-danger btn-sm" onClick={onSignOut}>Sign Out</button>
          )}
        </div>
      </div>

      <div className="family-grid">
        {members.map((m) => (
          <div key={m.id} className="family-dashboard-card" onClick={() => setSelectedMemberId(m.id)}>
            <div className="family-card-icon">{ROLE_ICONS[m.role] || '\u{1F9D1}'}</div>
            <h3>{m.name}</h3>
            <p>{m.role} &middot; {m.age} yrs</p>
            <p className="card-hint">Click to view checkups & entries</p>
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
