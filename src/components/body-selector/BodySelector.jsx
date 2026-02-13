import { useState } from 'react';
import './BodySelector.css';

const BODY_REGIONS = [
  'Head', 'Neck', 'Chest', 'Stomach', 'Back',
  'Left Arm', 'Right Arm', 'Left Hand', 'Right Hand',
  'Left Leg', 'Right Leg', 'Left Foot', 'Right Foot',
];

export default function BodySelector({ value, onChange }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  function handleRegionClick(region) {
    onChange(region);
  }

  function regionClass(region) {
    let cls = 'body-region';
    if (value === region) cls += ' selected';
    if (hoveredRegion === region) cls += ' hovered';
    return cls;
  }

  return (
    <div className="body-selector">
      <div className="body-diagram">
        <svg viewBox="0 0 200 420" xmlns="http://www.w3.org/2000/svg">
          {/* Head */}
          <ellipse
            cx="100" cy="35" rx="25" ry="30"
            className={regionClass('Head')}
            onClick={() => handleRegionClick('Head')}
            onMouseEnter={() => setHoveredRegion('Head')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Neck */}
          <rect
            x="90" y="63" width="20" height="18"
            className={regionClass('Neck')}
            onClick={() => handleRegionClick('Neck')}
            onMouseEnter={() => setHoveredRegion('Neck')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Chest */}
          <rect
            x="65" y="80" width="70" height="55" rx="8"
            className={regionClass('Chest')}
            onClick={() => handleRegionClick('Chest')}
            onMouseEnter={() => setHoveredRegion('Chest')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Stomach */}
          <rect
            x="70" y="135" width="60" height="50" rx="6"
            className={regionClass('Stomach')}
            onClick={() => handleRegionClick('Stomach')}
            onMouseEnter={() => setHoveredRegion('Stomach')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Left Arm */}
          <rect
            x="30" y="85" width="30" height="80" rx="12"
            className={regionClass('Left Arm')}
            onClick={() => handleRegionClick('Left Arm')}
            onMouseEnter={() => setHoveredRegion('Left Arm')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Right Arm */}
          <rect
            x="140" y="85" width="30" height="80" rx="12"
            className={regionClass('Right Arm')}
            onClick={() => handleRegionClick('Right Arm')}
            onMouseEnter={() => setHoveredRegion('Right Arm')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Left Hand */}
          <ellipse
            cx="45" cy="180" rx="14" ry="16"
            className={regionClass('Left Hand')}
            onClick={() => handleRegionClick('Left Hand')}
            onMouseEnter={() => setHoveredRegion('Left Hand')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Right Hand */}
          <ellipse
            cx="155" cy="180" rx="14" ry="16"
            className={regionClass('Right Hand')}
            onClick={() => handleRegionClick('Right Hand')}
            onMouseEnter={() => setHoveredRegion('Right Hand')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Left Leg */}
          <rect
            x="68" y="190" width="28" height="110" rx="12"
            className={regionClass('Left Leg')}
            onClick={() => handleRegionClick('Left Leg')}
            onMouseEnter={() => setHoveredRegion('Left Leg')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Right Leg */}
          <rect
            x="104" y="190" width="28" height="110" rx="12"
            className={regionClass('Right Leg')}
            onClick={() => handleRegionClick('Right Leg')}
            onMouseEnter={() => setHoveredRegion('Right Leg')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Left Foot */}
          <ellipse
            cx="82" cy="315" rx="16" ry="12"
            className={regionClass('Left Foot')}
            onClick={() => handleRegionClick('Left Foot')}
            onMouseEnter={() => setHoveredRegion('Left Foot')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Right Foot */}
          <ellipse
            cx="118" cy="315" rx="16" ry="12"
            className={regionClass('Right Foot')}
            onClick={() => handleRegionClick('Right Foot')}
            onMouseEnter={() => setHoveredRegion('Right Foot')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
        </svg>
        {hoveredRegion && <div className="body-tooltip">{hoveredRegion}</div>}
      </div>
      <div className="body-dropdown">
        <label>Or select from list:</label>
        <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select body location</option>
          {BODY_REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      {value && <div className="body-selected">Selected: <strong>{value}</strong></div>}
    </div>
  );
}
