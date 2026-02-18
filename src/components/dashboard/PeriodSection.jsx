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
  return new Date(dateStr + 'T00:00:00').toLocaleDateString();
}

function daysFromNow(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Timeline helpers ──

function buildTimelineDays(periodLogs, ovulationLogs, nextPeriodDate, nextOvulationDate, fertileStart, fertileEnd) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // Center on today: ~17 days before and ~17 days after
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 17);

  const days = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    // Check if this day is a period day
    const isPeriod = periodLogs.some((p) => {
      const end = p.endDate || p.startDate;
      return dateStr >= p.startDate && dateStr <= end;
    });

    // Check if ovulation logged on this day
    const isOvulation = ovulationLogs.some((o) => o.date === dateStr);

    // Check predicted
    const isPredictedPeriod = nextPeriodDate && dateStr >= nextPeriodDate && dateStr <= addDays(nextPeriodDate, 4);
    const isPredictedOvulation = !isOvulation && nextOvulationDate === dateStr;
    const isFertile = fertileStart && fertileEnd && dateStr >= fertileStart && dateStr <= fertileEnd;

    days.push({
      date: dateStr,
      dayNum: d.getDate(),
      isToday: dateStr === todayStr,
      isPeriod,
      isOvulation,
      isPredictedPeriod: isPredictedPeriod && !isPeriod,
      isPredictedOvulation,
      isFertile: isFertile && !isPeriod && !isOvulation && !isPredictedOvulation,
    });
  }
  return days;
}

// ── Component ──

