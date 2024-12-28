import setting_style from './settings.module.css';

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
    <main className={setting_style.container}>
      {/* Content Section: Adjust UI Theme */}
      <div className={setting_style.contentSection}>
        <div className={setting_style.sectionText}>
          <span className={setting_style.sectionHead}>Adjust UI Theme</span>
          <span className={setting_style.sectionSubhead}>Set the UI theme to light or dark</span>
        </div>
        <select
          value={theme}
          onChange={(e) => onThemeChange(e.target.value as 'system' | 'light' | 'dark')}
          className={setting_style.themeSelect}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <hr className={setting_style.divider} />

      {/* Content Section: Clear Data */}
      <div className={setting_style.contentSection}>
        <div className={setting_style.sectionText}>
          <span className={setting_style.sectionHead}>Clear Data</span>
          <span className={setting_style.sectionSubhead}>Remove all history and time-tracking data</span>
        </div>
        <span onClick={onClearData} className={setting_style.deleteText}>Delete</span>
      </div>

      <hr className={setting_style.divider} />

      {/* Special Section: Screeni */}
      <div className={setting_style.specialSection}>
        <div className={setting_style.screeniInfo}>
          <span className={setting_style.sectionHead}>Screeni</span>
          <p className={setting_style.versionText}>Version 5.0.0</p>
        </div>
        <img src="/Screeni-logotype-purple.png" alt="Screeni Logo" className={setting_style.screeniLogo} />
      </div>

      {/* About Screeni Section */}
      <div className={setting_style.aboutSection}>
        <span className={setting_style.sectionHead}>About Screeni</span>
        <p className={setting_style.sectionSubhead}>
          Screeni is a flexible productivity tool that helps with tracking and
          management of time spent on websites. With Screeni, you can view
          your browsing habits from a simple, intuitive interface.
        </p>
      </div>

      {/* Contributors Section */}
      <div className={setting_style.contributorsSection}>
        <span className={setting_style.sectionHead}>Contributors</span>
        <div className={setting_style.contributorsContainer}>
          <div className={setting_style.contributor}>
            <img 
              src="https://avatars.githubusercontent.com/u/93423572?v=4" 
              alt="Satwik Singh" 
              className={setting_style.contributorAvatar}
            />
            <div className={setting_style.contributorInfo}>
              <h3 className={setting_style.contributorName}>Satwik Singh</h3>
              <div className={setting_style.socialLinks}>
                <a href="https://github.com/s000ik" target="_blank" rel="noopener noreferrer">
                  <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" />
                </a>
                <a href="https://linkedin.com/in/singhsatwik/" target="_blank" rel="noopener noreferrer">
                  <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" />
                </a>
              </div>
            </div>
          </div>

          <div className={setting_style.contributor}>
            <img 
              src="https://i.imgur.com/6SnhKop.png" 
              alt="Parth Gupta" 
              className={setting_style.contributorAvatar}
            />
            <div className={setting_style.contributorInfo}>
              <h3 className={setting_style.contributorName}>Parth Gupta</h3>
              <div className={setting_style.socialLinks}>
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

      <p className={setting_style.thankYou}>Thank you for using this extension!</p>
    </main>
  );
};