  function setSwitchState(control, checked, emit = true) {
    control.classList.toggle('is-on', checked);
    control.setAttribute('role', 'switch');
    control.setAttribute('aria-checked', checked ? 'true' : 'false');
    if (!control.hasAttribute('tabindex') && control.tagName !== 'BUTTON') {
      control.setAttribute('tabindex', '0');
    }
    if (emit) {
      control.dispatchEvent(new CustomEvent('uzu-switch-change', {
        bubbles: true,
        detail: { checked, switch: control }
      }));
      control.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function toggleSwitch(control) {
    if (control.getAttribute('aria-disabled') === 'true' || control.classList.contains('is-disabled') || control.disabled) return;
    setSwitchState(control, control.getAttribute('aria-checked') !== 'true');
  }
