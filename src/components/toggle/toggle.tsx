import React from 'react';
import './toggle.css';

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ isOn, onToggle }) => {
  return (
    <div className={`toggle ${isOn ? 'toggle-on' : 'toggle-off'}`} onClick={onToggle}>
      <div className="toggle-circle" />
    </div>
  );
};

export default Toggle;
