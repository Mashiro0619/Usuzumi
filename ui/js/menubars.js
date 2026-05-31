  function initMenubars(root = document) {
    queryAll(root, '[data-uzu-menubar]').forEach((menubar) => {
      const items = getScopedControls(menubar, '.uzu-menubar-item', '[data-uzu-menubar]');
      if (!items.length) return;
      menubar.setAttribute('role', menubar.getAttribute('role') || 'menubar');
      items.forEach((item, index) => {
        item.setAttribute('role', item.getAttribute('role') || 'menuitem');
        item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      });
      if (!markInitialized(menubar, 'Menubar')) return;
      menubar.addEventListener('click', (event) => {
        const item = getScopedEventControl(event, '.uzu-menubar-item', menubar, '[data-uzu-menubar]');
        if (!item || isControlDisabled(item)) return;
        items.forEach((control) => {
          const active = control === item;
          control.classList.toggle('is-active', active);
          control.setAttribute('tabindex', active ? '0' : '-1');
        });
        menubar.dispatchEvent(new CustomEvent('uzu-menubar-change', {
          bubbles: true,
          detail: { value: getControlValue(item, 'uzuMenubarValue'), item, menubar, index: items.indexOf(item) }
        }));
      });
      menubar.addEventListener('keydown', (event) => {
        const item = getScopedEventControl(event, '.uzu-menubar-item', menubar, '[data-uzu-menubar]');
        if (!item || isControlDisabled(item)) return;
        let next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = moveActiveControl(items, item, 1);
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = moveActiveControl(items, item, -1);
        else if (event.key === 'Home') next = getEnabledControls(items)[0];
        else if (event.key === 'End') next = getEnabledControls(items).at(-1);
        if (next) {
          event.preventDefault();
          items.forEach((control) => control.setAttribute('tabindex', control === next ? '0' : '-1'));
          next.focus();
        }
      });
    });
  }
