  function closeSelect(select) {
    if (select.classList.contains('is-closing') || !select.classList.contains('is-open')) return;
    select.classList.remove('is-open');
    select.classList.add('is-closing');
    queryAll(select, '[data-uzu-select-option]').forEach((option) => {
      option.classList.remove('is-active');
      option.setAttribute('tabindex', '-1');
    });
    const trigger = select.querySelector('[data-uzu-select-trigger]');
    if (trigger) {
      const selected = select.querySelector('[data-uzu-select-option].is-selected');
      trigger.setAttribute('aria-expanded', 'false');
      if (selected && selected.id) {
        trigger.setAttribute('aria-activedescendant', selected.id);
      } else {
        trigger.removeAttribute('aria-activedescendant');
      }
    }
    const menu = select.querySelector('[role="listbox"]');
    const finish = () => {
      select.classList.remove('is-closing');
      selectCloseTimers.delete(select);
    };
    const timer = scheduleAfterAnimation([menu].filter(Boolean), finish);
    if (timer) selectCloseTimers.set(select, timer);
  }

  function ensureId(element, prefix) {
    if (!element.id) {
      selectCounter += 1;
      element.id = `${prefix}-${selectCounter}`;
    }
    return element.id;
  }

  function focusSelectOption(select, index) {
    const options = queryAll(select, '[data-uzu-select-option]');
    const trigger = select.querySelector('[data-uzu-select-trigger]');
    if (!options.length) return;
    const nextIndex = (index + options.length) % options.length;
    options.forEach((option, optionIndex) => {
      const isActive = optionIndex === nextIndex;
      option.classList.toggle('is-active', isActive);
      option.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    if (trigger && options[nextIndex].id) {
      trigger.setAttribute('aria-activedescendant', options[nextIndex].id);
    }
    options[nextIndex].focus();
  }

  function openSelect(select, focusIndex) {
    const trigger = select.querySelector('[data-uzu-select-trigger]');
    const options = queryAll(select, '[data-uzu-select-option]');
    const existingTimer = selectCloseTimers.get(select);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
      selectCloseTimers.delete(select);
    }
    select.classList.remove('is-closing');
    select.classList.add('is-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    const selectedIndex = options.findIndex((option) => option.classList.contains('is-selected'));
    focusSelectOption(select, focusIndex ?? (selectedIndex >= 0 ? selectedIndex : 0));
  }

  function getSelectOptionLabelNodes(option) {
    const nodes = [...option.childNodes].filter((node) => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim();
      return node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-lang');
    });
    return nodes.length ? nodes : [document.createTextNode(option.textContent.trim())];
  }

  function syncSelectTriggerLabel(trigger, option) {
    const labelRoot = trigger.querySelector('[data-uzu-select-label]') || trigger;
    labelRoot.replaceChildren(...getSelectOptionLabelNodes(option).map((node) => node.cloneNode(true)));
  }

  function getSelectOptionValue(option) {
    return option.dataset.uzuSelectValue ?? option.dataset.value ?? option.textContent.trim();
  }

  function getSelectOptionLabel(option) {
    return option.textContent.trim();
  }

  function getSelectInput(select) {
    let input = select.querySelector('input[type="hidden"][data-uzu-select-input]');
    const name = select.dataset.uzuSelectName || select.getAttribute('name') || input?.name || '';
    if (!input && name) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.setAttribute('data-uzu-select-input', '');
      select.append(input);
    }
    if (input && name) input.name = name;
    return input;
  }

  function syncSelectValue(select, option) {
    const value = getSelectOptionValue(option);
    const trigger = select.querySelector('[data-uzu-select-trigger]');
    const input = getSelectInput(select);
    select.dataset.uzuSelectValue = value;
    if (trigger) trigger.dataset.uzuSelectValue = value;
    if (input) input.value = value;
    return value;
  }

  function emitSelectChange(select, option, value) {
    select.dispatchEvent(new CustomEvent('uzu-select-change', {
      bubbles: true,
      detail: {
        value,
        label: getSelectOptionLabel(option),
        option,
        select
      }
    }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function chooseSelectOption(select, option) {
    const trigger = select.querySelector('[data-uzu-select-trigger]');
    const options = queryAll(select, '[data-uzu-select-option]');
    const previousValue = select.dataset.uzuSelectValue || getSelectInput(select)?.value || '';
    options.forEach((item) => {
      item.classList.remove('is-selected');
      item.setAttribute('aria-selected', 'false');
    });
    option.classList.add('is-selected');
    option.setAttribute('aria-selected', 'true');
    const value = syncSelectValue(select, option);
    if (trigger) {
      syncSelectTriggerLabel(trigger, option);
      closeSelect(select);
      trigger.focus();
    }
    if (value !== previousValue) emitSelectChange(select, option, value);
  }

  function initSelects(root = document) {
    queryAll(root, '[data-uzu-select]').forEach((select) => {
      const trigger = select.querySelector('[data-uzu-select-trigger]');
      const options = queryAll(select, '[data-uzu-select-option]');
      const menu = select.querySelector('[role="listbox"]');
      if (!trigger || !options.length) return;

      const selectId = ensureId(select, 'uzu-select');
      const menuId = menu ? ensureId(menu, `${selectId}-menu`) : '';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      if (menuId) trigger.setAttribute('aria-controls', menuId);
      options.forEach((option, index) => {
        ensureId(option, `${selectId}-option-${index + 1}`);
        option.setAttribute('tabindex', '-1');
        option.setAttribute('aria-selected', option.classList.contains('is-selected') ? 'true' : 'false');
      });
      const selected = options.find((option) => option.classList.contains('is-selected'));
      if (selected) {
        trigger.setAttribute('aria-activedescendant', selected.id);
        syncSelectValue(select, selected);
      }

      if (!markInitialized(select, 'Select')) return;

      trigger.addEventListener('click', () => {
        if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
        if (select.classList.contains('is-open')) {
          closeSelect(select);
        } else {
          const selectedIndex = options.findIndex((option) => option.classList.contains('is-selected'));
          openSelect(select, selectedIndex >= 0 ? selectedIndex : 0);
        }
      });

      trigger.addEventListener('keydown', (event) => {
        if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
          event.preventDefault();
          const selectedIndex = options.findIndex((option) => option.classList.contains('is-selected'));
          const startIndex = event.key === 'ArrowUp' ? (selectedIndex >= 0 ? selectedIndex - 1 : options.length - 1) : (selectedIndex >= 0 ? selectedIndex : 0);
          openSelect(select, startIndex);
        }
      });

      options.forEach((option) => {
        option.addEventListener('mouseenter', () => {
          focusSelectOption(select, options.indexOf(option));
        });

        option.addEventListener('click', () => {
          chooseSelectOption(select, option);
        });

        option.addEventListener('keydown', (event) => {
          const currentIndex = options.indexOf(option);
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusSelectOption(select, currentIndex + 1);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            focusSelectOption(select, currentIndex - 1);
          } else if (event.key === 'Home') {
            event.preventDefault();
            focusSelectOption(select, 0);
          } else if (event.key === 'End') {
            event.preventDefault();
            focusSelectOption(select, options.length - 1);
          } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            chooseSelectOption(select, option);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            closeSelect(select);
            trigger.focus();
          }
        });
      });

      select.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeSelect(select);
          trigger.focus();
        }
      });
    });
  }
