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
      <main className="content settings">
        <div className="scrollable-content">
        <div className="settings-section">
          <div className="settings-header">
            <h2>Adjust UI Theme</h2>
            <p>Set the UI theme to system, light or dark</p>
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
        
        <div className="settings-section">
          <div className="settings-header">
            <h2>Clear Data</h2>
            <p>Remove all history and time-tracking data</p>
          </div>
          <button onClick={onClearData} className="delete-button">
            Delete
          </button>
        </div>
        
        <div className="settings-section">
          <div className="settings-header">
            <h2>Screeni</h2>
            <p>Version 5.0.0</p>
          </div>
        </div>
        
        <div className="settings-section">
          <div className="settings-header">
            <h2>About Screeni</h2>
            <p>
              Screeni is a flexible productivity tool that helps with tracking and
              management of time spent on websites. With Screeni, you can view
              your browsing habits from a simple, intuitive interface.
            </p>
          </div>
        </div>
        
        <div className="settings-section">
          <div className="settings-header">
            <h2>Contributors</h2>
          </div>
          <div className="contributors">
            <div className="contributor">
              <div className="contributor-avatar pink"></div>
              <div className="contributor-info">
                <h3>Satwik Singh</h3>
                <div className="contributor-links">
                  <a href="https://github.com/username" target="_blank" rel="noopener noreferrer">
                    <img src="/github-icon.png" alt="GitHub" />
                  </a>
                  <a href="https://linkedin.com/in/username" target="_blank" rel="noopener noreferrer">
                    <img src="/linkedin-icon.png" alt="LinkedIn" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="contributor">
              <div className="contributor-avatar peach"></div>
              <div className="contributor-info">
                <h3>Parth Gupta</h3>
                <div className="contributor-links">
                  <a href="https://github.com/username" target="_blank" rel="noopener noreferrer">
                    <img src="/github-icon.png" alt="GitHub" />
                  </a>
                  <a href="https://linkedin.com/in/username" target="_blank" rel="noopener noreferrer">
                    <img src="/linkedin-icon.png" alt="LinkedIn" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="thank-you">Thank you for using this extension</p>
        </div>
      </main>
    );
  };