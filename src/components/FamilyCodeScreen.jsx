import { useState } from 'react';
import { generateFamilyCode, createFamily, familyExists } from '../utils/firebase';

export default function FamilyCodeScreen({ onJoin }) {
  const [mode, setMode] = useState(null); // null | 'create' | 'join' | 'forgot'
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
      const newCode = generateFamilyCode();
      await createFamily(newCode);
      setGeneratedCode(newCode);
      setMode('created');
    } catch {
      setError('Failed to create family. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (code.length !== 6) {
      setError('Please enter a 6-character family code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const exists = await familyExists(code.toUpperCase());
      if (!exists) {
        setError('Family not found. Check the code and try again.');
        setLoading(false);
        return;
      }
      onJoin(code.toUpperCase(), false);
    } catch {
      setError('Failed to join family. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'created') {
    return (
      <div className="family-code-screen">
        <div className="code-card">
          <h2>Your Family Code</h2>
          <p className="code-instruction">
            Share this code with your partner so they can join your family.
          </p>
          <div className="code-display">{generatedCode}</div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => onJoin(generatedCode, true)}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="family-code-screen">
      <h1 className="code-title">SymptomNest</h1>
      <p className="code-subtitle">Create a new family or join an existing one.</p>

      {!mode && (
        <>
          <div className="code-options">
            <div className="code-option-card" onClick={handleCreate}>
              <div className="code-option-icon">{'\u{2795}'}</div>
              <h3>Create Family</h3>
              <p>Start a new family and get a code to share.</p>
            </div>
            <div className="code-option-card" onClick={() => setMode('join')}>
              <div className="code-option-icon">{'\u{1F517}'}</div>
              <h3>Join Family</h3>
              <p>Enter a code from your partner to join their family.</p>
            </div>
          </div>
          <button className="btn-link code-forgot-link" onClick={() => setMode('forgot')}>
            Forgot my family code
          </button>
        </>
      )}

      {mode === 'join' && (
        <div className="code-card">
          <h2>Join a Family</h2>
          <p className="code-instruction">Enter the 6-character code shared by your partner.</p>
          <input
            type="text"
            className="code-input"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().slice(0, 6));
              setError('');
            }}
            placeholder="ABC123"
            maxLength={6}
            autoFocus
          />
          <div className="code-actions">
            <button
              className="btn btn-secondary"
              onClick={() => { setMode(null); setError(''); setCode(''); }}
            >
              Back
            </button>
            <button
              className="btn btn-primary"
              onClick={handleJoin}
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Joining...' : 'Join Family'}
            </button>
          </div>
        </div>
      )}

      {mode === 'forgot' && (
        <div className="code-card">
          <h2>Retrieve Your Family Code</h2>
          <div className="forgot-code-help">
            <p>Your 6-character family code is the key to your shared family data. Here&apos;s how to find it:</p>
            <ul className="forgot-code-list">
              <li>📱 <strong>Check another device</strong> where you&apos;re already logged in — tap the ☰ menu and your code is shown there.</li>
              <li>👨‍👩‍👧 <strong>Ask a family member</strong> who is already in the family — they can share the code from their ☰ menu.</li>
              <li>📧 <strong>Check your email</strong> if you used the &ldquo;send code to email&rdquo; feature when setting up the family.</li>
            </ul>
            <p className="forgot-code-note">
              If none of these options work, you can create a new family and re-enter your family members.
            </p>
          </div>
          <div className="code-actions">
            <button className="btn btn-secondary" onClick={() => setMode(null)}>Back</button>
            <button className="btn btn-primary" onClick={() => setMode('join')}>I have my code</button>
          </div>
        </div>
      )}

      {error && <p className="code-error">{error}</p>}
      {loading && !mode && <p className="code-loading">Creating family...</p>}
    </div>
  );
}
