export const SettingsToggle = ({ checked, onChange, disabled = false, label, hint }) => (
  <div className="config-settings-toggle-row">
    <div>
      {label && <div className="config-settings-toggle-label">{label}</div>}
      {hint && <div className="config-settings-toggle-hint">{hint}</div>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`config-settings-toggle ${checked ? 'config-settings-toggle--on' : 'config-settings-toggle--off'}`}
    >
      <span className="config-settings-toggle-knob" />
    </button>
  </div>
);
