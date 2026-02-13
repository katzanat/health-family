import { useState } from 'react';
import { generateFamilyCode, createFamily, familyExists } from '../utils/firebase';

export default function FamilyCodeScreen({ onJoin }) {
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
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
    } catch (err) {
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
      onJoin(code.toUpperCase());
    } catch (err) {
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
            onClick={() => onJoin(generatedCode)}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="family-code-screen">
      <h1 className="code-title">Health Family</h1>
      <p className="code-subtitle">Create a new family or join an existing one.</p>

      {!mode && (
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

      {error && <p className="code-error">{error}</p>}
      {loading && !mode && <p className="code-loading">Creating family...</p>}
    </div>
  );
}
