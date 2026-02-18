import { useState, useMemo } from 'react';

// ── Pure calculation helpers ──

function getPeriodLogs(records) {
  return records.filter((r) => r.type === 'period').sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function getOvulationLogs(records) {
  return records.filter((r) => r.type === 'ovulation').sort((a, b) => b.date.localeCompare(a.date));
}

function getSettings(records) {
  const settings = records.filter((r) => r.type === 'settings');
  if (settings.length === 0) return { customCycleLength: 28 };
  return settings.reduce((a, b) => (a.id > b.id ? a : b));
}

function calcAverageCycleLength(periodLogs, customCycleLength) {
  if (periodLogs.length < 2) return customCycleLength;
  const gaps = [];
  for (let i = 1; i < periodLogs.length; i++) {
    const prev = new Date(periodLogs[i - 1].startDate);
    const curr = new Date(periodLogs[i].startDate);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays < 100) gaps.push(diffDays);
  }
  if (gaps.length === 0) return customCycleLength;
  return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDateFull(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysFromNow(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function todayStr() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SYMPTOM_OPTIONS = ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Mood swings', 'Back pain', 'Nausea', 'Breast tenderness'];

// ── Calendar builder ──

function buildCalendarDays(periodLogs, ovulationLogs, nextPeriodDate, nextOvulationDate, fertileStart, fertileEnd) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString().split('T')[0];

  // Show current month centered: start from 1st of previous month to end of next month
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startDate = new Date(firstOfMonth);
  // Go back to the Sunday of the week containing the 1st
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const endDate = new Date(lastOfMonth);
  // Go forward to the Saturday of the week containing the last day
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const weeks = [];
  let currentWeek = [];
  const d = new Date(startDate);

  while (d <= endDate) {
    const dateStr = d.toISOString().split('T')[0];
    const isCurrentMonth = d.getMonth() === today.getMonth();

    const isPeriod = periodLogs.some((p) => {
      const end = p.endDate || p.startDate;
      return dateStr >= p.startDate && dateStr <= end;
    });
    const isOvulation = ovulationLogs.some((o) => o.date === dateStr);
    const isPredictedPeriod = nextPeriodDate && dateStr >= nextPeriodDate && dateStr <= addDays(nextPeriodDate, 4) && !isPeriod;
    const isPredictedOvulation = !isOvulation && nextOvulationDate === dateStr;
    const isFertile = fertileStart && fertileEnd && dateStr >= fertileStart && dateStr <= fertileEnd && !isPeriod && !isOvulation && !isPredictedOvulation;

    currentWeek.push({
      date: dateStr,
      dayNum: d.getDate(),
      isToday: dateStr === todayISO,
      isCurrentMonth,
      isPeriod,
      isOvulation,
      isPredictedPeriod,
      isPredictedOvulation,
      isFertile,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    d.setDate(d.getDate() + 1);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const monthLabel = `${MONTH_NAMES[today.getMonth()]} ${today.getFullYear()}`;
  return { weeks, monthLabel };
}

// ── Combined log builder ──

function buildCombinedLog(periodLogs, ovulationLogs) {
  const items = [];
  periodLogs.forEach((p) => items.push({ ...p, sortDate: p.startDate }));
  ovulationLogs.forEach((o) => items.push({ ...o, sortDate: o.date }));
  items.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  return items.slice(0, 8);
}

// ── Component ──

export default function PeriodSection({ records, onAdd, onDelete }) {
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [showOvulationForm, setShowOvulationForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [periodForm, setPeriodForm] = useState({ startDate: '', endDate: '', flow: 'Medium', symptoms: [], otherSymptom: '', notes: '' });
  const [ovulationForm, setOvulationForm] = useState({ date: '', notes: '' });
  const [settingsForm, setSettingsForm] = useState(null);

  const periodLogs = useMemo(() => getPeriodLogs(records), [records]);
  const ovulationLogs = useMemo(() => getOvulationLogs(records), [records]);
  const settings = useMemo(() => getSettings(records), [records]);
  const avgCycle = useMemo(() => calcAverageCycleLength(periodLogs, settings.customCycleLength || 28), [periodLogs, settings]);

  const lastPeriod = periodLogs.length > 0 ? periodLogs[periodLogs.length - 1] : null;
  const nextPeriodDate = lastPeriod ? addDays(lastPeriod.startDate, avgCycle) : null;
  const nextOvulationDate = nextPeriodDate ? addDays(nextPeriodDate, -14) : null;
  const fertileStart = nextOvulationDate ? addDays(nextOvulationDate, -5) : null;
  const fertileEnd = nextOvulationDate ? addDays(nextOvulationDate, 1) : null;

  const calendar = useMemo(
    () => buildCalendarDays(periodLogs, ovulationLogs, nextPeriodDate, nextOvulationDate, fertileStart, fertileEnd),
    [periodLogs, ovulationLogs, nextPeriodDate, nextOvulationDate, fertileStart, fertileEnd]
  );

  const combinedLog = useMemo(() => buildCombinedLog(periodLogs, ovulationLogs), [periodLogs, ovulationLogs]);

  const nextPeriodDays = nextPeriodDate ? daysFromNow(nextPeriodDate) : null;

  // ── Quick log handlers ──

  function handleQuickLogPeriod() {
    onAdd({
      id: generateId(),
      type: 'period',
      startDate: todayStr(),
      endDate: todayStr(),
      flow: 'Medium',
      symptoms: '',
      notes: '',
    });
  }

  function handleQuickLogOvulation() {
    onAdd({
      id: generateId(),
      type: 'ovulation',
      date: todayStr(),
      notes: '',
    });
  }

  // ── Form handlers ──

  function toggleSymptom(symptom) {
    setPeriodForm((f) => ({
      ...f,
      symptoms: f.symptoms.includes(symptom) ? f.symptoms.filter((s) => s !== symptom) : [...f.symptoms, symptom],
    }));
  }

  function handleSubmitPeriod(e) {
    e.preventDefault();
    if (!periodForm.startDate) return;
    const allSymptoms = [...periodForm.symptoms];
    if (periodForm.otherSymptom.trim()) allSymptoms.push(periodForm.otherSymptom.trim());
    onAdd({
      id: generateId(),
      type: 'period',
      startDate: periodForm.startDate,
      endDate: periodForm.endDate || periodForm.startDate,
      flow: periodForm.flow,
      symptoms: allSymptoms.join(', '),
      notes: periodForm.notes,
    });
    setPeriodForm({ startDate: '', endDate: '', flow: 'Medium', symptoms: [], otherSymptom: '', notes: '' });
    setShowPeriodForm(false);
  }

  function handleSubmitOvulation(e) {
    e.preventDefault();
    if (!ovulationForm.date) return;
    onAdd({
      id: generateId(),
      type: 'ovulation',
      date: ovulationForm.date,
      notes: ovulationForm.notes,
    });
    setOvulationForm({ date: '', notes: '' });
    setShowOvulationForm(false);
  }

  function handleSaveSettings(e) {
    e.preventDefault();
    const len = Number(settingsForm);
    if (!len || len < 20 || len > 45) return;
    onAdd({
      id: generateId(),
      type: 'settings',
      customCycleLength: len,
    });
    setSettingsForm(null);
    setShowSettings(false);
  }

  function periodDuration(p) {
    return daysBetween(p.startDate, p.endDate || p.startDate) + 1;
  }

  // ── Empty state ──
  if (combinedLog.length === 0 && !showPeriodForm && !showOvulationForm) {
    return (
      <div className="period-section">
        <div className="period-header">
          <h3>Period & Ovulation Tracking</h3>
          <button className="period-gear-btn" onClick={() => { setShowSettings(!showSettings); if (!showSettings) setSettingsForm(settings.customCycleLength || 28); }} title="Cycle settings">&#9881;</button>
        </div>

        {showSettings && (
          <form className="period-inline-form period-settings-form" onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label>Default Cycle Length (days)</label>
              <input type="number" min="20" max="45" value={settingsForm ?? 28} onChange={(e) => setSettingsForm(e.target.value)} />
            </div>
            <div className="period-form-actions">
              <button type="submit" className="btn btn-primary btn-sm">Save</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowSettings(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="period-empty-state">
          <div className="period-empty-icon">&#128197;</div>
          <p className="period-empty-title">Start tracking your cycle</p>
          <p className="period-empty-desc">Log your period to get predictions for your next cycle, ovulation, and fertile window.</p>
          <div className="period-empty-actions">
            <button className="btn btn-primary" onClick={() => setShowPeriodForm(true)}>Log Your First Period</button>
            <button className="btn btn-secondary" onClick={() => setShowOvulationForm(true)}>Log Ovulation</button>
          </div>
        </div>

        {showPeriodForm && renderPeriodForm()}
        {showOvulationForm && renderOvulationForm()}
      </div>
    );
  }

  // ── Period form renderer ──
  function renderPeriodForm() {
    return (
      <form className="period-inline-form" onSubmit={handleSubmitPeriod}>
        <h4>Log Period</h4>
        <div className="period-form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input type="date" value={periodForm.startDate} onChange={(e) => setPeriodForm((f) => ({ ...f, startDate: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" value={periodForm.endDate} onChange={(e) => setPeriodForm((f) => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Flow</label>
            <select value={periodForm.flow} onChange={(e) => setPeriodForm((f) => ({ ...f, flow: e.target.value }))}>
              <option value="Light">Light</option>
              <option value="Medium">Medium</option>
              <option value="Heavy">Heavy</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Symptoms</label>
          <div className="period-symptom-chips">
            {SYMPTOM_OPTIONS.map((s) => (
              <button type="button" key={s} className={`period-chip${periodForm.symptoms.includes(s) ? ' active' : ''}`} onClick={() => toggleSymptom(s)}>{s}</button>
            ))}
          </div>
          <input type="text" className="period-other-symptom" placeholder="Other symptom..." value={periodForm.otherSymptom} onChange={(e) => setPeriodForm((f) => ({ ...f, otherSymptom: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <input type="text" placeholder="Optional notes..." value={periodForm.notes} onChange={(e) => setPeriodForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="period-form-actions">
          <button type="submit" className="btn btn-primary btn-sm">Save</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPeriodForm(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  // ── Ovulation form renderer ──
  function renderOvulationForm() {
    return (
      <form className="period-inline-form" onSubmit={handleSubmitOvulation}>
        <h4>Log Ovulation</h4>
        <div className="period-form-row">
          <div className="form-group">
            <label>Date *</label>
            <input type="date" value={ovulationForm.date} onChange={(e) => setOvulationForm((f) => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input type="text" placeholder="Optional notes..." value={ovulationForm.notes} onChange={(e) => setOvulationForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="period-form-actions">
          <button type="submit" className="btn btn-primary btn-sm">Save</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowOvulationForm(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  // ── Main render ──
  return (
    <div className="period-section">
      <div className="period-header">
        <h3>Period & Ovulation Tracking</h3>
        <button className="period-gear-btn" onClick={() => { setShowSettings(!showSettings); if (!showSettings) setSettingsForm(settings.customCycleLength || 28); }} title="Cycle settings">&#9881;</button>
      </div>

      {/* Settings inline (gear icon toggle) */}
      {showSettings && (
        <form className="period-inline-form period-settings-form" onSubmit={handleSaveSettings}>
          <div className="period-form-row">
            <div className="form-group">
              <label>Default Cycle Length (days)</label>
              <input type="number" min="20" max="45" value={settingsForm ?? (settings.customCycleLength || 28)} onChange={(e) => setSettingsForm(e.target.value)} />
              <span className="period-settings-info">
                Calculated average: <strong>{avgCycle} days</strong>
                {periodLogs.length < 2 ? ' (default — log 2+ periods for auto)' : ` (from ${periodLogs.length} logs)`}
              </span>
            </div>
          </div>
          <div className="period-form-actions">
            <button type="submit" className="btn btn-primary btn-sm">Save</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowSettings(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Hero prediction (#11) */}
      <div className="period-hero">
        {nextPeriodDate ? (
          <>
            <div className="period-hero-main">
              {nextPeriodDays >= 0 ? (
                <>
                  <span className="period-hero-number">{nextPeriodDays}</span>
                  <span className="period-hero-label">day{nextPeriodDays !== 1 ? 's' : ''} until next period</span>
                </>
              ) : (
                <>
                  <span className="period-hero-number period-hero-late">{Math.abs(nextPeriodDays)}</span>
                  <span className="period-hero-label">day{Math.abs(nextPeriodDays) !== 1 ? 's' : ''} late</span>
                </>
              )}
            </div>
            <div className="period-hero-sub">Expected {formatDateFull(nextPeriodDate)}</div>
          </>
        ) : (
          <div className="period-hero-main">
            <span className="period-hero-label">Log a period to see predictions</span>
          </div>
        )}
      </div>

      {/* Quick log buttons (#7) */}
      <div className="period-quick-actions">
        <button className="period-quick-btn period-quick-period" onClick={handleQuickLogPeriod}>Start Period Today</button>
        <button className="period-quick-btn period-quick-ovulation" onClick={handleQuickLogOvulation}>Log Ovulation Today</button>
        <button className="period-action-btn" onClick={() => { setShowPeriodForm(!showPeriodForm); setShowOvulationForm(false); }}>+ Log Period</button>
        <button className="period-action-btn" onClick={() => { setShowOvulationForm(!showOvulationForm); setShowPeriodForm(false); }}>+ Log Ovulation</button>
      </div>

      {/* Inline forms (#1) */}
      {showPeriodForm && renderPeriodForm()}
      {showOvulationForm && renderOvulationForm()}

      {/* Stats grid 2x2 (#2) */}
      <div className="period-overview">
        <div className="period-stat-card">
          <div className="period-stat-label">Avg Cycle</div>
          <div className="period-stat-value">{avgCycle} days</div>
          {periodLogs.length < 2 && <div className="period-stat-hint">Default</div>}
        </div>
        <div className="period-stat-card">
          <div className="period-stat-label">Next Ovulation</div>
          <div className="period-stat-value">{nextOvulationDate ? formatDate(nextOvulationDate) : 'N/A'}</div>
          {nextOvulationDate && <div className="period-stat-hint">{daysFromNow(nextOvulationDate) >= 0 ? `in ${daysFromNow(nextOvulationDate)} days` : `${Math.abs(daysFromNow(nextOvulationDate))} days ago`}</div>}
        </div>
        <div className="period-stat-card">
          <div className="period-stat-label">Fertile Window</div>
          <div className="period-stat-value">{fertileStart && fertileEnd ? `${formatDate(fertileStart)} - ${formatDate(fertileEnd)}` : 'N/A'}</div>
        </div>
        <div className="period-stat-card">
          <div className="period-stat-label">Last Period</div>
          <div className="period-stat-value">{lastPeriod ? formatDate(lastPeriod.startDate) : 'N/A'}</div>
          {lastPeriod && <div className="period-stat-hint">{Math.abs(daysFromNow(lastPeriod.startDate))} days ago</div>}
        </div>
      </div>

      {/* Calendar view (#4, #5) */}
      <div className="period-calendar">
        <div className="period-calendar-header">{calendar.monthLabel}</div>
        <div className="period-calendar-grid">
          {DAY_LABELS.map((d) => (
            <div key={d} className="period-cal-dayname">{d}</div>
          ))}
          {calendar.weeks.flat().map((day) => (
            <div
              key={day.date}
              className={
                'period-cal-day' +
                (!day.isCurrentMonth ? ' other-month' : '') +
                (day.isPeriod ? ' period' : '') +
                (day.isOvulation ? ' ovulation' : '') +
                (day.isPredictedPeriod ? ' predicted-period' : '') +
                (day.isPredictedOvulation ? ' predicted-ovulation' : '') +
                (day.isFertile ? ' fertile' : '') +
                (day.isToday ? ' today' : '')
              }
              title={day.date}
            >
              {day.dayNum}
            </div>
          ))}
        </div>
        <div className="period-calendar-legend">
          <span className="period-legend-item"><span className="period-legend-dot period"></span> Period</span>
          <span className="period-legend-item"><span className="period-legend-dot ovulation"></span> Ovulation</span>
          <span className="period-legend-item"><span className="period-legend-dot fertile"></span> Fertile</span>
          <span className="period-legend-item"><span className="period-legend-dot predicted"></span> Predicted</span>
        </div>
      </div>

      {/* Combined chronological log (#12) */}
      {combinedLog.length > 0 && (
        <div className="period-log-section">
          <h4>Recent Activity</h4>
          <div className="period-log-list">
            {combinedLog.map((item) => (
              <div key={item.id} className={`period-log-item ${item.type === 'period' ? 'period-type' : 'ovulation-type'}`}>
                <span className={`period-log-dot ${item.type}`}></span>
                <div className="period-log-item-info">
                  {item.type === 'period' ? (
                    <>
                      <strong>{formatDate(item.startDate)}{item.endDate && item.endDate !== item.startDate ? ` - ${formatDate(item.endDate)}` : ''}</strong>
                      <span className="period-log-meta">
                        {periodDuration(item)} day{periodDuration(item) !== 1 ? 's' : ''}
                        <span className={`period-flow-badge flow-${item.flow.toLowerCase()}`}>{item.flow}</span>
                      </span>
                      {item.symptoms && <span className="period-log-symptoms">{item.symptoms}</span>}
                    </>
                  ) : (
                    <>
                      <strong>Ovulation - {formatDate(item.date)}</strong>
                      {item.notes && <span className="period-log-notes">{item.notes}</span>}
                    </>
                  )}
                </div>
                <button className="period-delete-btn" onClick={() => onDelete(item.id)} title="Delete">&#128465;</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
