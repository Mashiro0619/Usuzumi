  function initTooltips(root = document) {
    queryAll(root, '[data-uzu-tooltip]').forEach((tooltip) => {
      if (tooltipNodes.has(tooltip)) return;
      if (tooltip.getAttribute('aria-describedby')) return;
      const text = tooltip.getAttribute('data-uzu-tooltip') || '';
      const id = tooltip.id || ensureId(tooltip, 'uzu-tooltip');
      const description = document.createElement('span');
      description.id = `${id}-desc`;
      description.className = 'uzu-sr-only';
      description.textContent = text;
      (document.body || document.documentElement).append(description);
      tooltip.setAttribute('aria-describedby', description.id);
      tooltipNodes.set(tooltip, description);
    });
  }
