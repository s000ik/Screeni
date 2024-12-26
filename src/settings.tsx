import './index.css';

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
    <div className="settings-wrapper">
      <div className="scrollable-content">
        <div className="main-content">
          <div className="setting-item">
            <div className="setting-text">
              <h2>Adjust UI Theme</h2>
              <p>Set the UI theme to light or dark</p>
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

          <div className="setting-item">
            <div className="setting-text">
              <h2>Clear Data</h2>
              <p>Remove all history and time-tracking data</p>
            </div>
            <button onClick={onClearData} className="delete-button">
              Delete
            </button>
          </div>

          <div className="divider" />

          <div className="setting-item">
            <div className="setting-text">
              <h2>Screeni</h2>
              <p>Version 5.0.0</p>
            </div>
            <img src="/screeni-purple.png" alt="Screeni Logo" className="screeni-logo" />
          </div>

          <div className="about-section">
            <div className="setting-text">
              <h2>About Screeni</h2>
              <p>
                Screeni is a flexible productivity tool that helps with tracking and
                management of time spent on websites. With Screeni, you can view
                your browsing habits from a simple, intuitive interface.
              </p>
            </div>
          </div>

          <div className="contributors-section">
            <h2>Contributors</h2>
            <div className="contributors-container">
              <div className="contributor">
                <div className="contributor-info">
                  <img 
                    src="https://avatars.githubusercontent.com/u/93423572?v=4" 
                    alt="Satwik Singh" 
                    className="contributor-avatar"
                  />
                  <div className="contributor-details">
                    <h3>Satwik Singh</h3>
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
              </div>

              <div className="contributor">
                <div className="contributor-info">
                  <img 
                    src="https://avatars.githubusercontent.com/u/76397616?v=4" 
                    alt="Parth Gupta" 
                    className="contributor-avatar"
                  />
                  <div className="contributor-details">
                    <h3>Parth Gupta</h3>
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
          </div>

          <p className="thank-you">Thank you for using this extension!</p>
        </div>
      </div>
    </div>
  );
};