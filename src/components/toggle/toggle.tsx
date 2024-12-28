import React from 'react';
import toggle_style from './toggle.module.css';

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ isOn, onToggle }) => {
  return (
    <div 
      className={`${toggle_style.toggle} ${isOn ? toggle_style.toggleOn : toggle_style.toggleOff}`} 
      onClick={onToggle}
    >
      <div className={toggle_style.toggleCircle} />
    </div>
  );
};

export default Toggle;