export default function PeriodSection({ records, onAdd, onDelete }) {
  const [tab, setTab] = useState('overview');
  const [periodForm, setPeriodForm] = useState({ startDate: '', endDate: '', flow: 'Medium', symptoms: '', notes: '' });
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

  const timelineDays = useMemo(
    () => buildTimelineDays(periodLogs, ovulationLogs, nextPeriodDate, nextOvulationDate, fertileStart, fertileEnd),
    [periodLogs, ovulationLogs, nextPeriodDate, nextOvulationDate, fertileStart, fertileEnd]
  );

  // ── Form handlers ──

  function handleSubmitPeriod(e) {
    e.preventDefault();
    if (!periodForm.startDate) return;
    onAdd({
      id: generateId(),
      type: 'period',
      startDate: periodForm.startDate,
      endDate: periodForm.endDate || periodForm.startDate,
      flow: periodForm.flow,
      symptoms: periodForm.symptoms,
      notes: periodForm.notes,
    });
    setPeriodForm({ startDate: '', endDate: '', flow: 'Medium', symptoms: '', notes: '' });
    setTab('overview');
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
    setTab('overview');
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
    setTab('overview');
  }

  // ── Duration helper ──
  function periodDuration(p) {
    return daysBetween(p.startDate, p.endDate || p.startDate) + 1;
  }

  return (
    <div className="period-section">
      <div className="period-header">
        <h3>Period & Ovulation Tracking</h3>
      </div>

      <div className="period-tabs">
        {['overview', 'period', 'ovulation', 'settings'].map((t) => (
          <button
            key={t}
            className={`period-tab${tab === t ? ' active' : ''}`}
            onClick={() => {
              setTab(t);
              if (t === 'settings' && settingsForm === null) {
                setSettingsForm(settings.customCycleLength || 28);
              }
            }}
          >
            {t === 'overview' ? 'Overview' : t === 'period' ? 'Log Period' : t === 'ovulation' ? 'Log Ovulation' : 'Settings'}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div>
          <div className="period-overview">
            <div className="period-stat-card">
              <div className="period-stat-label">Avg Cycle</div>
              <div className="period-stat-value">{avgCycle} days</div>
              {periodLogs.length < 2 && <div className="period-stat-hint">Default (log 2+ periods to calculate)</div>}
            </div>
            <div className="period-stat-card">
              <div className="period-stat-label">Next Period</div>
              <div className="period-stat-value">
                {nextPeriodDate ? formatDate(nextPeriodDate) : 'N/A'}
              </div>
              {nextPeriodDate && (
                <span className="period-prediction-badge">
                  {daysFromNow(nextPeriodDate) >= 0 ? `in ${daysFromNow(nextPeriodDate)} days` : `${Math.abs(daysFromNow(nextPeriodDate))} days ago`}
                </span>
              )}
            </div>
            <div className="period-stat-card">
              <div className="period-stat-label">Next Ovulation</div>
              <div className="period-stat-value">
                {nextOvulationDate ? formatDate(nextOvulationDate) : 'N/A'}
              </div>
              {nextOvulationDate && (
                <span className="period-prediction-badge">
                  {daysFromNow(nextOvulationDate) >= 0 ? `in ${daysFromNow(nextOvulationDate)} days` : `${Math.abs(daysFromNow(nextOvulationDate))} days ago`}
                </span>
              )}
            </div>
            <div className="period-stat-card">
              <div className="period-stat-label">Fertile Window</div>
              <div className="period-stat-value">
                {fertileStart && fertileEnd ? `${formatDate(fertileStart)} - ${formatDate(fertileEnd)}` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Timeline strip */}
          <div className="period-timeline-wrapper">
            <div className="period-timeline">
              {timelineDays.map((day) => (
                <div
                  key={day.date}
                  className={
                    'period-timeline-day' +
                    (day.isPeriod ? ' period' : '') +
                    (day.isOvulation ? ' ovulation' : '') +
                    (day.isPredictedPeriod ? ' predicted-period' : '') +
                    (day.isPredictedOvulation ? ' predicted-ovulation' : '') +
                    (day.isFertile ? ' fertile' : '') +
                    (day.isToday ? ' today' : '')
                  }
                  title={day.date}
                >
                  <span className="period-timeline-num">{day.dayNum}</span>
                </div>
              ))}
            </div>
            <div className="period-timeline-legend">
              <span className="period-legend-item"><span className="period-legend-dot period"></span> Period</span>
              <span className="period-legend-item"><span className="period-legend-dot ovulation"></span> Ovulation</span>
              <span className="period-legend-item"><span className="period-legend-dot fertile"></span> Fertile</span>
              <span className="period-legend-item"><span className="period-legend-dot predicted"></span> Predicted</span>
              <span className="period-legend-item"><span className="period-legend-dot today-dot"></span> Today</span>
            </div>
          </div>

          {/* Recent period logs */}
          {periodLogs.length > 0 && (
            <div className="period-log-section">
              <h4>Recent Period Logs</h4>
              <div className="period-log-list">
                {[...periodLogs].reverse().slice(0, 5).map((p) => (
                  <div key={p.id} className="period-log-item period-border">
                    <div className="period-log-item-info">
                      <strong>{formatDate(p.startDate)}{p.endDate && p.endDate !== p.startDate ? ` - ${formatDate(p.endDate)}` : ''}</strong>
                      <span className="period-log-duration">{periodDuration(p)} day{periodDuration(p) !== 1 ? 's' : ''}</span>
                      <span className={`period-flow-badge flow-${p.flow.toLowerCase()}`}>{p.flow}</span>
                      {p.symptoms && <span className="period-log-symptoms">{p.symptoms}</span>}
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(p.id)}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent ovulation logs */}
          {ovulationLogs.length > 0 && (
            <div className="period-log-section">
              <h4>Recent Ovulation Logs</h4>
              <div className="period-log-list">
                {ovulationLogs.slice(0, 5).map((o) => (
                  <div key={o.id} className="period-log-item ovulation-border">
                    <div className="period-log-item-info">
                      <strong>{formatDate(o.date)}</strong>
                      {o.notes && <span className="period-log-notes">{o.notes}</span>}
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(o.id)}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {periodLogs.length === 0 && ovulationLogs.length === 0 && (
            <p className="period-empty">No period or ovulation data logged yet. Use the tabs above to start tracking.</p>
          )}
        </div>
      )}

      {/* ── Log Period ── */}
      {tab === 'period' && (
        <form className="period-form" onSubmit={handleSubmitPeriod}>
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
          <div className="form-group">
            <label>Symptoms</label>
            <input type="text" placeholder="e.g. cramps, headache..." value={periodForm.symptoms} onChange={(e) => setPeriodForm((f) => ({ ...f, symptoms: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input type="text" placeholder="Optional notes..." value={periodForm.notes} onChange={(e) => setPeriodForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="period-form-actions">
            <button type="submit" className="btn btn-primary">Save Period Log</button>
            <button type="button" className="btn btn-secondary" onClick={() => setTab('overview')}>Cancel</button>
          </div>
        </form>
      )}

      {/* ── Log Ovulation ── */}
      {tab === 'ovulation' && (
        <form className="period-form" onSubmit={handleSubmitOvulation}>
          <div className="form-group">
            <label>Date *</label>
            <input type="date" value={ovulationForm.date} onChange={(e) => setOvulationForm((f) => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input type="text" placeholder="Optional notes..." value={ovulationForm.notes} onChange={(e) => setOvulationForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="period-form-actions">
            <button type="submit" className="btn btn-primary">Save Ovulation Log</button>
            <button type="button" className="btn btn-secondary" onClick={() => setTab('overview')}>Cancel</button>
          </div>
        </form>
      )}

      {/* ── Settings ── */}
      {tab === 'settings' && (
        <form className="period-form period-settings" onSubmit={handleSaveSettings}>
          <div className="form-group">
            <label>Custom Cycle Length (days)</label>
            <input
              type="number"
              min="20"
              max="45"
              value={settingsForm ?? (settings.customCycleLength || 28)}
              onChange={(e) => setSettingsForm(e.target.value)}
            />
            <span className="period-settings-info">
              Current calculated average: <strong>{avgCycle} days</strong>
              {periodLogs.length < 2 ? ' (using default — log 2+ periods for auto calculation)' : ` (based on ${periodLogs.length} period logs)`}
            </span>
          </div>
          <div className="period-form-actions">
            <button type="submit" className="btn btn-primary">Save Settings</button>
            <button type="button" className="btn btn-secondary" onClick={() => setTab('overview')}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
