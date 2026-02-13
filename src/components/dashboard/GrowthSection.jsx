import { useState } from 'react';

function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
}

function bmiCategory(bmi) {
  if (!bmi) return '';
  const val = parseFloat(bmi);
  if (val < 18.5) return 'Underweight';
  if (val < 25) return 'Normal';
  if (val < 30) return 'Overweight';
  return 'Obese';
}

const BMI_CATEGORY_COLORS = {
  Underweight: { bg: 'var(--warning-light)', color: '#856404' },
  Normal: { bg: 'var(--success-light)', color: 'var(--success)' },
  Overweight: { bg: 'var(--warning-light)', color: '#856404' },
  Obese: { bg: 'var(--danger-light)', color: 'var(--danger)' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString();
}

export default function GrowthSection({ records, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('metric');

  const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

  function handleSubmit(e) {
    e.preventDefault();
    if (!height && !weight) return;

    let heightCm = parseFloat(height) || 0;
    let weightKg = parseFloat(weight) || 0;

    if (unit === 'imperial') {
      heightCm = heightCm * 2.54; // inches to cm
      weightKg = weightKg * 0.453592; // lbs to kg
    }

    onAdd({
      id: Date.now().toString(),
      date,
      height: heightCm,
      weight: weightKg,
      unit,
    });
    setHeight('');
    setWeight('');
    setShowForm(false);
  }

  function displayHeight(record) {
    if (!record.height) return '-';
    if (record.unit === 'imperial') {
      const inches = record.height / 2.54;
      const ft = Math.floor(inches / 12);
      const remainIn = Math.round(inches % 12);
      return `${ft}'${remainIn}"`;
    }
    return `${record.height.toFixed(1)} cm`;
  }

  function displayWeight(record) {
    if (!record.weight) return '-';
    if (record.unit === 'imperial') {
      return `${(record.weight / 0.453592).toFixed(1)} lbs`;
    }
    return `${record.weight.toFixed(1)} kg`;
  }

  return (
    <div className="growth-section">
      <div className="growth-header">
        <h3>Growth Tracking</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Measurement'}
        </button>
      </div>

      {showForm && (
        <form className="growth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="metric">Metric (cm/kg)</option>
                <option value="imperial">Imperial (in/lbs)</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Height ({unit === 'metric' ? 'cm' : 'inches'})</label>
              <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={unit === 'metric' ? 'e.g. 120' : 'e.g. 47'} />
            </div>
            <div className="form-group">
              <label>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={unit === 'metric' ? 'e.g. 25' : 'e.g. 55'} />
            </div>
          </div>
          <button type="submit" className="btn btn-success btn-sm">Save Measurement</button>
        </form>
      )}

      {sorted.length === 0 && !showForm && (
        <p className="growth-empty">No growth records yet.</p>
      )}

      {sorted.length > 0 && (
        <div className="growth-table-wrapper">
          <table className="growth-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Height</th>
                <th>Weight</th>
                <th>BMI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, idx) => (
                <tr key={r.id} className={idx === 0 ? 'growth-latest' : ''}>
                  <td>{formatDate(r.date)}</td>
                  <td>{displayHeight(r)}</td>
                  <td>{displayWeight(r)}</td>
                  <td>
                    {calculateBMI(r.height, r.weight)
                      ? <>{calculateBMI(r.height, r.weight)} <span className="bmi-category-badge" style={{ background: BMI_CATEGORY_COLORS[bmiCategory(calculateBMI(r.height, r.weight))]?.bg, color: BMI_CATEGORY_COLORS[bmiCategory(calculateBMI(r.height, r.weight))]?.color }}>{bmiCategory(calculateBMI(r.height, r.weight))}</span></>
                      : '-'}
                  </td>
                  <td>
                    <button className="btn-dismiss" title="Delete record" onClick={() => onDelete(r.id)}>&times;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
