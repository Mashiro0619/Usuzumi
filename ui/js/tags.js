  function setTagSelected(tag, selected, emit = true) {
    const nextSelected = Boolean(selected);
    const previousSelected = tag.classList.contains('is-selected') || tag.getAttribute('aria-pressed') === 'true';
    tag.classList.toggle('is-selected', nextSelected);
    tag.setAttribute('aria-pressed', nextSelected ? 'true' : 'false');
    if (emit && nextSelected !== previousSelected) {
      tag.dispatchEvent(new CustomEvent('uzu-tag-change', {
        bubbles: true,
        detail: { selected: nextSelected, tag, value: getControlValue(tag, 'uzuTagValue') }
      }));
      tag.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function closeTag(tag, closeButton = null) {
    const event = new CustomEvent('uzu-tag-close', {
      bubbles: true,
      cancelable: true,
      detail: { tag, closeButton, value: getControlValue(tag, 'uzuTagValue') }
    });
    tag.dispatchEvent(event);
    if (!event.defaultPrevented) tag.hidden = true;
  }

  function isSelectableTag(tag) {
    return tag.dataset.uzuTagSelectable === 'true' || tag.hasAttribute('aria-pressed');
  }

  function initTags(root = document) {
    queryAll(root, '[data-uzu-tag]').forEach((tag) => {
      const selectable = isSelectableTag(tag);
      if (selectable) {
        if (!/^(A|BUTTON)$/i.test(tag.tagName)) {
          tag.setAttribute('role', tag.getAttribute('role') || 'button');
          tag.setAttribute('tabindex', tag.getAttribute('tabindex') || '0');
        }
        setTagSelected(tag, tag.classList.contains('is-selected') || tag.getAttribute('aria-pressed') === 'true', false);
      }
      queryAll(tag, '[data-uzu-tag-close], .uzu-tag-close').forEach((button) => {
        button.setAttribute('aria-label', button.getAttribute('aria-label') || 'Remove tag');
      });
      if (!markInitialized(tag, 'Tag')) return;
      tag.addEventListener('click', (event) => {
        const closeButton = getScopedEventControl(event, '[data-uzu-tag-close], .uzu-tag-close', tag, '[data-uzu-tag]');
        if (closeButton) {
          event.preventDefault();
          closeTag(tag, closeButton);
          return;
        }
        if (selectable && !isControlDisabled(tag)) {
          setTagSelected(tag, !(tag.classList.contains('is-selected') || tag.getAttribute('aria-pressed') === 'true'));
        }
      });
      tag.addEventListener('keydown', (event) => {
        if (!selectable || isControlDisabled(tag) || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        setTagSelected(tag, !(tag.classList.contains('is-selected') || tag.getAttribute('aria-pressed') === 'true'));
      });
    });
  }
