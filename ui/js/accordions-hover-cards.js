  function initAccordions(root = document) {
    queryAll(root, '[data-uzu-accordion]').forEach((accordion) => {
      const disclosures = getScopedControls(accordion, '[data-uzu-disclosure]', '[data-uzu-accordion]');
      if (!disclosures.length) return;
      const allowMultiple = accordion.dataset.uzuAccordionMultiple === 'true';
      if (!allowMultiple) {
        let hasOpenDisclosure = false;
        disclosures.forEach((disclosure) => {
          if (!disclosure.classList.contains('is-open')) return;
          if (hasOpenDisclosure) setDisclosureState(disclosure, false, false);
          else hasOpenDisclosure = true;
        });
      }
      if (!markInitialized(accordion, 'Accordion')) return;
      disclosures.forEach((disclosure) => {
        disclosure.addEventListener('uzu-disclosure-change', (event) => {
          if (event.target !== disclosure) return;
          if (event.detail.open && !allowMultiple) {
            disclosures.forEach((item) => {
              if (item !== disclosure) setDisclosureState(item, false, false);
            });
          }
          accordion.dispatchEvent(new CustomEvent('uzu-accordion-change', {
            bubbles: true,
            detail: { accordion, disclosure, open: Boolean(event.detail.open) }
          }));
        });
      });
    });
  }

  function getHoverCardTrigger(card) {
    return card.querySelector('[data-uzu-hover-card-trigger], .uzu-hover-card-trigger');
  }

  function getHoverCardContent(card) {
    return card.querySelector('[data-uzu-hover-card-content], .uzu-hover-card-content');
  }

  function clearHoverCardTimer(card, store) {
    const timer = store.get(card);
    if (!timer) return;
    window.clearTimeout(timer);
    store.delete(card);
  }

  function setHoverCardState(card, open, emit = true) {
    const trigger = getHoverCardTrigger(card);
    const content = getHoverCardContent(card);
    if (!content) return;
    clearHoverCardTimer(card, hoverCardOpenTimers);
    clearHoverCardTimer(card, hoverCardCloseTimers);
    if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      content.hidden = false;
      card.classList.remove('is-closing');
      card.classList.add('is-open');
    } else if (card.classList.contains('is-open')) {
      card.classList.remove('is-open');
      card.classList.add('is-closing');
      const finish = () => {
        card.classList.remove('is-closing');
        content.hidden = true;
        hoverCardCloseTimers.delete(card);
      };
      const timer = scheduleAfterAnimation([content], finish);
      if (timer) hoverCardCloseTimers.set(card, timer);
    } else {
      card.classList.remove('is-closing');
      content.hidden = true;
    }
    if (emit) {
      card.dispatchEvent(new CustomEvent(open ? 'uzu-hover-card-open' : 'uzu-hover-card-close', {
        bubbles: true,
        detail: { hoverCard: card, trigger, content }
      }));
    }
  }

  function initHoverCards(root = document) {
    queryAll(root, '[data-uzu-hover-card]').forEach((card) => {
      const trigger = getHoverCardTrigger(card);
      const content = getHoverCardContent(card);
      if (!trigger || !content) return;
      const contentId = ensureId(content, 'uzu-hover-card-content');
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-expanded', card.classList.contains('is-open') ? 'true' : 'false');
      trigger.setAttribute('aria-controls', contentId);
      if (!card.classList.contains('is-open')) content.hidden = true;
      if (!markInitialized(card, 'HoverCard')) return;
      const openDelay = Number.isFinite(Number(card.dataset.uzuHoverCardDelay)) ? Number(card.dataset.uzuHoverCardDelay) : 120;
      const closeDelay = Number.isFinite(Number(card.dataset.uzuHoverCardCloseDelay)) ? Number(card.dataset.uzuHoverCardCloseDelay) : 120;
      const open = () => {
        clearHoverCardTimer(card, hoverCardCloseTimers);
        clearHoverCardTimer(card, hoverCardOpenTimers);
        const timer = window.setTimeout(() => setHoverCardState(card, true), openDelay);
        hoverCardOpenTimers.set(card, timer);
      };
      const close = () => {
        clearHoverCardTimer(card, hoverCardOpenTimers);
        clearHoverCardTimer(card, hoverCardCloseTimers);
        const timer = window.setTimeout(() => setHoverCardState(card, false), closeDelay);
        hoverCardCloseTimers.set(card, timer);
      };
      [trigger, content].forEach((element) => {
        element.addEventListener('mouseenter', open);
        element.addEventListener('mouseleave', close);
        element.addEventListener('focusin', open);
        element.addEventListener('focusout', close);
      });
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setHoverCardState(card, false);
          trigger.focus();
        }
      });
    });
  }
