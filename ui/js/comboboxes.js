  function getComboboxInput(combobox) {
    return combobox.querySelector('[data-uzu-combobox-input], .uzu-combobox-input');
  }

  function getComboboxList(combobox) {
    return combobox.querySelector('[data-uzu-combobox-list], .uzu-combobox-list');
  }

  function getComboboxOptions(combobox) {
    return getScopedControls(combobox, '[data-uzu-combobox-option], .uzu-combobox-option', '[data-uzu-combobox]');
  }

  function getComboboxOptionText(option) {
    return (option.dataset.uzuComboboxText || option.textContent || '').trim();
  }

  function ensureComboboxHiddenInput(combobox) {
    const name = combobox.dataset.uzuComboboxName;
    if (!name) return null;
    let input = combobox.querySelector('input[type="hidden"][data-uzu-combobox-hidden]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.dataset.uzuComboboxHidden = '';
      combobox.append(input);
    }
    input.name = name;
    return input;
  }

  function getVisibleComboboxOptions(combobox) {
    return getEnabledControls(getComboboxOptions(combobox).filter((option) => !option.hidden));
  }

  function openCombobox(combobox) {
    const input = getComboboxInput(combobox);
    const list = getComboboxList(combobox);
    if (!input || !list) return;
    list.hidden = false;
    combobox.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
    combobox.dispatchEvent(new CustomEvent('uzu-combobox-open', {
      bubbles: true,
      detail: { combobox, input, list }
    }));
  }

  function closeCombobox(combobox) {
    const input = getComboboxInput(combobox);
    const list = getComboboxList(combobox);
    if (!input || !list || list.hidden) return;
    combobox.classList.remove('is-open');
    input.setAttribute('aria-expanded', 'false');
    list.hidden = true;
    getComboboxOptions(combobox).forEach((option) => option.classList.remove('is-active'));
    input.removeAttribute('aria-activedescendant');
    combobox.dispatchEvent(new CustomEvent('uzu-combobox-close', {
      bubbles: true,
      detail: { combobox, input, list }
    }));
  }

  function focusComboboxOption(combobox, index) {
    const input = getComboboxInput(combobox);
    const options = getVisibleComboboxOptions(combobox);
    if (!options.length) return null;
    const nextIndex = (index + options.length) % options.length;
    options.forEach((option, optionIndex) => {
      option.classList.toggle('is-active', optionIndex === nextIndex);
    });
    if (input) input.setAttribute('aria-activedescendant', ensureId(options[nextIndex], 'uzu-combobox-option'));
    return options[nextIndex];
  }

  function filterCombobox(combobox) {
    const input = getComboboxInput(combobox);
    const query = (input?.value || '').trim().toLowerCase();
    let visibleCount = 0;
    getComboboxOptions(combobox).forEach((option, index) => {
      ensureId(option, `uzu-combobox-option-${index + 1}`);
      const visible = !query || getComboboxOptionText(option).toLowerCase().includes(query);
      option.hidden = !visible;
      option.classList.remove('is-active');
      if (visible) visibleCount += 1;
    });
    queryAll(combobox, '.uzu-combobox-empty').forEach((empty) => {
      empty.hidden = visibleCount > 0;
    });
    focusComboboxOption(combobox, 0);
    combobox.dispatchEvent(new CustomEvent('uzu-combobox-filter', {
      bubbles: true,
      detail: { value: input?.value || '', combobox, visibleCount }
    }));
  }

  function setComboboxValue(combobox, optionOrValue, emit = true) {
    const input = getComboboxInput(combobox);
    const hidden = ensureComboboxHiddenInput(combobox);
    const options = getComboboxOptions(combobox);
    const option = optionOrValue instanceof Element
      ? optionOrValue
      : options.find((item) => getControlValue(item, 'uzuComboboxValue') === String(optionOrValue));
    if (!input || !option || isControlDisabled(option)) return;
    const value = getControlValue(option, 'uzuComboboxValue');
    const label = getComboboxOptionText(option);
    input.value = label;
    if (hidden) hidden.value = value;
    combobox.dataset.uzuComboboxValue = value;
    options.forEach((item) => {
      const selected = item === option;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    closeCombobox(combobox);
    if (emit) {
      comboboxSelectionInputs.add(input);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      comboboxSelectionInputs.delete(input);
      input.dispatchEvent(new Event('change', { bubbles: true }));
      combobox.dispatchEvent(new CustomEvent('uzu-combobox-change', {
        bubbles: true,
        detail: { value, label, option, combobox, input }
      }));
      combobox.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function initComboboxes(root = document) {
    queryAll(root, '[data-uzu-combobox]').forEach((combobox) => {
      const input = getComboboxInput(combobox);
      const list = getComboboxList(combobox);
      const options = getComboboxOptions(combobox);
      if (!input || !list || !options.length) return;
      const listId = ensureId(list, 'uzu-combobox-list');
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', input.getAttribute('aria-autocomplete') || 'list');
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('aria-controls', listId);
      list.setAttribute('role', list.getAttribute('role') || 'listbox');
      ensureComboboxHiddenInput(combobox);
      options.forEach((option, index) => {
        ensureId(option, `uzu-combobox-option-${index + 1}`);
        option.setAttribute('role', option.getAttribute('role') || 'option');
        option.setAttribute('aria-selected', option.classList.contains('is-selected') ? 'true' : 'false');
      });
      const selected = options.find((option) => option.classList.contains('is-selected') || option.getAttribute('aria-selected') === 'true');
      if (selected) setComboboxValue(combobox, selected, false);
      else if (!input.value) {
        const hidden = ensureComboboxHiddenInput(combobox);
        if (hidden) hidden.value = '';
      }
      list.hidden = true;
      if (!markInitialized(combobox, 'Combobox')) return;
      input.addEventListener('focus', () => {
        filterCombobox(combobox);
        openCombobox(combobox);
      });
      input.addEventListener('input', () => {
        if (comboboxSelectionInputs.has(input)) return;
        filterCombobox(combobox);
        openCombobox(combobox);
      });
      input.addEventListener('keydown', (event) => {
        const visible = getVisibleComboboxOptions(combobox);
        const active = visible.find((option) => option.classList.contains('is-active'));
        const index = Math.max(0, visible.indexOf(active));
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          openCombobox(combobox);
          focusComboboxOption(combobox, index + 1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          openCombobox(combobox);
          focusComboboxOption(combobox, index - 1);
        } else if (event.key === 'Enter' && active) {
          event.preventDefault();
          setComboboxValue(combobox, active);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          closeCombobox(combobox);
        }
      });
      combobox.addEventListener('click', (event) => {
        const option = getScopedEventControl(event, '[data-uzu-combobox-option], .uzu-combobox-option', combobox, '[data-uzu-combobox]');
        if (option) {
          event.preventDefault();
          setComboboxValue(combobox, option);
        } else if (event.target === input) {
          openCombobox(combobox);
        }
      });
    });
  }
