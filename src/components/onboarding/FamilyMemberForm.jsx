import { useState } from 'react';

const ROLES = ['Mom', 'Dad', 'Brother', 'Sister', 'Grandparent', 'Other'];
const GENDERS = ['Male', 'Female', 'Other'];

const emptyForm = {
  name: '',
  age: '',
  gender: '',
  role: '',
  knownIssues: '',
  avatar: null,
};

function resizeImage(dataUrl, maxSize, quality, callback) {
  const img = new Image();
  img.onload = () => {
    let { width, height } = img;
    if (width > maxSize || height > maxSize) {
      if (width > height) { height = Math.round((height * maxSize) / width); width = maxSize; }
      else { width = Math.round((width * maxSize) / height); height = maxSize; }
    }
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
    callback(canvas.toDataURL('image/jpeg', quality));
  };
  img.src = dataUrl;
}

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
      avatar: form.avatar || null,
    });
    setForm(emptyForm);
    setErrors({});
  }

  function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      resizeImage(reader.result, 400, 0.85, (resized) => {
        handleChange('avatar', resized);
      });
    };
    reader.readAsDataURL(file);
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
      <div className="form-group">
        <label>Profile Photo (optional)</label>
        <div className="avatar-upload-row">
          {form.avatar
            ? <img src={form.avatar} alt="Preview" className="avatar-preview" />
            : <div className="avatar-placeholder">{form.name ? form.name[0].toUpperCase() : '?'}</div>
          }
          <div>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} />
            {form.avatar && (
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleChange('avatar', null)}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <button type="submit" className="btn btn-primary">Add Member</button>
    </form>
  );
}
