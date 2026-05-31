  function closeToast(toast) {
    if (!toast || toast.classList.contains('is-dismissed')) return;
    toast.classList.add('is-dismissed');
    toast.dispatchEvent(new CustomEvent('uzu-toast-close', {
      bubbles: true,
      detail: { toast }
    }));
    const timer = scheduleAfterAnimation([toast], () => {
      toast.remove();
      toastCloseTimers.delete(toast);
    });
    if (timer) toastCloseTimers.set(toast, timer);
  }

  function initToasts(root = document) {
    queryAll(root, '[data-uzu-toast]').forEach((toast) => {
      if (!markInitialized(toast, 'Toast')) return;
      if (!toast.hasAttribute('role')) toast.setAttribute('role', 'status');
      if (!toast.hasAttribute('aria-live')) {
        toast.setAttribute('aria-live', toast.getAttribute('role') === 'alert' ? 'assertive' : 'polite');
      }
      if (!toast.hasAttribute('aria-atomic')) toast.setAttribute('aria-atomic', 'true');
      const timeout = Number(toast.dataset.uzuToastTimeout || 0);
      queryAll(toast, '[data-uzu-toast-close]').forEach((close) => {
        close.addEventListener('click', () => closeToast(toast));
      });
      if (timeout > 0) window.setTimeout(() => closeToast(toast), timeout);
    });
  }
