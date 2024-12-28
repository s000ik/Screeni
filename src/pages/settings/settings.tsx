import './settings.css';

interface SettingsProps {
  theme: 'system' | 'light' | 'dark';
  onThemeChange: (theme: 'system' | 'light' | 'dark') => void;
  onClearData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  theme,
  onThemeChange,
  onClearData,
}) => {
  return (
    <div className="settings-container">
      {/* Content Section: Adjust UI Theme */}
      <div className="content-section">
        <div className="section-text">
          <h2 className="section-head">Adjust UI Theme</h2>
          <p className="section-subhead">Set the UI theme to light or dark</p>
        </div>
        <select
          value={theme}
          onChange={(e) => onThemeChange(e.target.value as 'system' | 'light' | 'dark')}
          className="theme-select"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="divider" />

      {/* Content Section: Clear Data */}
      <div className="content-section">
        <div className="section-text">
          <h2 className="section-head">Clear Data</h2>
          <p className="section-subhead">Remove all history and time-tracking data</p>
        </div>
        <span onClick={onClearData} className="delete-text">Delete</span>
      </div>

      <div className="divider" />

      {/* Special Section: Screeni */}
      <div className="special-section">
        <div className="screeni-info">
          <h2 className="section-head">Screeni</h2>
          <p className="version-text">Version 5.0.0</p>
        </div>
        <img src="/Screeni-logotype-purple.png" alt="Screeni Logo" className="screeni-logo" />
      </div>

      {/* About Screeni Section */}
      <div className="about-section">
        <h2 className="section-head">About Screeni</h2>
        <p className="section-subhead">
          Screeni is a flexible productivity tool that helps with tracking and
          management of time spent on websites. With Screeni, you can view
          your browsing habits from a simple, intuitive interface.
        </p>
      </div>

      {/* Contributors Section */}
      <div className="contributors-section">
        <h2 className="section-head">Contributors</h2>
        <div className="contributors-container">
          <div className="contributor">
            <img 
              src="https://avatars.githubusercontent.com/u/93423572?v=4" 
              alt="Satwik Singh" 
              className="contributor-avatar"
            />
            <div className="contributor-info">
              <h3 className="contributor-name">Satwik Singh</h3>
              <div className="social-links">
                <a href="https://github.com/s000ik" target="_blank" rel="noopener noreferrer">
                  <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" />
                </a>
                <a href="https://linkedin.com/in/singhsatwik/" target="_blank" rel="noopener noreferrer">
                  <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" />
                </a>
              </div>
            </div>
          </div>

          <div className="contributor">
            <img 
              src="https://i.imgur.com/6SnhKop.png" 
              alt="Parth Gupta" 
              className="contributor-avatar"
            />
            <div className="contributor-info">
              <h3 className="contributor-name">Parth Gupta</h3>
              <div className="social-links">
                <a href="https://github.com/P4R1H" target="_blank" rel="noopener noreferrer">
                  <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" />
                </a>
                <a href="https://www.linkedin.com/in/p4r1h/" target="_blank" rel="noopener noreferrer">
                  <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="thank-you">Thank you for using this extension!</p>
    </div>
  );
};