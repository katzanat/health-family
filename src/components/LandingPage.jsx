export default function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">
      <div className="landing-hero">
        <h1 className="landing-title">Health Family</h1>
        <p className="landing-slogan">
          Because the people you love deserve better than scattered notes and forgotten appointments.
        </p>
      </div>

      <div className="landing-features">
        <div className="feature-card">
          <div className="feature-icon">{'\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}'}</div>
          <h3>Family Profiles</h3>
          <p>Create profiles for every family member with their health details and known issues.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">{'\u{1F4CB}'}</div>
          <h3>Health Tracking</h3>
          <p>Log symptoms, treatments, and follow-ups with body location tagging and photos.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">{'\u{1F6E1}\uFE0F'}</div>
          <h3>Preventative Checkups</h3>
          <p>Age and gender-specific checkup reminders so nothing slips through the cracks.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">{'\u{1F504}'}</div>
          <h3>Real-Time Sync</h3>
          <p>Share a family code and keep everyone in sync across devices, instantly.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">{'\u{26A0}\uFE0F'}</div>
          <h3>Allergy & Med Records</h3>
          <p>Track allergies, severity levels, and reactions for each family member.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">{'\u{1F4E4}'}</div>
          <h3>Export for Doctor</h3>
          <p>Generate a printable health summary to bring to any doctor visit.</p>
        </div>
      </div>

      <div className="landing-how-it-works">
        <h2>How It Works</h2>
        <div className="how-it-works-steps">
          <div className="how-step">
            <div className="how-step-number">1</div>
            <h4>Sign In</h4>
            <p>Quick sign-in with your Google account. No extra passwords needed.</p>
          </div>
          <div className="how-step">
            <div className="how-step-number">2</div>
            <h4>Add Your Family</h4>
            <p>Create profiles for each family member with age, gender, and known conditions.</p>
          </div>
          <div className="how-step">
            <div className="how-step-number">3</div>
            <h4>Track & Share</h4>
            <p>Log health events, track checkups, and share access with your family.</p>
          </div>
        </div>
      </div>

      <div className="landing-trust">
        <div className="trust-item">
          <span className="trust-icon">{'\u{1F512}'}</span>
          <span>Encrypted & Secure</span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">{'\u2705'}</span>
          <span>100% Free</span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">{'\u{1F6AB}'}</span>
          <span>No Ads, Ever</span>
        </div>
      </div>

      <div className="landing-cta">
        <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
          Add My Family
        </button>
      </div>
    </div>
  );
}
