  function getCommandItems(command) {
    return getScopedControls(command, '.uzu-command-item', '[data-uzu-command]');
  }

  function getCommandInput(command) {
    return command.querySelector('.uzu-command-input, [data-uzu-command-input]');
  }

  function getCommandList(command) {
    return command.querySelector('.uzu-command-list, [data-uzu-command-list]');
  }

  function getCommandItemText(item) {
    return (item.dataset.uzuCommandText || item.textContent || '').trim().toLowerCase();
  }

  function getVisibleCommandItems(command) {
    return getEnabledControls(getCommandItems(command).filter((item) => !item.hidden));
  }

  function focusCommandItem(command, index, focus = true) {
    const items = getVisibleCommandItems(command);
    if (!items.length) return null;
    const nextIndex = (index + items.length) % items.length;
    items.forEach((item, itemIndex) => {
      item.classList.toggle('is-active', itemIndex === nextIndex);
      item.setAttribute('tabindex', itemIndex === nextIndex ? '0' : '-1');
    });
    const input = getCommandInput(command);
    if (input && items[nextIndex].id) input.setAttribute('aria-activedescendant', items[nextIndex].id);
    if (focus) items[nextIndex].focus();
    return items[nextIndex];
  }

  function filterCommand(command, focus = false) {
    const input = getCommandInput(command);
    const list = getCommandList(command);
    const query = (input?.value || '').trim().toLowerCase();
    let visibleCount = 0;
    getCommandItems(command).forEach((item, index) => {
      ensureId(item, `uzu-command-item-${index + 1}`);
      const visible = !query || getCommandItemText(item).includes(query);
      item.hidden = !visible;
      item.setAttribute('tabindex', '-1');
      item.classList.remove('is-active');
      if (visible) visibleCount += 1;
    });
    queryAll(command, '.uzu-command-empty').forEach((empty) => {
      empty.hidden = visibleCount > 0;
    });
    if (list) list.setAttribute('aria-busy', 'false');
    if (visibleCount) {
      const items = getVisibleCommandItems(command);
      items[0].classList.add('is-active');
      items[0].setAttribute('tabindex', '0');
      if (input && items[0].id) input.setAttribute('aria-activedescendant', items[0].id);
      if (focus) items[0].focus();
    } else if (input) {
      input.removeAttribute('aria-activedescendant');
    }
    command.dispatchEvent(new CustomEvent('uzu-command-filter', {
      bubbles: true,
      detail: { value: input?.value || '', command, visibleCount }
    }));
  }

  function initCommands(root = document) {
    queryAll(root, '[data-uzu-command]').forEach((command) => {
      const input = getCommandInput(command);
      const list = getCommandList(command);
      const items = getCommandItems(command);
      if (!input || !list || !items.length) return;
      list.setAttribute('role', list.getAttribute('role') || 'listbox');
      input.setAttribute('role', input.getAttribute('role') || 'combobox');
      input.setAttribute('aria-expanded', 'true');
      input.setAttribute('aria-controls', ensureId(list, 'uzu-command-list'));
      items.forEach((item, index) => {
        ensureId(item, `uzu-command-item-${index + 1}`);
        item.setAttribute('role', item.getAttribute('role') || 'option');
        item.setAttribute('tabindex', '-1');
      });
      filterCommand(command);
      if (!markInitialized(command, 'Command')) return;
      input.addEventListener('input', () => filterCommand(command));
      input.addEventListener('keydown', (event) => {
        const visible = getVisibleCommandItems(command);
        const active = visible.find((item) => item.classList.contains('is-active')) || visible[0];
        const index = Math.max(0, visible.indexOf(active));
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          focusCommandItem(command, index + 1, false);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          focusCommandItem(command, index - 1, false);
        } else if (event.key === 'Enter' && active) {
          event.preventDefault();
          active.click();
        }
      });
      command.addEventListener('click', (event) => {
        const item = getScopedEventControl(event, '.uzu-command-item', command, '[data-uzu-command]');
        if (!item || isControlDisabled(item)) return;
        command.dispatchEvent(new CustomEvent('uzu-command-select', {
          bubbles: true,
          detail: { value: getControlValue(item, 'uzuCommandValue'), item, command }
        }));
      });
    });
  }
