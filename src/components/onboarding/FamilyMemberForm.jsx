import { useState } from 'react';

const ROLES = ['Mom', 'Dad', 'Brother', 'Sister', 'Grandparent', 'Other'];
const GENDERS = ['Male', 'Female', 'Other'];

const emptyForm = {
  name: '',
  age: '',
  gender: '',
  role: '',
  knownIssues: '',
};

export default function FamilyMemberForm({ onAdd }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.age || form.age < 0 || form.age > 120) errs.age = 'Valid age is required';
    if (!form.gender) errs.gender = 'Gender is required';
    if (!form.role) errs.role = 'Role is required';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onAdd({
      id: Date.now().toString(),
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      role: form.role,
      knownIssues: form.knownIssues.trim(),
    });
    setForm(emptyForm);
    setErrors({});
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  return (
    <form className="member-form" onSubmit={handleSubmit}>
      <h3>Add Family Member</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Full name"
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            value={form.age}
            onChange={(e) => handleChange('age', e.target.value)}
            placeholder="Age"
            min="0"
            max="120"
          />
          {errors.age && <span className="error">{errors.age}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Gender</label>
          <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}>
            <option value="">Select gender</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {errors.gender && <span className="error">{errors.gender}</span>}
        </div>
        <div className="form-group">
          <label>Role</label>
          <select value={form.role} onChange={(e) => handleChange('role', e.target.value)}>
            <option value="">Select role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.role && <span className="error">{errors.role}</span>}
        </div>
      </div>
      <div className="form-group">
        <label>Known Health Issues (optional)</label>
        <textarea
          value={form.knownIssues}
          onChange={(e) => handleChange('knownIssues', e.target.value)}
          placeholder="e.g., asthma, diabetes..."
          rows={2}
        />
      </div>
      <button type="submit" className="btn btn-primary">Add Member</button>
    </form>
  );
}
