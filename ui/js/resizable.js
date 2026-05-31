  function setSplitPaneSize(splitPane, size, emit = true) {
    const min = Number(splitPane.dataset.uzuSplitMin || 20);
    const max = Number(splitPane.dataset.uzuSplitMax || 80);
    const next = clampNumber(size, min, max);
    splitPane.style.setProperty('--uzu-split-primary-size', `${next}%`);
    splitPane.dataset.uzuSplitSize = String(next);
    const key = splitPane.dataset.uzuSplitKey;
    if (key) storage.set(`uzu-split:${key}`, String(next));
    queryAll(splitPane, '[data-uzu-split-resizer], .uzu-split-resizer').forEach((resizer) => {
      resizer.setAttribute('aria-valuenow', String(Math.round(next)));
    });
    if (emit) {
      splitPane.dispatchEvent(new CustomEvent('uzu-split-resize', {
        bubbles: true,
        detail: { splitPane, size: next }
      }));
    }
  }

  function initSplitPanes(root = document) {
    queryAll(root, '[data-uzu-split-pane]').forEach((splitPane) => {
      const resizer = splitPane.querySelector('[data-uzu-split-resizer], .uzu-split-resizer');
      if (!resizer) return;
      const orientation = splitPane.dataset.uzuSplitOrientation === 'vertical' ? 'vertical' : 'horizontal';
      splitPane.dataset.uzuSplitOrientation = orientation;
      resizer.setAttribute('role', 'separator');
      resizer.setAttribute('tabindex', resizer.getAttribute('tabindex') || '0');
      resizer.setAttribute('aria-orientation', orientation);
      const saved = splitPane.dataset.uzuSplitKey ? Number(storage.get(`uzu-split:${splitPane.dataset.uzuSplitKey}`)) : NaN;
      setSplitPaneSize(splitPane, Number.isFinite(saved) ? saved : Number(splitPane.dataset.uzuSplitSize || 50), false);
      if (!markInitialized(splitPane, 'SplitPane')) return;
      const getPointSize = (event) => {
        const rect = splitPane.getBoundingClientRect();
        const raw = orientation === 'vertical'
          ? ((event.clientY - rect.top) / rect.height) * 100
          : ((event.clientX - rect.left) / rect.width) * 100;
        return Number.isFinite(raw) ? raw : Number(splitPane.dataset.uzuSplitSize || 50);
      };
      const stopDrag = () => {
        splitPane.classList.remove('is-resizing');
        activePointerDrags.delete(resizer);
        document.removeEventListener('pointermove', moveDrag);
        document.removeEventListener('pointerup', stopDrag);
        document.removeEventListener('pointercancel', stopDrag);
      };
      const moveDrag = (event) => {
        event.preventDefault();
        setSplitPaneSize(splitPane, getPointSize(event));
      };
      resizer.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        if (activePointerDrags.has(resizer)) activePointerDrags.get(resizer)();
        splitPane.classList.add('is-resizing');
        activePointerDrags.set(resizer, stopDrag);
        if (resizer.setPointerCapture) {
          try { resizer.setPointerCapture(event.pointerId); } catch (_) {}
        }
        document.addEventListener('pointermove', moveDrag);
        document.addEventListener('pointerup', stopDrag, { once: true });
        document.addEventListener('pointercancel', stopDrag, { once: true });
      });
      resizer.addEventListener('lostpointercapture', stopDrag);
      resizer.addEventListener('keydown', (event) => {
        const keyMap = orientation === 'vertical'
          ? { ArrowUp: -2, ArrowDown: 2, Home: -100, End: 100 }
          : { ArrowLeft: -2, ArrowRight: 2, Home: -100, End: 100 };
        if (!(event.key in keyMap)) return;
        event.preventDefault();
        const current = Number(splitPane.dataset.uzuSplitSize || 50);
        const next = event.key === 'Home' ? Number(splitPane.dataset.uzuSplitMin || 20)
          : event.key === 'End' ? Number(splitPane.dataset.uzuSplitMax || 80)
            : current + keyMap[event.key];
        setSplitPaneSize(splitPane, next);
      });
    });
  }

  function setResizableSize(panel, width, height, emit = true) {
    const axis = panel.dataset.uzuResizableAxis || 'both';
    const minWidth = Number(panel.dataset.uzuResizableMinWidth || 160);
    const maxWidth = Number(panel.dataset.uzuResizableMaxWidth || 960);
    const minHeight = Number(panel.dataset.uzuResizableMinHeight || 100);
    const maxHeight = Number(panel.dataset.uzuResizableMaxHeight || 720);
    const nextWidth = clampNumber(width, minWidth, maxWidth);
    const nextHeight = clampNumber(height, minHeight, maxHeight);
    if (axis !== 'vertical') panel.style.setProperty('--uzu-resizable-width', `${nextWidth}px`);
    if (axis !== 'horizontal') panel.style.setProperty('--uzu-resizable-height', `${nextHeight}px`);
    panel.dataset.uzuResizableWidth = String(Math.round(nextWidth));
    panel.dataset.uzuResizableHeight = String(Math.round(nextHeight));
    const key = panel.dataset.uzuResizableKey;
    if (key) storage.set(`uzu-resizable:${key}`, `${Math.round(nextWidth)}:${Math.round(nextHeight)}`);
    if (emit) {
      panel.dispatchEvent(new CustomEvent('uzu-resizable-resize', {
        bubbles: true,
        detail: { resizable: panel, width: nextWidth, height: nextHeight }
      }));
    }
  }

  function initResizables(root = document) {
    queryAll(root, '[data-uzu-resizable]').forEach((panel) => {
      const handle = panel.querySelector('[data-uzu-resizable-handle], .uzu-resizable-handle');
      if (!handle) return;
      const rect = panel.getBoundingClientRect();
      const saved = panel.dataset.uzuResizableKey ? storage.get(`uzu-resizable:${panel.dataset.uzuResizableKey}`) : '';
      const [savedWidth, savedHeight] = String(saved || '').split(':').map(Number);
      setResizableSize(panel, Number.isFinite(savedWidth) ? savedWidth : Number(panel.dataset.uzuResizableWidth || rect.width || 320), Number.isFinite(savedHeight) ? savedHeight : Number(panel.dataset.uzuResizableHeight || rect.height || 180), false);
      handle.setAttribute('role', 'separator');
      handle.setAttribute('tabindex', handle.getAttribute('tabindex') || '0');
      if (!markInitialized(panel, 'Resizable')) return;
      let start = null;
      const move = (event) => {
        if (!start) return;
        event.preventDefault();
        setResizableSize(panel, start.width + event.clientX - start.x, start.height + event.clientY - start.y);
      };
      const stop = () => {
        panel.classList.remove('is-resizing');
        start = null;
        activePointerDrags.delete(handle);
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', stop);
        document.removeEventListener('pointercancel', stop);
      };
      handle.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        if (activePointerDrags.has(handle)) activePointerDrags.get(handle)();
        const bounds = panel.getBoundingClientRect();
        start = { x: event.clientX, y: event.clientY, width: bounds.width, height: bounds.height };
        panel.classList.add('is-resizing');
        activePointerDrags.set(handle, stop);
        if (handle.setPointerCapture) {
          try { handle.setPointerCapture(event.pointerId); } catch (_) {}
        }
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', stop, { once: true });
        document.addEventListener('pointercancel', stop, { once: true });
      });
      handle.addEventListener('lostpointercapture', stop);
      handle.addEventListener('keydown', (event) => {
        const currentWidth = Number(panel.dataset.uzuResizableWidth || panel.getBoundingClientRect().width);
        const currentHeight = Number(panel.dataset.uzuResizableHeight || panel.getBoundingClientRect().height);
        let width = currentWidth;
        let height = currentHeight;
        if (event.key === 'ArrowRight') width += 12;
        else if (event.key === 'ArrowLeft') width -= 12;
        else if (event.key === 'ArrowDown') height += 12;
        else if (event.key === 'ArrowUp') height -= 12;
        else return;
        event.preventDefault();
        setResizableSize(panel, width, height);
      });
    });
  }
